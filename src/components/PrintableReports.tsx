import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Clock, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { MovementHistory, KPIMetrics, AccessLog, Dock } from '../types.ts';
import { formatMinutes } from '../utils/kpiCalculator.ts';

interface PrintableReportsProps {
  history: MovementHistory[];
  kpis: KPIMetrics;
  accessLogs: AccessLog[];
  docks: Dock[];
}

type ReportType = 'movement' | 'kpis' | 'access' | 'congestion';
type PeriodType = 'diario' | 'semanal' | 'mensal';

export const PrintableReports: React.FC<PrintableReportsProps> = ({
  history,
  kpis,
  accessLogs,
  docks,
}) => {
  const [reportType, setReportType] = useState<ReportType>('movement');
  const [period, setPeriod] = useState<PeriodType>('diario');

  const handlePrint = () => {
    window.print();
  };

  const periodLabels = {
    diario: 'Diário (Turno de Hoje)',
    semanal: 'Semanal (Últimos 7 dias)',
    mensal: 'Mensal (Mês Corrente)',
  };

  return (
    <div className="space-y-6">
      {/* Configuration Toolbar (Hidden during print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportType('movement')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              reportType === 'movement'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            Movimentação de Docas
          </button>

          <button
            onClick={() => setReportType('kpis')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              reportType === 'kpis'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Desempenho & KPIs
          </button>

          <button
            onClick={() => setReportType('access')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              reportType === 'access'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Acessos de Portaria
          </button>

          <button
            onClick={() => setReportType('congestion')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              reportType === 'congestion'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Auditoria de Congestionamento
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="diario">Período Diário (Hoje)</option>
            <option value="semanal">Período Semanal</option>
            <option value="mensal">Período Mensal</option>
          </select>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 / Executive Layout) */}
      <div 
        id="printable-document-area"
        className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-md print:shadow-none print:border-none print:p-0 space-y-6 text-slate-800"
      >
        {/* Formal Header with Carrier Brand and Metadata */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Truck className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                DOCASFLOW • LOGÍSTICA & DISTRIBUIÇÃO
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Terminal de Cargas e Centro de Distribuição Central • 14 Docas Operacionais
            </p>
            <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
              Responsável Técnico: Alessandro Luís Santos
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <span className="font-bold text-slate-900 block uppercase">
              {reportType === 'movement' && 'Relatório de Movimentação por Doca'}
              {reportType === 'kpis' && 'Relatório Gerencial de Desempenho & KPIs'}
              {reportType === 'access' && 'Relatório de Portaria e Controle de Veículos'}
              {reportType === 'congestion' && 'Auditoria de Gargalos e Períodos de Congestionamento'}
            </span>
            <span className="text-slate-500 block">Período: {periodLabels[period]}</span>
            <span className="text-slate-400 font-mono text-[10px] block">
              Emissão: {new Date().toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* --- REPORT TYPE 1: MOVIMENTAÇÃO DE DOCAS --- */}
        {reportType === 'movement' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Operações Concluídas</span>
                <span className="text-base font-bold text-slate-900">{history.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tempo Médio Operacional</span>
                <span className="text-base font-bold text-slate-900">
                  {Math.round(history.reduce((a, b) => a + b.durationMinutes, 0) / (history.length || 1))} min
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Índice de Pontualidade</span>
                <span className="text-base font-bold text-emerald-600">
                  {Math.round((history.filter((h) => !h.exceededTime).length / (history.length || 1)) * 100)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Volume Total Movimentado</span>
                <span className="text-base font-bold text-slate-900">
                  {(history.reduce((a, b) => a + b.weightKg, 0) / 1000).toFixed(1)} toneladas
                </span>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border border-slate-200">Doca</th>
                  <th className="p-2 border border-slate-200">Placa / Veículo</th>
                  <th className="p-2 border border-slate-200">Transportadora / Motorista</th>
                  <th className="p-2 border border-slate-200">Tipo</th>
                  <th className="p-2 border border-slate-200">Volumes / Peso</th>
                  <th className="p-2 border border-slate-200">Permanência</th>
                  <th className="p-2 border border-slate-200">Status SLA</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-slate-200">
                    <td className="p-2 font-bold font-mono border border-slate-200">{h.dockName}</td>
                    <td className="p-2 border border-slate-200">
                      <span className="font-mono font-bold">{h.licensePlate}</span>
                      <span className="block text-[10px] text-slate-500 uppercase">{h.vehicleType}</span>
                    </td>
                    <td className="p-2 border border-slate-200">
                      <span className="font-medium">{h.carrier}</span>
                      <span className="block text-[10px] text-slate-500">{h.driverName}</span>
                    </td>
                    <td className="p-2 uppercase font-semibold border border-slate-200">{h.operationType}</td>
                    <td className="p-2 border border-slate-200">
                      {h.volumeCount} vols • {(h.weightKg / 1000).toFixed(1)}t
                    </td>
                    <td className="p-2 font-mono border border-slate-200">{formatMinutes(h.durationMinutes)}</td>
                    <td className="p-2 border border-slate-200">
                      {h.exceededTime ? (
                        <span className="text-rose-700 font-bold">Atraso (+{h.delayMinutes} min)</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">No Prazo (Meta: {h.standardDurationMinutes} min)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- REPORT TYPE 2: DESEMPENHO E KPIS --- */}
        {reportType === 'kpis' && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Taxa de Ocupação Média</span>
                <span className="text-2xl font-black text-slate-900">{kpis.occupancyRate}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Capacidade operacional: 14 docas</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Tempo Médio de Permanência</span>
                <span className="text-2xl font-black text-slate-900">{kpis.avgStayDurationMinutes} min</span>
                <span className="text-[10px] text-slate-400 block mt-1">Tempo padrão contratual: 45 min</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Índice de Congestionamento</span>
                <span className="text-2xl font-black text-slate-900">{kpis.congestionStatus}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Pontuação técnica: {kpis.congestionIndex}/100</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-2">Desempenho por Doca (Docas 01 a 14)</h3>
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border border-slate-200">Doca</th>
                    <th className="p-2 border border-slate-200">Operações Concluídas</th>
                    <th className="p-2 border border-slate-200">Tempo Médio em Doca</th>
                    <th className="p-2 border border-slate-200">Eficiência Operacional</th>
                    <th className="p-2 border border-slate-200">Avaliação de Gargalo</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.dockEfficiency.map((dock) => (
                    <tr key={dock.dockId} className="border-b border-slate-200">
                      <td className="p-2 font-bold border border-slate-200">{dock.dockName}</td>
                      <td className="p-2 border border-slate-200">{dock.opsCount} operações</td>
                      <td className="p-2 font-mono border border-slate-200">{formatMinutes(dock.avgTime)}</td>
                      <td className="p-2 font-bold border border-slate-200">{dock.efficiency}%</td>
                      <td className="p-2 border border-slate-200">
                        {dock.efficiency >= 90 ? 'Excelente Rendimento' : dock.efficiency >= 75 ? 'Operação Regular' : 'Gargalo em Monitoramento'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- REPORT TYPE 3: ACESSOS DE PORTARIA --- */}
        {reportType === 'access' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Total de Veículos Registrados</span>
                <span className="text-lg font-bold text-slate-900">{accessLogs.length} acessos</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Autorizados</span>
                <span className="text-lg font-bold text-emerald-600">
                  {accessLogs.filter((a) => a.permissionStatus === 'authorized').length}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Bloqueados / Vistoria Pendente</span>
                <span className="text-lg font-bold text-rose-600">
                  {accessLogs.filter((a) => a.permissionStatus !== 'authorized').length}
                </span>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border border-slate-200">Horário Entrada</th>
                  <th className="p-2 border border-slate-200">Placa / Categoria</th>
                  <th className="p-2 border border-slate-200">Motorista / Documento</th>
                  <th className="p-2 border border-slate-200">Transportadora</th>
                  <th className="p-2 border border-slate-200">Portaria / Crachá</th>
                  <th className="p-2 border border-slate-200">Vistoria</th>
                  <th className="p-2 border border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono border border-slate-200">
                      {new Date(log.entryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2 font-mono font-bold border border-slate-200">
                      {log.licensePlate} ({log.vehicleType})
                    </td>
                    <td className="p-2 border border-slate-200">
                      <span className="font-semibold">{log.driverName}</span>
                      <span className="block text-[10px] text-slate-500">{log.driverDoc}</span>
                    </td>
                    <td className="p-2 border border-slate-200">{log.carrier}</td>
                    <td className="p-2 border border-slate-200">{log.gateNumber} • {log.badgeNumber}</td>
                    <td className="p-2 border border-slate-200">
                      {log.inspectionPassed ? 'Aprovada' : 'Reprovada/Pendente'}
                    </td>
                    <td className="p-2 border border-slate-200 font-bold">
                      {log.permissionStatus === 'authorized' ? 'Autorizado' : log.permissionStatus === 'denied' ? 'Bloqueado' : 'Vistoria'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- REPORT TYPE 4: AUDITORIA DE CONGESTIONAMENTO --- */}
        {reportType === 'congestion' && (
          <div className="space-y-4 text-xs">
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-900 space-y-1">
              <h3 className="font-bold text-sm">Resumo da Análise de Gargalos</h3>
              <p>
                Os períodos críticos de congestionamento no pátio ocorrem principalmente entre as 09:00 e 11:30. A causa raiz predominante é a chegada simultânea de carretas sem janelas de agendamento escalonadas e lentidão de conferência manual de notas fiscais nas Docas 01 e 04.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Medidas de Otimização e Prevenção Recomendadas:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>
                  <strong>Escalonamento de Grade:</strong> Transferir agendamentos de carretas de grãos e bobinas para a primeira faixa da manhã (06:00 às 08:30).
                </li>
                <li>
                  <strong>Distribuição Dinâmica de VUCs:</strong> Utilizar as Docas 09 e 12 prioritariamente para veículos urbanos de carga rápida.
                </li>
                <li>
                  <strong>Check-in Antecipado:</strong> Habilitar pré-conferência fiscal na portaria antes de encaminhar o veículo para a fila de doca.
                </li>
                <li>
                  <strong>Agilidade na Doca 06:</strong> Finalizar manutenção do nivelador eletro-hidráulico para restaurar 100% da capacidade fabril.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Formal Signature & Footer block */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <div className="border-b border-slate-400 w-56 mb-1" />
            <span className="font-bold text-slate-800 block text-xs">Alessandro Luís Santos</span>
            <span>Responsável Técnico / Engenharia de Operações</span>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-400 w-56 ml-auto mb-1" />
            <span className="font-bold text-slate-800 block text-xs">Gerência de Logística & Distribuição</span>
            <span>Supervisão Geral de Pátio e Docas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
