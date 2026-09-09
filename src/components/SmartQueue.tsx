import React, { useState } from 'react';
import { 
  Truck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Filter,
  User,
  Package,
  Phone
} from 'lucide-react';
import { QueueItem, Dock, VehicleCategory, OperationType, QueuePriority } from '../types.ts';
import { findBestAvailableDock, getElapsedMinutes, formatMinutes } from '../utils/kpiCalculator.ts';

interface SmartQueueProps {
  queue: QueueItem[];
  docks: Dock[];
  onDispatchToDock: (queueItemId: string, dockId: number) => void;
  onAddToQueue: (item: Omit<QueueItem, 'id' | 'arrivalTime' | 'status'>) => void;
  onRemoveFromQueue: (id: string) => void;
}

export const SmartQueue: React.FC<SmartQueueProps> = ({
  queue,
  docks,
  onDispatchToDock,
  onAddToQueue,
  onRemoveFromQueue,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Form State
  const [licensePlate, setLicensePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverDoc, setDriverDoc] = useState('');
  const [carrier, setCarrier] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('carreta');
  const [operationType, setOperationType] = useState<OperationType>('descarga');
  const [cargoDescription, setCargoDescription] = useState('Alimentos e Bebidas');
  const [volumeCount, setVolumeCount] = useState(350);
  const [weightKg, setWeightKg] = useState(18000);
  const [invoiceNumber, setInvoiceNumber] = useState('NF-' + Math.floor(10000 + Math.random() * 90000));
  const [priority, setPriority] = useState<QueuePriority>('normal');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(45);

  const activeQueue = queue.filter((q) => q.status === 'waiting' || q.status === 'called');

  const filteredQueue = activeQueue.filter((q) => {
    if (priorityFilter !== 'all' && q.priority !== priorityFilter) return false;
    return true;
  });

  const handleSubmitNewQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate || !driverName) return;

    onAddToQueue({
      licensePlate: licensePlate.toUpperCase(),
      driverName,
      driverPhone,
      driverDoc: driverDoc || '123.456.789-00',
      carrier: carrier || 'Transportadora Geral',
      vehicleType,
      operationType: operationType === 'misto' ? 'descarga' : operationType,
      cargoDescription,
      volumeCount: Number(volumeCount) || 100,
      weightKg: Number(weightKg) || 5000,
      invoiceNumber,
      priority,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 40,
    });

    // Reset Form
    setLicensePlate('');
    setDriverName('');
    setDriverPhone('');
    setDriverDoc('');
    setCarrier('');
    setShowAddForm(false);
  };

  const availableDocksCount = docks.filter((d) => d.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Smart Queue Allocation Overview */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
              Controle de Congestionamento
            </span>
            <span className="text-xs text-slate-300">Pátio de Espera e Triagem</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Fila Inteligente de Alocação</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            O algoritmo analisa a categoria do veículo, tipo de operação (carga/descarga) e sugere a doca ideal livre para minimizar gargalos no pátio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Docas Livres</span>
            <span className="text-lg font-bold text-emerald-400">{availableDocksCount} / 14</span>
          </div>

          <button
            id="btn-toggle-add-queue"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar à Fila</span>
          </button>
        </div>
      </div>

      {/* Optional Add to Queue Form */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              Novo Registro no Pátio de Triagem
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmitNewQueue} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Placa do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ABC1D23"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Motorista *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transportadora</label>
                <input
                  type="text"
                  placeholder="Ex: Braspress, Jamef..."
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoria de Veículo</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleCategory)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="carreta">Carreta / Bitrem</option>
                  <option value="truck">Caminhão Truck</option>
                  <option value="vuc">VUC Urbano</option>
                  <option value="van">Van / Furgão</option>
                  <option value="utilitario">Utilitário</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Operação</label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as OperationType)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="descarga">Descarregamento</option>
                  <option value="carga">Carregamento</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as QueuePriority)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="normal">Normal</option>
                  <option value="alta">Alta Prioridade</option>
                  <option value="urgente">Urgente (Carga Crítica / Termolábil)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tempo Estimado (minutos)</label>
                <input
                  type="number"
                  value={estimatedDurationMinutes}
                  onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição da Carga</label>
                <input
                  type="text"
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Volumes</label>
                <input
                  type="number"
                  value={volumeCount}
                  onChange={(e) => setVolumeCount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peso Total (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                Registrar no Pátio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Priority Filters & Queue Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filtrar Prioridade:</span>
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              priorityFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({activeQueue.length})
          </button>
          <button
            onClick={() => setPriorityFilter('urgente')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              priorityFilter === 'urgente'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            Urgentes ({activeQueue.filter((q) => q.priority === 'urgente').length})
          </button>
          <button
            onClick={() => setPriorityFilter('alta')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              priorityFilter === 'alta'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            Alta ({activeQueue.filter((q) => q.priority === 'alta').length})
          </button>
        </div>
      </div>

      {/* Queue Items List */}
      {filteredQueue.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Pátio de Espera Vazio</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há nenhum veículo aguardando alocação na triagem. O fluxo operacional de docas está 100% em dia.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQueue.map((item, index) => {
            const waitTime = getElapsedMinutes(item.arrivalTime);
            const bestDock = findBestAvailableDock(docks, item.vehicleType, item.operationType);

            return (
              <div
                key={item.id}
                id={`queue-item-${item.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-slate-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Vehicle & Carrier Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    #{index + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                        {item.licensePlate}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.vehicleType}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                          item.operationType === 'descarga'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {item.operationType}
                      </span>

                      {/* Priority Tag */}
                      {item.priority === 'urgente' && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          Urgente
                        </span>
                      )}
                      {item.priority === 'alta' && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Alta Prioridade
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{item.carrier}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        {item.driverName}
                      </span>
                      {item.driverPhone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Phone className="h-3 w-3" />
                            {item.driverPhone}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
                      <span>Carga: {item.cargoDescription}</span>
                      <span>•</span>
                      <span>{item.volumeCount} volumes ({(item.weightKg / 1000).toFixed(1)}t)</span>
                      <span>•</span>
                      <span className="font-mono">{item.invoiceNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Waiting Time & Smart Suggestion */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Esperando há:</span>
                      <span className={`font-bold ${waitTime > 30 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {formatMinutes(waitTime)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Estimado em doca: {item.estimatedDurationMinutes} min
                    </span>
                  </div>

                  {/* Recommendation / Dispatch Button */}
                  {bestDock ? (
                    <div className="flex items-center gap-2">
                      <div className="hidden lg:block text-right">
                        <span className="text-[10px] text-emerald-700 font-semibold block flex items-center gap-1 justify-end">
                          <Sparkles className="h-3 w-3" /> Doca Sugerida
                        </span>
                        <span className="text-xs font-bold text-slate-800">{bestDock.name}</span>
                      </div>

                      <button
                        id={`btn-dispatch-queue-${item.id}`}
                        onClick={() => onDispatchToDock(item.id, bestDock.id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                        title={`Despachar imediatamente para ${bestDock.name}`}
                      >
                        <span>Alocar na {bestDock.name}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg inline-block font-medium">
                        Aguardando doca compatível
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => onRemoveFromQueue(item.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                    title="Remover da fila"
                  >
                    Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
