import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { put, list, del } from '@vercel/blob';
import { getInitialState } from './src/data/seedData.ts';
import { AppStateData } from './src/types.ts';

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// Memory cache of state
let currentState: AppStateData;

// Load persisted state or initialize with seed data
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    currentState = JSON.parse(raw);
    console.log('[Server] Loaded persisted state from data_store.json');
  } else {
    currentState = getInitialState();
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentState, null, 2), 'utf-8');
    console.log('[Server] Initialized default seed state in data_store.json');
  }
} catch (err) {
  console.error('[Server] Error loading data_store.json, resetting to seed data:', err);
  currentState = getInitialState();
}

// Helper to save state locally
function persistLocally(state: AppStateData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Error saving to data_store.json:', err);
  }
}

// Lazy Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      genAIClient = new GoogleGenAI({ apiKey });
    }
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      docks: currentState.docks.length,
      storageProvider: currentState.storageConfig.provider,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasBlobToken: !!(process.env.BLOB_READ_WRITE_TOKEN || currentState.storageConfig.vercelBlobToken),
    });
  });

  // Get full operational state
  app.get('/api/state', (req: Request, res: Response) => {
    res.json(currentState);
  });

  // Update state (e.g. from dock action, queue dispatch, or gate check-in)
  app.post('/api/state', (req: Request, res: Response) => {
    try {
      const incomingState = req.body as AppStateData;
      if (!incomingState || !Array.isArray(incomingState.docks)) {
        return res.status(400).json({ error: 'Estado inválido recebido.' });
      }
      currentState = incomingState;
      persistLocally(currentState);
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao atualizar estado: ' + err.message });
    }
  });

  // Reset to initial seed state
  app.post('/api/state/reset', (req: Request, res: Response) => {
    currentState = getInitialState();
    persistLocally(currentState);
    res.json({ success: true, state: currentState });
  });

  // Sync to Vercel Blob or generate cloud backup
  app.post('/api/storage/sync', async (req: Request, res: Response) => {
    const { provider, customToken } = req.body;
    const token = customToken || process.env.BLOB_READ_WRITE_TOKEN || currentState.storageConfig.vercelBlobToken;

    if (provider === 'vercel_blob') {
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token do Vercel Blob não configurado. Por favor, forneça o BLOB_READ_WRITE_TOKEN nas configurações de persistência.',
        });
      }

      try {
        const payload = JSON.stringify(currentState, null, 2);
        const fileName = `docasflow-snapshot-${Date.now()}.json`;
        const blobResult = await put(fileName, payload, {
          access: 'public',
          token,
          contentType: 'application/json',
        });

        // Register in backup history
        const backupRecord = {
          id: `bkp-blob-${Date.now()}`,
          timestamp: new Date().toISOString(),
          provider: 'vercel_blob' as const,
          recordCounts: {
            docks: currentState.docks.length,
            queue: currentState.queue.length,
            accessLogs: currentState.accessLogs.length,
            history: currentState.history.length,
          },
          sizeBytes: Buffer.byteLength(payload, 'utf-8'),
          notes: `Sincronizado no Vercel Blob: ${blobResult.url}`,
        };

        currentState.backupHistory.unshift(backupRecord);
        currentState.storageConfig.lastSyncTimestamp = new Date().toISOString();
        currentState.storageConfig.syncStatus = 'synced';
        currentState.storageConfig.provider = 'vercel_blob';
        persistLocally(currentState);

        return res.json({
          success: true,
          provider: 'vercel_blob',
          url: blobResult.url,
          backupRecord,
        });
      } catch (err: any) {
        return res.status(500).json({
          success: false,
          error: 'Falha ao sincronizar com Vercel Blob: ' + err.message,
        });
      }
    } else if (provider === 'google_drive') {
      // Google Drive sync representation
      const payload = JSON.stringify(currentState, null, 2);
      const backupRecord = {
        id: `bkp-gdrive-${Date.now()}`,
        timestamp: new Date().toISOString(),
        provider: 'google_drive' as const,
        recordCounts: {
          docks: currentState.docks.length,
          queue: currentState.queue.length,
          accessLogs: currentState.accessLogs.length,
          history: currentState.history.length,
        },
        sizeBytes: Buffer.byteLength(payload, 'utf-8'),
        notes: `Pacote de backup para Google Drive pronto para exportação/sincronização na pasta "${currentState.storageConfig.googleDriveFolderName || 'DocasFlow_Backups'}".`,
      };

      currentState.backupHistory.unshift(backupRecord);
      currentState.storageConfig.lastSyncTimestamp = new Date().toISOString();
      currentState.storageConfig.syncStatus = 'synced';
      currentState.storageConfig.provider = 'google_drive';
      persistLocally(currentState);

      return res.json({
        success: true,
        provider: 'google_drive',
        backupRecord,
        downloadPayload: payload,
      });
    } else {
      // Local persistent backup snapshot
      const payload = JSON.stringify(currentState, null, 2);
      const backupRecord = {
        id: `bkp-local-${Date.now()}`,
        timestamp: new Date().toISOString(),
        provider: 'local' as const,
        recordCounts: {
          docks: currentState.docks.length,
          queue: currentState.queue.length,
          accessLogs: currentState.accessLogs.length,
          history: currentState.history.length,
        },
        sizeBytes: Buffer.byteLength(payload, 'utf-8'),
        notes: 'Backup local gerado com sucesso no servidor.',
      };

      currentState.backupHistory.unshift(backupRecord);
      currentState.storageConfig.lastSyncTimestamp = new Date().toISOString();
      currentState.storageConfig.syncStatus = 'synced';
      currentState.storageConfig.provider = 'local';
      persistLocally(currentState);

      return res.json({
        success: true,
        provider: 'local',
        backupRecord,
      });
    }
  });

  // Restore state from a backup or import
  app.post('/api/storage/restore', (req: Request, res: Response) => {
    try {
      const { backupData } = req.body;
      if (!backupData || !backupData.docks) {
        return res.status(400).json({ error: 'Formato de arquivo de backup inválido.' });
      }
      currentState = backupData;
      persistLocally(currentState);
      res.json({ success: true, message: 'Dados restaurados com sucesso.', state: currentState });
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao restaurar: ' + err.message });
    }
  });

  // AI-powered Logistics Recommendations & Congestion Diagnosis
  app.post('/api/ai/optimize', async (req: Request, res: Response) => {
    try {
      const ai = getGenAI();
      const { occupancyRate, queueLength, delayedCount, activeOperationsSummary } = req.body;

      if (!ai) {
        // High quality deterministic logistics expert fallback if no GEMINI_API_KEY
        return res.json({
          source: 'heuristic_engine',
          recommendations: [
            {
              id: `rec-auto-${Date.now()}-1`,
              category: 'flow',
              title: 'Reescalonamento Imediato de Janelas de Descarregamento',
              description: `Com ocupação atual em ${occupancyRate}% e ${queueLength} veículos aguardando em pátio, recomenda-se desviar caminhões com carga fracionada para docas mistas (07, 08, 14) e priorizar descarregamentos com mais de 30 min de espera.`,
              impact: 'alto',
              suggestedAction: 'Notificar guarita para conter carretas acima de 30t até a liberação das Docas 01 e 04.',
              metricTrigger: `Fila atual: ${queueLength} veículos | Docas atrasadas: ${delayedCount}`,
              timestamp: new Date().toISOString(),
            },
            {
              id: `rec-auto-${Date.now()}-2`,
              category: 'docks',
              title: 'Força-Tarefa de Conferência nas Docas em Atraso',
              description: `Foram detectadas ${delayedCount} docas com tempo excedido do SLA operacional. A maior causa em transportadoras de médio e grande porte é a lentidão na validação de manifesto fiscal e conferência cega.`,
              impact: 'alto',
              suggestedAction: 'Alocar segundo conferente com coletor móvel para a doca com maior permanência.',
              metricTrigger: 'Permanência > SLA padrão de 45 minutos',
              timestamp: new Date().toISOString(),
            },
          ],
          executiveSummary: `Análise Logística: O pátio opera com taxa de ocupação de ${occupancyRate}%. Há ${queueLength} veículos na fila de espera e ${delayedCount} operações com estouro de janela. Ações prioritárias incluem liberar o nivelador da Doca 06 e agilizar a conferência de entrada.`,
        });
      }

      // Call Gemini 3.8 Flash for deep logistics consulting
      const prompt = `Você é um Engenheiro de Logística e Especialista em Operações de Centro de Distribuição / Transportadora (Supply Chain & Cross-Docking).
Analise os seguintes dados em tempo real de um terminal com 14 docas:
- Taxa de ocupação atual: ${occupancyRate}%
- Veículos na fila do pátio: ${queueLength}
- Docas com operação atrasada (estouro de SLA): ${delayedCount}
- Resumo de operações em andamento: ${JSON.stringify(activeOperationsSummary || {})}

Retorne um JSON estritamente formatado com o seguinte esquema:
{
  "executiveSummary": "Resumo executivo em 2 parágrafos em Português sobre os gargalos identificados e soluções prioritárias",
  "recommendations": [
    {
      "category": "flow" | "scheduling" | "docks" | "safety",
      "title": "Título conciso da boa prática",
      "description": "Explicação detalhada do gargalo e o porquê",
      "impact": "alto" | "medio" | "baixo",
      "suggestedAction": "Ação operacional prática e direta",
      "metricTrigger": "Gatilho métrico que causou a recomendação"
    }
  ]
}
Apenas retorne o JSON puro sem formatação markdown extra ou crases se possível.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      let parsed: any;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        // Strip code blocks if needed
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      // Add timestamps and ids
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        parsed.recommendations = parsed.recommendations.map((rec: any, idx: number) => ({
          ...rec,
          id: `rec-ai-${Date.now()}-${idx}`,
          timestamp: new Date().toISOString(),
        }));
      }

      return res.json({
        source: 'gemini_3.8_flash',
        ...parsed,
      });
    } catch (err: any) {
      console.error('[Server] Gemini AI optimization error:', err);
      return res.status(500).json({ error: 'Erro ao gerar análise com IA: ' + err.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DocasFlow] Servidor rodando com sucesso em http://0.0.0.0:${PORT}`);
  });
}

startServer();
