import React, { useState } from 'react';
import { X, Truck, User, ArrowRight, Play, Clock } from 'lucide-react';
import { Dock, VehicleCategory, OperationType, QueuePriority } from '../types.ts';
import { findBestAvailableDock } from '../utils/kpiCalculator.ts';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  docks: Dock[];
  onDirectDock: (dockId: number, operationData: any) => void;
  onSendToQueue: (queueData: any) => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  docks,
  onDirectDock,
  onSendToQueue,
}) => {
  if (!isOpen) return null;

  const [licensePlate, setLicensePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [carrier, setCarrier] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('carreta');
  const [opType, setOpType] = useState<OperationType>('descarga');
  const [cargoType, setCargoType] = useState('Mercadorias Diversas');
  const [volumes, setVolumes] = useState(200);
  const [weightKg, setWeightKg] = useState(14000);
  const [invoice, setInvoice] = useState('NF-' + Math.floor(10000 + Math.random() * 90000));
  const [priority, setPriority] = useState<QueuePriority>('normal');
  const [slaMinutes, setSlaMinutes] = useState(45);

  const bestDock = findBestAvailableDock(
    docks,
    vehicleType,
    opType === 'misto' ? 'descarga' : opType
  );

  const handleSubmitDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate || !driverName || !bestDock) return;

    onDirectDock(bestDock.id, {
      licensePlate: licensePlate.toUpperCase(),
      driverName,
      driverDoc: '321.654.987-00',
      carrier: carrier || 'Transportadora Geral',
      vehicleType,
      operationType: opType === 'misto' ? 'descarga' : opType,
      cargoType,
      volumeCount: Number(volumes) || 100,
      weightKg: Number(weightKg) || 5000,
      invoiceNumber: invoice,
      standardDurationMinutes: Number(slaMinutes) || 45,
    });
    onClose();
  };

  const handleSendQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate || !driverName) return;

    onSendToQueue({
      licensePlate: licensePlate.toUpperCase(),
      driverName,
      driverDoc: '321.654.987-00',
      carrier: carrier || 'Transportadora Geral',
      vehicleType,
      operationType: opType === 'misto' ? 'descarga' : opType,
      cargoDescription: cargoType,
      volumeCount: Number(volumes) || 100,
      weightKg: Number(weightKg) || 5000,
      invoiceNumber: invoice,
      priority,
      estimatedDurationMinutes: Number(slaMinutes) || 45,
      suggestedDockId: bestDock ? bestDock.id : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Entrada Rápida de Veículo</h2>
              <p className="text-xs text-slate-500">Encaminhe diretamente para doca livre ou pátio de triagem</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Placa do Veículo *</label>
              <input
                type="text"
                required
                placeholder="Ex: BRA2E19"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase bg-slate-50 focus:bg-white text-xs"
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
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transportadora</label>
              <input
                type="text"
                placeholder="Nome da empresa"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoria de Veículo</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleCategory)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
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
              <label className="block font-semibold text-slate-700 mb-1">Operação</label>
              <select
                value={opType}
                onChange={(e) => setOpType(e.target.value as OperationType)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="descarga">Descarregamento</option>
                <option value="carga">Carregamento</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Volumes</label>
              <input
                type="number"
                value={volumes}
                onChange={(e) => setVolumes(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QueuePriority)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta Prioridade</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SLA em Doca (min)</label>
              <input
                type="number"
                value={slaMinutes}
                onChange={(e) => setSlaMinutes(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Doca Sugerida Badge */}
          {bestDock ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 block">Doca Ideal Disponível:</span>
                <span className="font-bold text-sm text-slate-900">{bestDock.name} ({bestDock.type})</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Pronta para engatar</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              <span className="font-bold block">Nenhuma doca livre para este tipo no momento.</span>
              <span>Recomenda-se enviar para a fila do pátio de triagem.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {bestDock && (
              <button
                type="button"
                onClick={handleSubmitDirect}
                disabled={!licensePlate || !driverName}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Play className="h-4 w-4" />
                <span>Alocar Direto na {bestDock.name}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendQueue}
              disabled={!licensePlate || !driverName}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Clock className="h-4 w-4" />
              <span>Enviar para Fila do Pátio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
