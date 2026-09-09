import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  History,
  FolderArchive,
  Lock,
  Key
} from 'lucide-react';
import { StorageConfig, BackupRecord, StorageProviderType, AppStateData } from '../types.ts';

interface StoragePersistenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageConfig: StorageConfig;
  backupHistory: BackupRecord[];
  currentState: AppStateData;
  onSaveStorageConfig: (config: StorageConfig) => void;
  onTriggerSync: (provider: StorageProviderType) => Promise<void>;
  onRestoreBackup: (backupData: AppStateData) => Promise<void>;
  isSyncing: boolean;
}

export const StoragePersistenceModal: React.FC<StoragePersistenceModalProps> = ({
  isOpen,
  onClose,
  storageConfig,
  backupHistory,
  currentState,
  onSaveStorageConfig,
  onTriggerSync,
  onRestoreBackup,
  isSyncing,
}) => {
  if (!isOpen) return null;

  const [provider, setProvider] = useState<StorageProviderType>(storageConfig.provider);
  const [vercelBlobToken, setVercelBlobToken] = useState(storageConfig.vercelBlobToken || '');
  const [googleDriveFolder, setGoogleDriveFolder] = useState(storageConfig.googleDriveFolderName || 'DocasFlow_Backups');
  const [autoSync, setAutoSync] = useState(storageConfig.autoSyncEnabled);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStorageConfig({
      ...storageConfig,
      provider,
      vercelBlobToken,
      googleDriveFolderName: googleDriveFolder,
      autoSyncEnabled: autoSync,
    });
    setSyncMessage('Configurações de persistência salvas com sucesso!');
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `docasflow-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.docks || !Array.isArray(parsed.docks)) {
          alert('Arquivo inválido: não contém a estrutura de docas esperada.');
          return;
        }
        await onRestoreBackup(parsed);
        alert('Backup importado e restaurado com sucesso!');
        onClose();
      } catch (err: any) {
        alert('Erro ao carregar arquivo de backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Persistência & Armazenamento em Nuvem
              </h2>
              <p className="text-xs text-slate-500">
                Configure sincronização com Google Drive, Vercel Blob ou Servidor Local
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 text-slate-700 text-xs">
          {syncMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Provider Selection */}
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 text-sm mb-2">
                Selecione o Provedor de Armazenamento Principal:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Vercel Blob */}
                <div
                  onClick={() => setProvider('vercel_blob')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    provider === 'vercel_blob'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Vercel Blob</span>
                      <Cloud className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Armazenamento de alta performance em Blob Storage na nuvem Vercel.
                    </p>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold pt-2">
                    {provider === 'vercel_blob' ? '✓ Selecionado' : 'Selecionar'}
                  </span>
                </div>

                {/* Option 2: Google Drive */}
                <div
                  onClick={() => setProvider('google_drive')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    provider === 'google_drive'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Google Drive</span>
                      <FolderArchive className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Exportação e sincronização de backups em pasta do Google Drive.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold pt-2">
                    {provider === 'google_drive' ? '✓ Selecionado' : 'Selecionar'}
                  </span>
                </div>

                {/* Option 3: Local Persistent Server Storage */}
                <div
                  onClick={() => setProvider('local')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    provider === 'local'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Servidor Local</span>
                      <Database className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Persistência estruturada em disco (data_store.json) no backend Express.
                    </p>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-semibold pt-2">
                    {provider === 'local' ? '✓ Selecionado' : 'Selecionar'}
                  </span>
                </div>
              </div>
            </div>

            {/* Provider Specific Settings */}
            {provider === 'vercel_blob' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Key className="h-3.5 w-3.5 text-blue-600" />
                  <span>Configuração do Vercel Blob Token</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Insira o seu <code className="bg-slate-200 px-1 rounded">BLOB_READ_WRITE_TOKEN</code> ou deixe em branco se já estiver configurado nas variáveis de ambiente do projeto.
                </p>
                <input
                  type="password"
                  placeholder="vercel_blob_rw_..."
                  value={vercelBlobToken}
                  onChange={(e) => setVercelBlobToken(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                />
              </div>
            )}

            {provider === 'google_drive' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <FolderArchive className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Nome da Pasta de Destino no Google Drive</span>
                </div>
                <input
                  type="text"
                  value={googleDriveFolder}
                  onChange={(e) => setGoogleDriveFolder(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            )}

            {/* Auto-sync Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Sincronização Automática</span>
                <span className="text-[11px] text-slate-500">
                  Grava instantaneamente cada alteração de doca, fila ou portaria no provedor selecionado
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Salvar Preferências
              </button>

              <button
                type="button"
                onClick={() => onTriggerSync(provider)}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
              </button>
            </div>
          </form>

          {/* Backup Snapshots History & Manual Export/Import */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <History className="h-4 w-4 text-blue-600" />
                Histórico de Backups & Snapshots
              </h3>

              <div className="flex items-center gap-2">
                {/* Export JSON Button */}
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Baixar backup local em arquivo .json"
                >
                  <Download className="h-3 w-3" />
                  <span>Baixar JSON</span>
                </button>

                {/* Import JSON file */}
                <label className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer">
                  <Upload className="h-3 w-3" />
                  <span>Restaurar JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {backupHistory.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  Nenhum snapshot de backup registrado ainda.
                </div>
              ) : (
                backupHistory.map((bkp) => (
                  <div key={bkp.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{bkp.id}</span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {bkp.provider}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{bkp.notes || 'Backup de dados operacionais'}</p>
                      <span className="text-[10px] text-slate-400">
                        {bkp.recordCounts.docks} docas • {bkp.recordCounts.queue} fila • {bkp.recordCounts.accessLogs} portaria • {(bkp.sizeBytes / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-500">
                      <span>{new Date(bkp.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
