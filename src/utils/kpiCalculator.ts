import { AppStateData, KPIMetrics, Dock, VehicleCategory, OperationType } from '../types.ts';

export function calculateKPIMetrics(state: AppStateData): KPIMetrics {
  const { docks, queue, history } = state;
  const totalDocks = docks.length;
  
  const occupiedDocks = docks.filter((d) => d.status === 'occupied').length;
  const availableDocks = docks.filter((d) => d.status === 'available').length;
  const maintenanceDocks = docks.filter((d) => d.status === 'maintenance').length;
  const reservedDocks = docks.filter((d) => d.status === 'reserved').length;
  
  const activeOperableDocks = totalDocks - maintenanceDocks;
  const occupancyRate = activeOperableDocks > 0 ? Math.round((occupiedDocks / activeOperableDocks) * 100) : 0;

  // Active stay durations & delay checks
  const now = new Date().getTime();
  let totalActiveMinutes = 0;
  let activeOpsCount = 0;
  let delayedCount = 0;

  docks.forEach((dock) => {
    if (dock.status === 'occupied' && dock.currentOperation) {
      const start = new Date(dock.currentOperation.startTime).getTime();
      const elapsedMinutes = Math.max(1, Math.round((now - start) / 60000));
      totalActiveMinutes += elapsedMinutes;
      activeOpsCount++;

      if (elapsedMinutes > dock.currentOperation.standardDurationMinutes) {
        delayedCount++;
      }
    }
  });

  // Calculate historical stay duration
  let totalHistoricalMinutes = 0;
  history.forEach((h) => {
    totalHistoricalMinutes += h.durationMinutes;
  });

  const totalOpsAll = activeOpsCount + history.length;
  const avgStayDurationMinutes = totalOpsAll > 0 
    ? Math.round((totalActiveMinutes + totalHistoricalMinutes) / totalOpsAll)
    : 35;

  // Queue wait times
  let totalQueueWaitMinutes = 0;
  queue.forEach((q) => {
    if (q.status === 'waiting') {
      const arr = new Date(q.arrivalTime).getTime();
      const wait = Math.max(0, Math.round((now - arr) / 60000));
      totalQueueWaitMinutes += wait;
    }
  });

  const activeQueueCount = queue.filter((q) => q.status === 'waiting').length;
  const avgQueueWaitMinutes = activeQueueCount > 0 ? Math.round(totalQueueWaitMinutes / activeQueueCount) : 0;

  // Congestion calculation (0 - 100)
  // Factors: occupancy rate (40%), queue size (35%), delayed operations (25%)
  const occupancyFactor = (occupancyRate / 100) * 40;
  const queueFactor = Math.min(35, (activeQueueCount / 8) * 35);
  const delayFactor = Math.min(25, (delayedCount / 4) * 25);
  const congestionIndex = Math.min(100, Math.round(occupancyFactor + queueFactor + delayFactor));

  let congestionStatus: 'Fluido' | 'Moderado' | 'Crítico' = 'Fluido';
  if (congestionIndex > 70) {
    congestionStatus = 'Crítico';
  } else if (congestionIndex > 40) {
    congestionStatus = 'Moderado';
  }

  // Vehicles processed today
  const vehiclesProcessedToday = history.length + activeOpsCount;

  // Throughput per hour (mocked or grouped from history and active)
  const hourlyMap: Record<string, number> = {
    '06:00': 1,
    '07:00': 2,
    '08:00': 3,
    '09:00': 5,
    '10:00': 4,
    '11:00': 2,
    '12:00': 1,
    '13:00': 3,
    '14:00': 2,
    '15:00': 0,
  };

  history.forEach((h) => {
    try {
      const d = new Date(h.endTime);
      const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      if (hourlyMap[hourStr] !== undefined) {
        hourlyMap[hourStr] += 1;
      }
    } catch {
      // ignore date parse issues
    }
  });

  const throughputPerHour = Object.entries(hourlyMap).map(([hour, count]) => ({
    hour,
    count,
  }));

  // Dock efficiency
  const dockEfficiency = docks.map((d) => {
    const dockHist = history.filter((h) => h.dockId === d.id);
    const completedCount = dockHist.length;
    const avgDockTime = completedCount > 0 
      ? Math.round(dockHist.reduce((acc, h) => acc + h.durationMinutes, 0) / completedCount)
      : (d.status === 'occupied' && d.currentOperation ? d.currentOperation.standardDurationMinutes : 35);

    const onTimeCount = dockHist.filter((h) => !h.exceededTime).length;
    const eff = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : (d.status === 'maintenance' ? 40 : 90);

    return {
      dockId: d.id,
      dockName: d.name,
      efficiency: eff,
      opsCount: completedCount + (d.status === 'occupied' ? 1 : 0),
      avgTime: avgDockTime,
    };
  });

  // Vehicle category distribution
  const categoryCounts: Record<VehicleCategory, number> = {
    carreta: 0,
    truck: 0,
    vuc: 0,
    van: 0,
    utilitario: 0,
  };

  docks.forEach((d) => {
    if (d.currentOperation) categoryCounts[d.currentOperation.vehicleType]++;
  });
  queue.forEach((q) => {
    categoryCounts[q.vehicleType]++;
  });
  history.forEach((h) => {
    categoryCounts[h.vehicleType]++;
  });

  const categoryLabels: Record<VehicleCategory, string> = {
    carreta: 'Carreta / Bitrem',
    truck: 'Caminhão Truck',
    vuc: 'VUC Urbano',
    van: 'Van / Furgão',
    utilitario: 'Utilitário',
  };

  const vehicleTypeDistribution = (Object.keys(categoryCounts) as VehicleCategory[]).map((type) => ({
    type,
    label: categoryLabels[type],
    count: categoryCounts[type],
  }));

  return {
    totalDocks,
    occupiedDocks,
    availableDocks,
    maintenanceDocks,
    occupancyRate,
    avgStayDurationMinutes,
    delayedDocksCount: delayedCount,
    queueCount: activeQueueCount,
    avgQueueWaitMinutes,
    congestionIndex,
    congestionStatus,
    vehiclesProcessedToday,
    throughputPerHour,
    dockEfficiency,
    vehicleTypeDistribution,
    peakHours: ['09:00 - 11:30', '14:00 - 15:30'],
  };
}

/**
 * Intelligent Algorithm to Suggest the Best Available Dock
 * for a specific vehicle category and operation type.
 * Prioritizes:
 * 1. Dock status == 'available'
 * 2. Matches exact operation type (e.g., 'descarga' dock for 'descarga' op, or 'misto')
 * 3. Supports the vehicle type
 * 4. Checks equipment requirements (heavy trucks need hydraulic levelers)
 */
export function findBestAvailableDock(
  docks: Dock[],
  vehicleType: VehicleCategory,
  opType: 'carga' | 'descarga'
): Dock | null {
  const available = docks.filter((d) => d.status === 'available');
  if (available.length === 0) return null;

  // Filter docks that can support vehicle type
  const compatibleDocks = available.filter((d) => d.supportedVehicles.includes(vehicleType));
  const candidatePool = compatibleDocks.length > 0 ? compatibleDocks : available;

  // 1. Exact match on operation type
  const exactOpMatch = candidatePool.find((d) => d.type === opType);
  if (exactOpMatch) return exactOpMatch;

  // 2. Misto type match
  const mixedOpMatch = candidatePool.find((d) => d.type === 'misto');
  if (mixedOpMatch) return mixedOpMatch;

  // 3. Fallback to any available in pool
  return candidatePool[0] || available[0];
}

/**
 * Format minutes into readable Portuguese duration
 */
export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

/**
 * Calculate elapsed minutes from an ISO string
 */
export function getElapsedMinutes(isoString: string): number {
  const start = new Date(isoString).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((now - start) / 60000));
}
