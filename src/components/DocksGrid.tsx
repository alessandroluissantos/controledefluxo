import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wrench, 
  Truck, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Package, 
  SlidersHorizontal,
  ChevronRight,
  User,
  ShieldAlert,
  Play,
  Maximize2
} from 'lucide-react';
import { Dock, DockStatus, OperationType } from '../types.ts';
import { getElapsedMinutes, formatMinutes } from '../utils/kpiCalculator.ts';

interface DocksGridProps {
  docks: Dock[];
  onSelectDock: (dock: Dock) => void;
  onReleaseDock: (dockId: number) => void;
  onOpenAssignModal: (dock: Dock) => void;
  onToggleMaintenance: (dockId: number) => void;
}

export const DocksGrid: React.FC<DocksGridProps> = ({
  docks,
  onSelectDock,
  onReleaseDock,
  onOpenAssignModal,
  onToggleMaintenance,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredDocks = docks.filter((dock) => {
    if (filterStatus !== 'all' && dock.status !== filterStatus) return false;
    if (filterType !== 'all' && dock.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = dock.name.toLowerCase().includes(term);
      const matchCode = dock.code.toLowerCase().includes(term);
      const matchPlate = dock.currentOperation?.licensePlate.toLowerCase().includes(term);
      const matchDriver = dock.currentOperation?.driverName.toLowerCase().includes(term);
      const matchCarrier = dock.currentOperation?.carrier.toLowerCase().includes(term);
      return matchName || matchCode || matchPlate || matchDriver || matchCarrier;
    }
    return true;
  });

  const counts = {
    all: docks.length,
    available: docks.filter((d) => d.status === 'available').length,
    occupied: docks.filter((d) => d.status === 'occupied').length,
    maintenance: docks.filter((d) => d.status === 'maintenance').length,
    reserved: docks.filter((d) => d.status === 'reserved').length,
  };

  return (
    <div className="space-y-5">
      {/* Controls and Summary Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            id="filter-docks-all"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas ({counts.all})
          </button>
          <button
            id="filter-docks-available"
            onClick={() => setFilterStatus('available')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'available'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Livres ({counts.available})
          </button>
          <button
            id="filter-docks-occupied"
            onClick={() => setFilterStatus('occupied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'occupied'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Ocupadas ({counts.occupied})
          </button>
          <button
            id="filter-docks-maintenance"
            onClick={() => setFilterStatus('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'maintenance'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Manutenção ({counts.maintenance})
          </button>
          <button
            id="filter-docks-reserved"
            onClick={() => setFilterStatus('reserved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'reserved'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Reservadas ({counts.reserved})
          </button>
        </div>

        {/* Filter by Operation & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            id="select-dock-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Todas Operações</option>
            <option value="descarga">Apenas Descarregamento</option>
            <option value="carga">Apenas Carregamento</option>
            <option value="misto">Docas Mistas</option>
          </select>

          <input
            id="input-search-docks"
            type="text"
            placeholder="Buscar por placa, motorista ou doca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Grid of 14 Docks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocks.map((dock) => {
          const op = dock.currentOperation;
          const elapsed = op ? getElapsedMinutes(op.startTime) : 0;
          const isDelayed = op ? elapsed > op.standardDurationMinutes : false;
          const remainingMinutes = op ? op.standardDurationMinutes - elapsed : 0;

          return (
            <div
              key={dock.id}
              id={`dock-card-${dock.id}`}
              className={`rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                dock.status === 'occupied'
                  ? isDelayed
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-400/50'
                    : 'bg-white border-blue-200'
                  : dock.status === 'available'
                  ? 'bg-white border-emerald-200 hover:border-emerald-300'
                  : dock.status === 'maintenance'
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-purple-50/50 border-purple-300'
              }`}
            >
              {/* Header of Dock Card */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      dock.status === 'occupied'
                        ? isDelayed
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                        : dock.status === 'available'
                        ? 'bg-emerald-600 text-white'
                        : dock.status === 'maintenance'
                        ? 'bg-amber-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {dock.id.toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-none">{dock.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{dock.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Operation Type Chip */}
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                      dock.type === 'descarga'
                        ? 'bg-sky-100 text-sky-800'
                        : dock.type === 'carga'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {dock.type}
                  </span>

                  {/* Status Indicator */}
                  {dock.status === 'available' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      <CheckCircle2 className="h-3 w-3" /> Livre
                    </span>
                  )}
                  {dock.status === 'occupied' && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                        isDelayed
                          ? 'text-rose-700 bg-rose-100 font-bold animate-pulse'
                          : 'text-blue-700 bg-blue-100'
                      }`}
                    >
                      <Clock className="h-3 w-3" /> {isDelayed ? 'Atrasado' : 'Ocupada'}
                    </span>
                  )}
                  {dock.status === 'maintenance' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      <Wrench className="h-3 w-3" /> Manutenção
                    </span>
                  )}
                  {dock.status === 'reserved' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Reservada
                    </span>
                  )}
                </div>
              </div>

              {/* Body of Dock Card */}
              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                {dock.status === 'occupied' && op ? (
                  <div className="space-y-2.5 text-xs">
                    {/* Vehicle Plate & Carrier */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                            {op.licensePlate}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                            {op.vehicleType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{op.carrier}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">SLA</span>
                        <span className="font-semibold text-slate-700">{op.standardDurationMinutes} min</span>
                      </div>
                    </div>

                    {/* Driver & Cargo info */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 truncate">
                        <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{op.driverName}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate justify-end">
                        <Package className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span>{op.volumeCount} vols ({(op.weightKg / 1000).toFixed(1)}t)</span>
                      </div>
                    </div>

                    {/* Timer & SLA Warning */}
                    <div
                      className={`p-2 rounded-lg flex items-center justify-between ${
                        isDelayed
                          ? 'bg-rose-100/70 text-rose-900 border border-rose-300'
                          : 'bg-blue-50 text-blue-900 border border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className={`h-3.5 w-3.5 ${isDelayed ? 'text-rose-600' : 'text-blue-600'}`} />
                        <div>
                          <span className="text-[10px] block opacity-75">Tempo em Doca</span>
                          <span className="font-bold text-xs">{formatMinutes(elapsed)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block opacity-75">
                          {isDelayed ? 'Estouro de Tempo' : 'Tempo Restante'}
                        </span>
                        <span className={`font-bold text-xs ${isDelayed ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {isDelayed ? `+${formatMinutes(Math.abs(remainingMinutes))}` : `${remainingMinutes} min`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Progresso Operacional</span>
                        <span className="font-semibold text-slate-700">{op.cargoProgressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDelayed ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${op.cargoProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : dock.status === 'available' ? (
                  <div className="py-4 text-center text-xs text-slate-500 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Doca Desimpedida</p>
                      <p className="text-[11px] text-slate-400">Pronta para receber novo veículo</p>
                    </div>
                    <div className="text-[10px] text-slate-400 flex flex-wrap justify-center gap-1 pt-1">
                      <span>Capacidade: {dock.maxWeightTons}t</span>
                      {dock.hasHydraulicLeveler && <span>• Nivelador Hidráulico</span>}
                    </div>
                  </div>
                ) : dock.status === 'maintenance' ? (
                  <div className="py-4 text-center text-xs text-slate-500 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Em Manutenção Técnica</p>
                      <p className="text-[11px] text-slate-500 px-2 line-clamp-2">
                        {dock.notes || 'Intervenção preventiva na estrutura da doca'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Doca Reservada</p>
                      <p className="text-[11px] text-slate-500 px-2 line-clamp-2">
                        {dock.notes || 'Agendamento de carga prioritária'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  {dock.status === 'occupied' ? (
                    <>
                      <button
                        id={`btn-release-dock-${dock.id}`}
                        onClick={() => onReleaseDock(dock.id)}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                        title="Finalizar operação e liberar doca"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Liberar Doca</span>
                      </button>
                      <button
                        id={`btn-details-dock-${dock.id}`}
                        onClick={() => onSelectDock(dock)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition cursor-pointer"
                        title="Ver detalhes completos"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : dock.status === 'available' ? (
                    <>
                      <button
                        id={`btn-assign-dock-${dock.id}`}
                        onClick={() => onOpenAssignModal(dock)}
                        className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                        title="Alocar veículo da fila nesta doca"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Alocar Veículo</span>
                      </button>
                      <button
                        id={`btn-maint-dock-${dock.id}`}
                        onClick={() => onToggleMaintenance(dock.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition cursor-pointer"
                        title="Alternar modo de manutenção"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      id={`btn-restore-dock-${dock.id}`}
                      onClick={() => onToggleMaintenance(dock.id)}
                      className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Liberar para Uso</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
