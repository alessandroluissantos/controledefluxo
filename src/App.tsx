import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { DocksGrid } from './components/DocksGrid.tsx';
import { DockModal } from './components/DockModal.tsx';
import { SmartQueue } from './components/SmartQueue.tsx';
import { VehicleAccessGate } from './components/VehicleAccessGate.tsx';
import { KpiDashboard } from './components/KpiDashboard.tsx';
import { LogisticsAdvisor } from './components/LogisticsAdvisor.tsx';
import { PrintableReports } from './components/PrintableReports.tsx';
import { StoragePersistenceModal } from './components/StoragePersistenceModal.tsx';
import { QuickEntryModal } from './components/QuickEntryModal.tsx';
import { getInitialState } from './data/seedData.ts';
import { calculateKPIMetrics, getElapsedMinutes } from './utils/kpiCalculator.ts';
import { 
  AppStateData, 
  Dock, 
  QueueItem, 
  AccessLog, 
  MovementHistory, 
  StorageConfig, 
  StorageProviderType,
  PermissionStatus
} from './types.ts';

export default function App() {
  const [state, setState] = useState<AppStateData>(() => getInitialState());
  const [activeTab, setActiveTab] = useState<string>('docks');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiExecutiveSummary, setAiExecutiveSummary] = useState<string | undefined>();

  // Modals state
  const [selectedDock, setSelectedDock] = useState<Dock | null>(null);
  const [isDockModalOpen, setIsDockModalOpen] = useState<boolean>(false);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState<boolean>(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);

  // Fetch initial state from server
  useEffect(() => {
    async function fetchState() {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.docks)) {
            setState(data);
          }
        }
      } catch (err) {
        console.warn('Usando estado inicial offline/local:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchState();
  }, []);

  // Helper to persist state back to server API
  const persistState = async (newState: AppStateData) => {
    setState(newState);
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
    } catch (err) {
      console.error('Erro ao persistir no servidor:', err);
    }
  };

  // Live KPI calculation
  const kpis = useMemo(() => calculateKPIMetrics(state), [state]);

  // Operations: Release Dock
  const handleReleaseDock = (dockId: number) => {
    const targetDock = state.docks.find((d) => d.id === dockId);
    if (!targetDock || !targetDock.currentOperation) return;

    const op = targetDock.currentOperation;
    const elapsed = getElapsedMinutes(op.startTime);
    const exceeded = elapsed > op.standardDurationMinutes;
    const delay = exceeded ? elapsed - op.standardDurationMinutes : 0;
    const effScore = Math.max(50, Math.min(100, Math.round((op.standardDurationMinutes / Math.max(1, elapsed)) * 100)));

    const newHistoryRecord: MovementHistory = {
      id: `hist-${Date.now()}`,
      dockId: targetDock.id,
      dockName: targetDock.name,
      licensePlate: op.licensePlate,
      driverName: op.driverName,
      carrier: op.carrier,
      vehicleType: op.vehicleType,
      operationType: op.operationType,
      cargoDescription: op.cargoType,
      volumeCount: op.volumeCount,
      weightKg: op.weightKg,
      invoiceNumber: op.invoiceNumber,
      entryTime: op.startTime,
      startTime: op.startTime,
      endTime: new Date().toISOString(),
      durationMinutes: elapsed,
      standardDurationMinutes: op.standardDurationMinutes,
      exceededTime: exceeded,
      delayMinutes: delay,
      efficiencyScore: effScore,
      completedBy: 'Operador Logístico',
    };

    const updatedDocks = state.docks.map((d) => {
      if (d.id === dockId) {
        return {
          ...d,
          status: 'available' as const,
          currentOperation: undefined,
        };
      }
      return d;
    });

    const updatedHistory = [newHistoryRecord, ...state.history];

    persistState({
      ...state,
      docks: updatedDocks,
      history: updatedHistory,
    });
  };

  // Operations: Assign Queue Item to Dock
  const handleAssignQueueItem = (dockId: number, queueItemId: string) => {
    const queueItem = state.queue.find((q) => q.id === queueItemId);
    if (!queueItem) return;

    const updatedDocks = state.docks.map((d) => {
      if (d.id === dockId) {
        return {
          ...d,
          status: 'occupied' as const,
          currentOperation: {
            id: `op-${Date.now()}`,
            vehicleId: `veh-${Date.now()}`,
            licensePlate: queueItem.licensePlate,
            driverName: queueItem.driverName,
            driverDoc: queueItem.driverDoc,
            carrier: queueItem.carrier,
            vehicleType: queueItem.vehicleType,
            operationType: queueItem.operationType,
            cargoType: queueItem.cargoDescription,
            volumeCount: queueItem.volumeCount,
            weightKg: queueItem.weightKg,
            invoiceNumber: queueItem.invoiceNumber,
            startTime: new Date().toISOString(),
            standardDurationMinutes: queueItem.estimatedDurationMinutes || 45,
            cargoProgressPercent: 5,
            notes: 'Despachado automaticamente da fila do pátio',
          },
        };
      }
      return d;
    });

    // Remove or mark docked from queue
    const updatedQueue = state.queue.filter((q) => q.id !== queueItemId);

    persistState({
      ...state,
      docks: updatedDocks,
      queue: updatedQueue,
    });
  };

  // Operations: Direct Manual Dock Assignment
  const handleManualAssign = (dockId: number, opData: any) => {
    const updatedDocks = state.docks.map((d) => {
      if (d.id === dockId) {
        return {
          ...d,
          status: 'occupied' as const,
          currentOperation: {
            id: `op-${Date.now()}`,
            vehicleId: `veh-${Date.now()}`,
            licensePlate: opData.licensePlate,
            driverName: opData.driverName,
            driverDoc: opData.driverDoc || '000.000.000-00',
            carrier: opData.carrier || 'Transportadora Geral',
            vehicleType: opData.vehicleType,
            operationType: opData.operationType,
            cargoType: opData.cargoType,
            volumeCount: opData.volumeCount,
            weightKg: opData.weightKg,
            invoiceNumber: opData.invoiceNumber,
            startTime: new Date().toISOString(),
            standardDurationMinutes: opData.standardDurationMinutes || 45,
            cargoProgressPercent: 10,
            notes: opData.notes,
          },
        };
      }
      return d;
    });

    // Also record portaria access automatically
    const newAccess: AccessLog = {
      id: `acc-${Date.now()}`,
      licensePlate: opData.licensePlate,
      driverName: opData.driverName,
      driverDoc: opData.driverDoc || '000.000.000-00',
      carrier: opData.carrier,
      vehicleType: opData.vehicleType,
      permissionStatus: 'authorized',
      entryTime: new Date().toISOString(),
      badgeNumber: 'CRA-' + Math.floor(100 + Math.random() * 900),
      reason: `Operação Direta Doca ${dockId}`,
      gateNumber: 'Portaria Principal - P1',
      authorizedBy: 'Operador Logístico',
      inspectionPassed: true,
    };

    persistState({
      ...state,
      docks: updatedDocks,
      accessLogs: [newAccess, ...state.accessLogs],
    });
  };

  // Operations: Toggle Maintenance Mode
  const handleToggleMaintenance = (dockId: number) => {
    const updatedDocks = state.docks.map((d) => {
      if (d.id === dockId) {
        const nextStatus = d.status === 'maintenance' ? ('available' as const) : ('maintenance' as const);
        return {
          ...d,
          status: nextStatus,
          currentOperation: undefined,
          notes: nextStatus === 'maintenance' ? 'Bloqueio preventivo de segurança' : undefined,
        };
      }
      return d;
    });

    persistState({
      ...state,
      docks: updatedDocks,
    });
  };

  // Operations: Update Cargo Progress
  const handleUpdateProgress = (dockId: number, progress: number) => {
    const updatedDocks = state.docks.map((d) => {
      if (d.id === dockId && d.currentOperation) {
        return {
          ...d,
          currentOperation: {
            ...d.currentOperation,
            cargoProgressPercent: progress,
          },
        };
      }
      return d;
    });

    persistState({
      ...state,
      docks: updatedDocks,
    });
  };

  // Operations: Add to Queue
  const handleAddToQueue = (itemData: Omit<QueueItem, 'id' | 'arrivalTime' | 'status'>) => {
    const newItem: QueueItem = {
      ...itemData,
      id: `q-${Date.now()}`,
      arrivalTime: new Date().toISOString(),
      status: 'waiting',
    };

    // Also register in Gate Access logs
    const newAccess: AccessLog = {
      id: `acc-${Date.now()}`,
      licensePlate: itemData.licensePlate,
      driverName: itemData.driverName,
      driverDoc: itemData.driverDoc,
      carrier: itemData.carrier,
      vehicleType: itemData.vehicleType,
      permissionStatus: 'authorized',
      entryTime: new Date().toISOString(),
      badgeNumber: 'CRA-' + Math.floor(100 + Math.random() * 900),
      reason: 'Aguardando Fila de Triagem',
      gateNumber: 'Portaria Principal - P1',
      authorizedBy: 'Portaria Entrada',
      inspectionPassed: true,
    };

    persistState({
      ...state,
      queue: [newItem, ...state.queue],
      accessLogs: [newAccess, ...state.accessLogs],
    });
  };

  // Operations: Remove from Queue
  const handleRemoveFromQueue = (queueId: string) => {
    const updatedQueue = state.queue.filter((q) => q.id !== queueId);
    persistState({
      ...state,
      queue: updatedQueue,
    });
  };

  // Operations: Register Gate Access
  const handleRegisterAccess = (logData: Omit<AccessLog, 'id' | 'entryTime'>) => {
    const newLog: AccessLog = {
      ...logData,
      id: `acc-${Date.now()}`,
      entryTime: new Date().toISOString(),
    };

    persistState({
      ...state,
      accessLogs: [newLog, ...state.accessLogs],
    });
  };

  // Operations: Register Gate Exit
  const handleRegisterExit = (logId: string) => {
    const updatedLogs = state.accessLogs.map((log) => {
      if (log.id === logId) {
        return {
          ...log,
          exitTime: new Date().toISOString(),
        };
      }
      return log;
    });

    persistState({
      ...state,
      accessLogs: updatedLogs,
    });
  };

  // Operations: Update Permission Status
  const handleUpdatePermission = (logId: string, status: PermissionStatus, passedInspection: boolean) => {
    const updatedLogs = state.accessLogs.map((log) => {
      if (log.id === logId) {
        return {
          ...log,
          permissionStatus: status,
          inspectionPassed: passedInspection,
        };
      }
      return log;
    });

    persistState({
      ...state,
      accessLogs: updatedLogs,
    });
  };

  // Storage: Save Config
  const handleSaveStorageConfig = (config: StorageConfig) => {
    persistState({
      ...state,
      storageConfig: config,
    });
  };

  // Storage: Trigger Cloud / Local Sync
  const handleTriggerSync = async (provider: StorageProviderType) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/storage/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();
      if (data.success && data.backupRecord) {
        setState((prev) => ({
          ...prev,
          backupHistory: [data.backupRecord, ...prev.backupHistory],
          storageConfig: {
            ...prev.storageConfig,
            lastSyncTimestamp: new Date().toISOString(),
            syncStatus: 'synced',
            provider,
          },
        }));
      }
    } catch (err) {
      console.error('Erro na sincronização:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Storage: Restore Entire State
  const handleRestoreBackup = async (backupData: AppStateData) => {
    try {
      const res = await fetch('/api/storage/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupData }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
      }
    } catch (err) {
      console.error('Erro ao restaurar backup:', err);
    }
  };

  // AI Consulting / Gemini Diagnosis
  const handleTriggerAiDiagnosis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupancyRate: kpis.occupancyRate,
          queueLength: kpis.queueCount,
          delayedCount: kpis.delayedDocksCount,
          activeOperationsSummary: state.docks
            .filter((d) => d.status === 'occupied' && d.currentOperation)
            .map((d) => ({
              dock: d.name,
              plate: d.currentOperation?.licensePlate,
              op: d.currentOperation?.operationType,
              progress: d.currentOperation?.cargoProgressPercent,
            })),
        }),
      });

      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setState((prev) => ({
          ...prev,
          recommendations: [...data.recommendations, ...prev.recommendations],
        }));
      }
      if (data.executiveSummary) {
        setAiExecutiveSummary(data.executiveSummary);
      }
    } catch (err) {
      console.error('Erro ao chamar consultoria IA:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpis={kpis}
        storageConfig={state.storageConfig}
        onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
        onOpenStorageSettings={() => setIsStorageModalOpen(true)}
        onTriggerSync={() => handleTriggerSync(state.storageConfig.provider)}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab 1: 14 Docks Grid */}
        {activeTab === 'docks' && (
          <DocksGrid
            docks={state.docks}
            onSelectDock={(dock) => {
              setSelectedDock(dock);
              setIsDockModalOpen(true);
            }}
            onReleaseDock={handleReleaseDock}
            onOpenAssignModal={(dock) => {
              setSelectedDock(dock);
              setIsDockModalOpen(true);
            }}
            onToggleMaintenance={handleToggleMaintenance}
          />
        )}

        {/* Tab 2: Smart Queue */}
        {activeTab === 'queue' && (
          <SmartQueue
            queue={state.queue}
            docks={state.docks}
            onDispatchToDock={(queueId, dockId) => handleAssignQueueItem(dockId, queueId)}
            onAddToQueue={handleAddToQueue}
            onRemoveFromQueue={handleRemoveFromQueue}
          />
        )}

        {/* Tab 3: Gate & Access Control */}
        {activeTab === 'gate' && (
          <VehicleAccessGate
            accessLogs={state.accessLogs}
            onRegisterAccess={handleRegisterAccess}
            onRegisterExit={handleRegisterExit}
            onUpdatePermission={handleUpdatePermission}
          />
        )}

        {/* Tab 4: KPIs & Performance Analytics */}
        {activeTab === 'kpis' && (
          <KpiDashboard kpis={kpis} history={state.history} />
        )}

        {/* Tab 5: Logistics Advisor & AI Bottleneck Resolution */}
        {activeTab === 'advisor' && (
          <LogisticsAdvisor
            recommendations={state.recommendations}
            alerts={state.alerts}
            kpis={kpis}
            docks={state.docks}
            onTriggerAiDiagnosis={handleTriggerAiDiagnosis}
            isLoadingAi={isLoadingAi}
            aiExecutiveSummary={aiExecutiveSummary}
          />
        )}

        {/* Tab 6: Printable Reports */}
        {activeTab === 'reports' && (
          <PrintableReports
            history={state.history}
            kpis={kpis}
            accessLogs={state.accessLogs}
            docks={state.docks}
          />
        )}
      </main>

      {/* Modals */}
      <DockModal
        dock={selectedDock}
        queue={state.queue}
        isOpen={isDockModalOpen}
        onClose={() => {
          setIsDockModalOpen(false);
          setSelectedDock(null);
        }}
        onAssignQueueItem={handleAssignQueueItem}
        onManualAssign={handleManualAssign}
        onUpdateProgress={handleUpdateProgress}
        onReleaseDock={handleReleaseDock}
        onToggleMaintenance={handleToggleMaintenance}
      />

      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        docks={state.docks}
        onDirectDock={handleManualAssign}
        onSendToQueue={handleAddToQueue}
      />

      <StoragePersistenceModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        storageConfig={state.storageConfig}
        backupHistory={state.backupHistory}
        currentState={state}
        onSaveStorageConfig={handleSaveStorageConfig}
        onTriggerSync={handleTriggerSync}
        onRestoreBackup={handleRestoreBackup}
        isSyncing={isSyncing}
      />
    </div>
  );
}
