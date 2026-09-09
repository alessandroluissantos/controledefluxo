import React, { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  BrainCircuit,
  Sliders,
  TrendingDown
} from 'lucide-react';
import { LogisticsRecommendation, OperationalAlert, KPIMetrics, Dock } from '../types.ts';

interface LogisticsAdvisorProps {
  recommendations: LogisticsRecommendation[];
  alerts: OperationalAlert[];
  kpis: KPIMetrics;
  docks: Dock[];
  onTriggerAiDiagnosis: () => Promise<void>;
  isLoadingAi: boolean;
  aiExecutiveSummary?: string;
}

export const LogisticsAdvisor: React.FC<LogisticsAdvisorProps> = ({
  recommendations,
  alerts,
  kpis,
  docks,
  onTriggerAiDiagnosis,
  isLoadingAi,
  aiExecutiveSummary,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRecs = recommendations.filter((rec) => {
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false;
    return true;
  });

  const categoryBadges = {
    flow: { label: 'Fluxo & Pátio', color: 'bg-blue-100 text-blue-800' },
    scheduling: { label: 'Janelas & Agendamento', color: 'bg-indigo-100 text-indigo-800' },
    docks: { label: 'Docas & Niveladores', color: 'bg-purple-100 text-purple-800' },
    safety: { label: 'Portaria & Segurança', color: 'bg-emerald-100 text-emerald-800' },
  };

  const impactBadges = {
    alto: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    medio: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    baixo: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <div className="space-y-6">
      {/* AI Consulting & Optimization Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Inteligência de Supply Chain & Cross-Docking
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Consultor de Boas Práticas & Resolução de Gargalos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Algoritmos analíticos avaliam em tempo real o histórico de permanência das 14 docas, horários de pico e taxa de congestionamento, emitindo planos de ação práticos para o encarregado do depósito.
          </p>
        </div>

        <button
          id="btn-trigger-ai-diagnosis"
          onClick={onTriggerAiDiagnosis}
          disabled={isLoadingAi}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2.5 shadow-lg shadow-blue-900/40 transition disabled:opacity-50 cursor-pointer flex-shrink-0"
        >
          <BrainCircuit className={`h-4 w-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
          <span>{isLoadingAi ? 'Analisando Gargalos...' : 'Consultar Diagnóstico com IA'}</span>
        </button>
      </div>

      {/* Gemini AI Executive Analysis (if loaded) */}
      {aiExecutiveSummary && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Parecer Executivo de Operações (Gemini 3.8 Flash)</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {aiExecutiveSummary}
          </p>
        </div>
      )}

      {/* Active Operational Bottleneck Alerts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h3 className="font-bold text-slate-900 text-sm">Alertas Operacionais Ativos no Pátio ({alerts.length})</h3>
          </div>
          <span className="text-xs text-slate-400">Atualização em tempo real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                  : 'bg-blue-50/60 border-blue-200 text-blue-900'
              }`}
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  alert.severity === 'critical'
                    ? 'bg-rose-200 text-rose-800'
                    : alert.severity === 'warning'
                    ? 'bg-amber-200 text-amber-800'
                    : 'bg-blue-200 text-blue-800'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{alert.title}</span>
                  {alert.dockId && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                      Doca {alert.dockId}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-snug">{alert.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter for Best Practice Suggestions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filtrar por Categoria:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas ({recommendations.length})
          </button>
          <button
            onClick={() => setSelectedCategory('flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'flow'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            Fluxo & Pátio
          </button>
          <button
            onClick={() => setSelectedCategory('docks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'docks'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}
          >
            Docas
          </button>
          <button
            onClick={() => setSelectedCategory('scheduling')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'scheduling'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            Janelas
          </button>
          <button
            onClick={() => setSelectedCategory('safety')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'safety'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            Portaria
          </button>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec) => {
          const cat = categoryBadges[rec.category] || { label: rec.category, color: 'bg-slate-100 text-slate-700' };

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${cat.color}`}>
                    {cat.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Impacto:</span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md border ${impactBadges[rec.impact]}`}>
                      {rec.impact}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                {/* Practical Recommended Action */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    <span>Ação Recomendada:</span>
                  </div>
                  <p className="text-slate-700 text-xs">{rec.suggestedAction}</p>
                </div>

                {/* Metric Trigger Tag */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Gatilho: {rec.metricTrigger}</span>
                  <span>{new Date(rec.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
