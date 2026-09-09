import React from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Calendar,
  Zap
} from 'lucide-react';
import { KPIMetrics, MovementHistory } from '../types.ts';
import { formatMinutes } from '../utils/kpiCalculator.ts';

interface KpiDashboardProps {
  kpis: KPIMetrics;
  history: MovementHistory[];
}

export const KpiDashboard: React.FC<KpiDashboardProps> = ({ kpis, history }) => {
  const maxHourlyCount = Math.max(...kpis.throughputPerHour.map((t) => t.count), 6);

  return (
    <div className="space-y-6">
      {/* 6 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Taxa de Ocupação */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Taxa de Ocupação</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{kpis.occupancyRate}%</span>
            <span className="text-xs text-slate-500">das docas</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                kpis.occupancyRate > 85 ? 'bg-rose-500' : kpis.occupancyRate > 60 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${kpis.occupancyRate}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            {kpis.occupiedDocks} ocupadas de 14
          </span>
        </div>

        {/* Card 2: Tempo Médio de Permanência */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Permanência Média</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{kpis.avgStayDurationMinutes}</span>
            <span className="text-xs text-slate-500">minutos</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block pt-2">
            SLA meta: ≤ 45 min
          </span>
          <span className="text-[10px] text-slate-400 block">
            {kpis.delayedDocksCount} atraso(s) ativo(s)
          </span>
        </div>

        {/* Card 3: Índice de Congestionamento */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Congestionamento</span>
            <AlertTriangle className={`h-4 w-4 ${
              kpis.congestionIndex > 70 ? 'text-rose-500' : kpis.congestionIndex > 40 ? 'text-amber-500' : 'text-emerald-500'
            }`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{kpis.congestionIndex}</span>
            <span className={`text-xs font-bold ${
              kpis.congestionStatus === 'Crítico' ? 'text-rose-600' : kpis.congestionStatus === 'Moderado' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {kpis.congestionStatus}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                kpis.congestionIndex > 70 ? 'bg-rose-500' : kpis.congestionIndex > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${kpis.congestionIndex}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">
            Fila do Pátio: {kpis.queueCount} veículos
          </span>
        </div>

        {/* Card 4: Throughput Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Throughput Hoje</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{kpis.vehiclesProcessedToday}</span>
            <span className="text-xs text-slate-500">veículos</span>
          </div>
          <span className="text-[11px] text-slate-500 block pt-2">
            {history.length} concluídos / {kpis.occupiedDocks} ativos
          </span>
          <span className="text-[10px] text-slate-400 block">
            Giro médio: ~2.8 veíc/doca
          </span>
        </div>

        {/* Card 5: Tempo Médio de Fila */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Espera na Fila</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{kpis.avgQueueWaitMinutes}</span>
            <span className="text-xs text-slate-500">minutos</span>
          </div>
          <span className={`text-[11px] font-semibold block pt-2 ${
            kpis.avgQueueWaitMinutes > 30 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {kpis.avgQueueWaitMinutes > 30 ? 'Pátio sobrecarregado' : 'Fluxo sob controle'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {kpis.queueCount} aguardando vaga
          </span>
        </div>

        {/* Card 6: Utilização vs Capacidade */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Capacidade Útil</span>
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {Math.round(((14 - kpis.maintenanceDocks) / 14) * 100)}%
            </span>
            <span className="text-xs text-slate-500">operante</span>
          </div>
          <span className="text-[11px] text-slate-600 block pt-2">
            {14 - kpis.maintenanceDocks} de 14 disponíveis
          </span>
          <span className="text-[10px] text-slate-400 block">
            {kpis.maintenanceDocks} em manutenção
          </span>
        </div>
      </div>

      {/* Analytical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Throughput Horário (Histograma / Linha do Tempo) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Throughput por Faixa Horária</h3>
              <p className="text-xs text-slate-500">Volume de veículos processados e picos de movimentação diária</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
              <span>Veículos Concluídos</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-3 border-b border-slate-200 px-2">
              {kpis.throughputPerHour.map((item) => {
                const heightPercent = maxHourlyCount > 0 ? (item.count / maxHourlyCount) * 100 : 0;
                const isPeak = item.count >= 4;

                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition">
                      {item.count}
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 relative ${
                        isPeak ? 'bg-indigo-600' : 'bg-blue-500'
                      } group-hover:bg-blue-700`}
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    >
                      {isPeak && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] bg-rose-600 text-white font-bold px-1 rounded shadow-xs whitespace-nowrap">
                          Pico
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono rotate-45 sm:rotate-0 mt-1">
                      {item.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>
              <strong>Períodos Críticos Identificados:</strong> {kpis.peakHours.join(' e ')}
            </span>
            <span className="text-[11px] text-slate-400">Dados consolidados do turno atual</span>
          </div>
        </div>

        {/* Chart 2: Distribuição por Categoria de Veículo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Distribuição por Frota</h3>
            <p className="text-xs text-slate-500">Tipos de veículos no pátio, docas e histórico</p>
          </div>

          <div className="space-y-3 pt-2">
            {kpis.vehicleTypeDistribution.map((v) => {
              const total = kpis.vehicleTypeDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
              const percent = Math.round((v.count / total) * 100);

              return (
                <div key={v.type} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium">{v.label}</span>
                    <span className="font-bold text-slate-900">{v.count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        v.type === 'carreta'
                          ? 'bg-blue-600'
                          : v.type === 'truck'
                          ? 'bg-indigo-500'
                          : v.type === 'vuc'
                          ? 'bg-sky-500'
                          : v.type === 'van'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/80 text-[11px] text-blue-800">
            <strong>Dica de Otimização:</strong> Carretas representam o maior peso de carga. Mantenha as Docas 01 a 05 com niveladores hidráulicos sempre calibrados.
          </div>
        </div>
      </div>

      {/* Table: Eficiência Operacional por Doca (14 Docas) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Eficiência Operacional por Doca (1 a 14)</h3>
            <p className="text-xs text-slate-500">
              Taxa de cumprimento de SLA, tempo médio de giro e número de veículos movimentados
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Doca</th>
                <th className="py-2.5 px-3">Status Atual</th>
                <th className="py-2.5 px-3">Operações Hoje</th>
                <th className="py-2.5 px-3">Tempo Médio em Doca</th>
                <th className="py-2.5 px-3">Índice de Eficiência</th>
                <th className="py-2.5 px-3">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {kpis.dockEfficiency.map((dock) => {
                const isHigh = dock.efficiency >= 90;
                const isMedium = dock.efficiency >= 75 && dock.efficiency < 90;

                return (
                  <tr key={dock.dockId} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {dock.dockName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Ativa
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {dock.opsCount} operações
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {formatMinutes(dock.avgTime)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-emerald-500' : isMedium ? 'bg-blue-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${dock.efficiency}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{dock.efficiency}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isHigh
                            ? 'bg-emerald-100 text-emerald-800'
                            : isMedium
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isHigh ? 'Excelente' : isMedium ? 'Normal' : 'Gargalo Crítico'}
                      </span>
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
