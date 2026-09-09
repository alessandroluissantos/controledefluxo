import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  User, 
  Package, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import { Dock, QueueItem, VehicleCategory, OperationType } from '../types.ts';
import { getElapsedMinutes, formatMinutes } from '../utils/kpiCalculator.ts';

interface DockModalProps {
  dock: Dock | null;
  queue: QueueItem[];
  isOpen: boolean;
  onClose: () => void;
  onAssignQueueItem: (dockId: number, queueItemId: string) => void;
  onManualAssign: (dockId: number, operationData: any) => void;
  onUpdateProgress: (dockId: number, progressPercent: number) => void;
  onReleaseDock: (dockId: number) => void;
  onToggleMaintenance: (dockId: number) => void;
}

export const DockModal: React.FC<DockModalProps> = ({
  dock,
  queue,
  isOpen,
  onClose,
  onAssignQueueItem,
  onManualAssign,
  onUpdateProgress,
  onReleaseDock,
  onToggleMaintenance,
}) => {
  if (!isOpen || !dock) return null;

  const op = dock.currentOperation;
  const elapsed = op ? getElapsedMinutes(op.startTime) : 0;
  const isDelayed = op ? elapsed > op.standardDurationMinutes : false;

  // State for manual new allocation form
  const [useManualForm, setUseManualForm] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState<string>('');
  
  const [manualPlate, setManualPlate] = useState('');
  const [manualDriver, setManualDriver] = useState('');
  const [manualCarrier, setManualCarrier] = useState('');
  const [manualVehicleType, setManualVehicleType] = useState<VehicleCategory>('carreta');
  const [manualOpType, setManualOpType] = useState<OperationType>(dock.type === 'carga' ? 'carga' : 'descarga');
  const [manualCargo, setManualCargo] = useState('Cargas Gerais e Paletes');
  const [manualVolumes, setManualVolumes] = useState(250);
  const [manualWeightKg, setManualWeightKg] = useState(12000);
  const [manualInvoice, setManualInvoice] = useState('NF-' + Math.floor(10000 + Math.random() * 90000));
  const [manualDuration, setManualDuration] = useState(45);

  const eligibleQueue = queue.filter((q) => q.status === 'waiting');

  const handleQueueAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueId) return;
    onAssignQueueItem(dock.id, selectedQueueId);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlate || !manualDriver) return;

    onManualAssign(dock.id, {
      licensePlate: manualPlate.toUpperCase(),
      driverName: manualDriver,
      driverDoc: '000.000.000-00',
      carrier: manualCarrier || 'Transportadora Parceira',
      vehicleType: manualVehicleType,
      operationType: manualOpType === 'misto' ? 'descarga' : manualOpType,
      cargoType: manualCargo,
      volumeCount: Number(manualVolumes) || 100,
      weightKg: Number(manualWeightKg) || 5000,
      invoiceNumber: manualInvoice,
      standardDurationMinutes: Number(manualDuration) || 45,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {dock.id.toString().padStart(2, '0')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{dock.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">{dock.code}</span>
                <span>•</span>
                <span className="capitalize font-semibold text-blue-700">{dock.type}</span>
                <span>•</span>
                <span>Capacidade: {dock.maxWeightTons}t</span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-dock-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-slate-700 text-sm">
          {dock.status === 'occupied' && op ? (
            /* ACTIVE OPERATION VIEW */
            <div className="space-y-4">
              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block">
                    Operação em Andamento ({op.operationType})
                  </span>
                  <p className="text-lg font-mono font-bold text-slate-900">{op.licensePlate}</p>
                  <p className="text-xs text-slate-600 font-medium">{op.carrier}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Tempo em Doca</span>
                  <span className={`text-base font-bold ${isDelayed ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatMinutes(elapsed)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">SLA: {op.standardDurationMinutes} min</span>
                </div>
              </div>

              {isDelayed && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-3 text-xs">
                  <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Atenção: Tempo Padrão Excedido</span>
                    <span>
                      Esta operação ultrapassou o SLA em {elapsed - op.standardDurationMinutes} minutos. Recomenda-se priorizar conferência.
                    </span>
                  </div>
                </div>
              )}

              {/* Driver & Logistics Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Motorista</span>
                  <span className="font-semibold text-slate-800">{op.driverName}</span>
                  <span className="text-[10px] text-slate-500 block font-mono">Doc: {op.driverDoc}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tipo de Veículo</span>
                  <span className="font-semibold uppercase text-slate-800">{op.vehicleType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Carga & Volumes</span>
                  <span className="font-semibold text-slate-800">{op.volumeCount} volumes</span>
                  <span className="text-[10px] text-slate-500 block">{op.cargoType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Peso & Documento</span>
                  <span className="font-semibold text-slate-800">{(op.weightKg / 1000).toFixed(1)} toneladas</span>
                  <span className="text-[10px] text-slate-500 block font-mono">{op.invoiceNumber}</span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Atualizar Progresso de {op.operationType}</span>
                  <span className="font-bold text-blue-600">{op.cargoProgressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={op.cargoProgressPercent}
                  onChange={(e) => onUpdateProgress(dock.id, Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Início</span>
                  <span>50% Conferido</span>
                  <span>100% Concluído</span>
                </div>
              </div>

              {/* Actions for occupied dock */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  id="modal-btn-finish-op"
                  onClick={() => {
                    onReleaseDock(dock.id);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Concluir Operação e Liberar Doca</span>
                </button>

                <button
                  id="modal-btn-set-maint"
                  onClick={() => {
                    onToggleMaintenance(dock.id);
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Bloquear Doca</span>
                </button>
              </div>
            </div>
          ) : dock.status === 'available' ? (
            /* AVAILABLE DOCK ALLOCATION VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Forma de Alocação:</span>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setUseManualForm(false)}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      !useManualForm ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Fila do Pátio ({eligibleQueue.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseManualForm(true)}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      useManualForm ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Entrada Manual
                  </button>
                </div>
              </div>

              {!useManualForm ? (
                /* Select from Queue */
                <form onSubmit={handleQueueAssignSubmit} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Selecione um veículo aguardando no pátio:
                  </label>
                  {eligibleQueue.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      Nenhum veículo aguardando na fila no momento.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {eligibleQueue.map((item) => (
                        <label
                          key={item.id}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            selectedQueueId === item.id
                              ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="queueSelection"
                              checked={selectedQueueId === item.id}
                              onChange={() => setSelectedQueueId(item.id)}
                              className="accent-blue-600"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {item.licensePlate}
                                </span>
                                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                  {item.vehicleType}
                                </span>
                                <span
                                  className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded ${
                                    item.operationType === 'descarga'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}
                                >
                                  {item.operationType}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">{item.carrier} • {item.driverName}</p>
                            </div>
                          </div>
                          <div className="text-right text-[11px]">
                            <span className="font-medium text-slate-700 block">{item.volumeCount} vols</span>
                            <span className="text-slate-400">{(item.weightKg / 1000).toFixed(1)}t</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedQueueId}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Alocar Veículo Selecionado nesta Doca
                  </button>
                </form>
              ) : (
                /* Manual Entry Form */
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Placa *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: ABC1D23"
                        value={manualPlate}
                        onChange={(e) => setManualPlate(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Motorista *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome completo"
                        value={manualDriver}
                        onChange={(e) => setManualDriver(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transportadora</label>
                      <input
                        type="text"
                        placeholder="Nome da empresa"
                        value={manualCarrier}
                        onChange={(e) => setManualCarrier(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Categoria de Veículo</label>
                      <select
                        value={manualVehicleType}
                        onChange={(e) => setManualVehicleType(e.target.value as VehicleCategory)}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="carreta">Carreta / Bitrem</option>
                        <option value="truck">Caminhão Truck</option>
                        <option value="vuc">VUC Urbano</option>
                        <option value="van">Van / Furgão</option>
                        <option value="utilitario">Utilitário</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Operação</label>
                      <select
                        value={manualOpType}
                        onChange={(e) => setManualOpType(e.target.value as OperationType)}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="descarga">Descarregamento</option>
                        <option value="carga">Carregamento</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Volumes</label>
                      <input
                        type="number"
                        value={manualVolumes}
                        onChange={(e) => setManualVolumes(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Peso (kg)</label>
                      <input
                        type="number"
                        value={manualWeightKg}
                        onChange={(e) => setManualWeightKg(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nota Fiscal</label>
                      <input
                        type="text"
                        value={manualInvoice}
                        onChange={(e) => setManualInvoice(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">SLA Padrão (minutos)</label>
                      <input
                        type="number"
                        value={manualDuration}
                        onChange={(e) => setManualDuration(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Iniciar Operação Imediata
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Maintenance Mode details */
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Doca em Manutenção / Reservada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {dock.notes || 'A doca está temporariamente bloqueada para manutenções prediais ou calibração.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onToggleMaintenance(dock.id);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Desbloquear e Tornar Doca Livre
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
