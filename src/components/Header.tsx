import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Clock, 
  AlertTriangle, 
  Cloud, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  Printer, 
  HardDrive,
  RefreshCw,
  Plus,
  UserCheck
} from 'lucide-react';
import { KPIMetrics, StorageConfig } from '../types.ts';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  kpis: KPIMetrics;
  storageConfig: StorageConfig;
  onOpenQuickEntry: () => void;
  onOpenStorageSettings: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  kpis,
  storageConfig,
  onOpenQuickEntry,
  onOpenStorageSettings,
  onTriggerSync,
  isSyncing,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Status color for congestion index
  const congestionBadge = {
    Fluido: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
    Moderado: 'bg-amber-500/15 text-amber-800 border-amber-300',
    Crítico: 'bg-rose-500/15 text-rose-800 border-rose-300 animate-pulse',
  }[kpis.congestionStatus];

  const providerLabel = {
    local: 'Persistência Local (Servidor)',
    vercel_blob: 'Vercel Blob Storage',
    google_drive: 'Google Drive Sync',
  }[storageConfig.provider];

  const navItems = [
    { id: 'docks', label: '14 Docas em Tempo Real', icon: Layers, count: `${kpis.occupiedDocks}/14` },
    { id: 'queue', label: 'Fila Inteligente', icon: Truck, count: kpis.queueCount > 0 ? kpis.queueCount : undefined },
    { id: 'gate', label: 'Portaria & Acessos', icon: ShieldCheck },
    { id: 'kpis', label: 'KPIs & Desempenho', icon: BarChart3 },
    { id: 'advisor', label: 'Boas Práticas & IA', icon: Sparkles, highlight: true },
    { id: 'reports', label: 'Relatórios (PDF)', icon: Printer },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner with Terminal Stats & Operations Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
        {/* Brand & Terminal Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-tight text-white text-base">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/40">
              <Truck className="h-5 w-5" />
            </div>
            <span>DocasFlow</span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Hub Logístico Central • 14 Docas
          </span>

          {/* Responsável Técnico Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-200 border border-blue-700/60 shadow-xs">
            <UserCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">Resp. Técnico:</span>
            <span className="font-bold text-white text-xs">Alessandro Luís Santos</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 text-slate-400 pl-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Live Operational Health Bar */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs">
          {/* Occupancy Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
            <span className="text-slate-400">Ocupação:</span>
            <span className="font-semibold text-slate-100">{kpis.occupancyRate}%</span>
            <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden ml-1">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  kpis.occupancyRate > 85 ? 'bg-rose-500' : kpis.occupancyRate > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${kpis.occupancyRate}%` }}
              />
            </div>
          </div>

          {/* Congestion Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${congestionBadge}`}>
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Fluxo: {kpis.congestionStatus}</span>
            <span className="text-[10px] opacity-80">({kpis.congestionIndex}%)</span>
          </div>

          {/* Active Delays Warning */}
          {kpis.delayedDocksCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              <span className="font-semibold">{kpis.delayedDocksCount} {kpis.delayedDocksCount === 1 ? 'doca em atraso' : 'docas em atraso'}</span>
            </div>
          )}

          {/* Storage & Sync Status Indicator */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              id="header-storage-button"
              onClick={onOpenStorageSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Configurações de Armazenamento (Google Drive / Vercel Blob / Local)"
            >
              <HardDrive className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">{providerLabel}</span>
              <span className="sm:hidden">Nuvem</span>
            </button>

            <button
              id="header-sync-now-button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-50 cursor-pointer"
              title="Sincronizar agora"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Fast Vehicle Entry Button */}
          <button
            id="header-quick-entry-button"
            onClick={onOpenQuickEntry}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nova Entrada</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${item.highlight && !isActive ? 'ring-1 ring-amber-500/40 text-amber-200' : ''}`}
              >
                <Icon className={`h-4 w-4 ${item.highlight && !isActive ? 'text-amber-400' : ''}`} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
