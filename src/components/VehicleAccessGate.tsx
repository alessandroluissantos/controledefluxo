import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Clock, 
  Plus, 
  Truck, 
  Search, 
  Filter, 
  CheckCircle2, 
  LogOut,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { AccessLog, VehicleCategory, PermissionStatus } from '../types.ts';

interface VehicleAccessGateProps {
  accessLogs: AccessLog[];
  onRegisterAccess: (log: Omit<AccessLog, 'id' | 'entryTime'>) => void;
  onRegisterExit: (logId: string) => void;
  onUpdatePermission: (logId: string, status: PermissionStatus, passedInspection: boolean) => void;
}

export const VehicleAccessGate: React.FC<VehicleAccessGateProps> = ({
  accessLogs,
  onRegisterAccess,
  onRegisterExit,
  onUpdatePermission,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New access form state
  const [licensePlate, setLicensePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverDoc, setDriverDoc] = useState('');
  const [carrier, setCarrier] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('truck');
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('authorized');
  const [badgeNumber, setBadgeNumber] = useState('CRA-' + Math.floor(100 + Math.random() * 900));
  const [reason, setReason] = useState('Carga e Descarga Geral');
  const [gateNumber, setGateNumber] = useState('Portaria Principal - P1');
  const [authorizedBy, setAuthorizedBy] = useState('Operador Guarita');
  const [inspectionPassed, setInspectionPassed] = useState(true);

  const filteredLogs = accessLogs.filter((log) => {
    if (statusFilter !== 'all' && log.permissionStatus !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPlate = log.licensePlate.toLowerCase().includes(term);
      const matchDriver = log.driverName.toLowerCase().includes(term);
      const matchCarrier = log.carrier.toLowerCase().includes(term);
      const matchBadge = log.badgeNumber.toLowerCase().includes(term);
      return matchPlate || matchDriver || matchCarrier || matchBadge;
    }
    return true;
  });

  const handleSubmitAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate || !driverName) return;

    onRegisterAccess({
      licensePlate: licensePlate.toUpperCase(),
      driverName,
      driverDoc: driverDoc || '111.222.333-44',
      carrier: carrier || 'Transportadora Terceirizada',
      vehicleType,
      permissionStatus,
      badgeNumber,
      reason,
      gateNumber,
      authorizedBy,
      inspectionPassed: permissionStatus === 'authorized' ? inspectionPassed : false,
      notes: permissionStatus === 'denied' ? 'Acesso recusado pela portaria.' : undefined,
    });

    // Reset Form
    setLicensePlate('');
    setDriverName('');
    setDriverDoc('');
    setCarrier('');
    setBadgeNumber('CRA-' + Math.floor(100 + Math.random() * 900));
    setShowAddForm(false);
  };

  const statusPillClass = {
    authorized: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    denied: 'bg-rose-100 text-rose-800 border-rose-300',
    inspection_required: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  const statusLabel = {
    authorized: 'Autorizado',
    denied: 'Bloqueado / Recusado',
    inspection_required: 'Vistoria Pendente',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Gate Control Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Portaria & Controle de Acessos</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Registro de entrada e saída de veículos, checagem de permissões de segurança, vistorias de cabine/lacre e controle de crachás de acesso.
          </p>
        </div>

        <button
          id="btn-toggle-add-access"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Novo Acesso</span>
        </button>
      </div>

      {/* New Gate Entry Form Modal/Collapsible */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              Check-in de Portaria
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <form onSubmit={handleSubmitAccess} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Placa do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BRA2E19"
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
                <label className="block font-semibold text-slate-700 mb-1">Documento (CPF/RG)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={driverDoc}
                  onChange={(e) => setDriverDoc(e.target.value)}
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
                <label className="block font-semibold text-slate-700 mb-1">Status de Permissão</label>
                <select
                  value={permissionStatus}
                  onChange={(e) => setPermissionStatus(e.target.value as PermissionStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="authorized">Autorizado</option>
                  <option value="inspection_required">Vistoria Pendente</option>
                  <option value="denied">Bloqueado / Recusado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número do Crachá</label>
                <input
                  type="text"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Portão de Acesso</label>
                <select
                  value={gateNumber}
                  onChange={(e) => setGateNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Portaria Principal - P1">Portaria Principal - P1</option>
                  <option value="Portaria Sul - P2">Portaria Sul - P2</option>
                  <option value="Portaria Balança - P3">Portaria Balança - P3</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo do Acesso</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operador Responsável</label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
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
                Efetuar Check-in
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({accessLogs.length})
          </button>
          <button
            onClick={() => setStatusFilter('authorized')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'authorized'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            Autorizados
          </button>
          <button
            onClick={() => setStatusFilter('inspection_required')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'inspection_required'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            Vistoria Pendente
          </button>
          <button
            onClick={() => setStatusFilter('denied')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'denied'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            Bloqueados
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar placa, motorista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Access Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Placa / Categoria</th>
                <th className="py-3 px-4">Motorista / Transportadora</th>
                <th className="py-3 px-4">Entrada / Saída</th>
                <th className="py-3 px-4">Portaria / Crachá</th>
                <th className="py-3 px-4">Motivo / Vistoria</th>
                <th className="py-3 px-4">Status de Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => {
                const entryDate = new Date(log.entryTime);
                const exitDate = log.exitTime ? new Date(log.exitTime) : null;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {log.licensePlate}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {log.vehicleType}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{log.driverName}</div>
                      <div className="text-[11px] text-slate-500">{log.carrier}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-slate-700">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {entryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {exitDate ? (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Saída: {exitDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-semibold">No Pátio</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800">{log.gateNumber}</div>
                      <div className="text-[10px] font-mono text-slate-400">Crachá: {log.badgeNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 max-w-xs truncate">{log.reason}</div>
                      <div className="text-[10px]">
                        {log.inspectionPassed ? (
                          <span className="text-emerald-700">✓ Vistoria Aprovada</span>
                        ) : (
                          <span className="text-amber-700">⚠ Vistoria Pendente/Não realizada</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusPillClass[log.permissionStatus]}`}>
                        {statusLabel[log.permissionStatus]}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {log.permissionStatus === 'inspection_required' && (
                          <button
                            onClick={() => onUpdatePermission(log.id, 'authorized', true)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px] transition cursor-pointer"
                            title="Aprovar Vistoria e Liberar"
                          >
                            Aprovar
                          </button>
                        )}

                        {!log.exitTime && log.permissionStatus === 'authorized' && (
                          <button
                            onClick={() => onRegisterExit(log.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition cursor-pointer"
                            title="Registrar saída do veículo"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Saída</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
