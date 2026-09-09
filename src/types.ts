export type DockStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type OperationType = 'carga' | 'descarga' | 'misto';
export type VehicleCategory = 'carreta' | 'truck' | 'vuc' | 'van' | 'utilitario';
export type QueuePriority = 'normal' | 'alta' | 'urgente';
export type QueueStatus = 'waiting' | 'called' | 'docked' | 'cancelled';
export type PermissionStatus = 'authorized' | 'denied' | 'inspection_required';
export type StorageProviderType = 'local' | 'vercel_blob' | 'google_drive';

export interface DockOperation {
  id: string;
  vehicleId: string;
  licensePlate: string;
  driverName: string;
  driverDoc: string;
  carrier: string;
  vehicleType: VehicleCategory;
  operationType: 'carga' | 'descarga';
  cargoType: string;
  volumeCount: number;
  weightKg: number;
  invoiceNumber: string;
  startTime: string; // ISO String
  standardDurationMinutes: number;
  cargoProgressPercent: number; // 0 - 100
  notes?: string;
}

export interface Dock {
  id: number; // 1 to 14
  name: string;
  code: string;
  status: DockStatus;
  type: OperationType;
  supportedVehicles: VehicleCategory[];
  currentOperation?: DockOperation;
  maxWeightTons: number;
  isCovered: boolean;
  hasHydraulicLeveler: boolean;
  notes?: string;
}

export interface QueueItem {
  id: string;
  licensePlate: string;
  driverName: string;
  driverPhone?: string;
  driverDoc: string;
  carrier: string;
  vehicleType: VehicleCategory;
  operationType: 'carga' | 'descarga';
  cargoDescription: string;
  volumeCount: number;
  weightKg: number;
  invoiceNumber: string;
  arrivalTime: string;
  priority: QueuePriority;
  suggestedDockId?: number;
  targetDockId?: number;
  status: QueueStatus;
  estimatedDurationMinutes: number;
}

export interface AccessLog {
  id: string;
  licensePlate: string;
  driverName: string;
  driverDoc: string;
  carrier: string;
  vehicleType: VehicleCategory;
  permissionStatus: PermissionStatus;
  entryTime: string;
  exitTime?: string;
  badgeNumber: string;
  reason: string;
  gateNumber: string;
  authorizedBy: string;
  inspectionPassed: boolean;
  notes?: string;
}

export interface MovementHistory {
  id: string;
  dockId: number;
  dockName: string;
  licensePlate: string;
  driverName: string;
  carrier: string;
  vehicleType: VehicleCategory;
  operationType: 'carga' | 'descarga';
  cargoDescription: string;
  volumeCount: number;
  weightKg: number;
  invoiceNumber: string;
  entryTime: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  standardDurationMinutes: number;
  exceededTime: boolean;
  delayMinutes: number;
  efficiencyScore: number; // 0 to 100%
  completedBy: string;
}

export interface LogisticsRecommendation {
  id: string;
  category: 'flow' | 'scheduling' | 'docks' | 'safety';
  title: string;
  description: string;
  impact: 'alto' | 'medio' | 'baixo';
  suggestedAction: string;
  metricTrigger: string;
  timestamp: string;
}

export interface OperationalAlert {
  id: string;
  type: 'delay' | 'congestion_risk' | 'capacity_overload' | 'maintenance' | 'queue_overflow';
  title: string;
  message: string;
  dockId?: number;
  licensePlate?: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface StorageConfig {
  provider: StorageProviderType;
  vercelBlobToken?: string;
  googleDriveAccountEmail?: string;
  googleDriveFolderName?: string;
  lastSyncTimestamp?: string;
  syncStatus: 'synced' | 'syncing' | 'error' | 'pending';
  autoSyncEnabled: boolean;
  autoBackupIntervalMinutes: number;
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  provider: StorageProviderType;
  recordCounts: {
    docks: number;
    queue: number;
    accessLogs: number;
    history: number;
  };
  sizeBytes: number;
  notes?: string;
}

export interface AppStateData {
  docks: Dock[];
  queue: QueueItem[];
  accessLogs: AccessLog[];
  history: MovementHistory[];
  recommendations: LogisticsRecommendation[];
  alerts: OperationalAlert[];
  storageConfig: StorageConfig;
  backupHistory: BackupRecord[];
}

export interface KPIMetrics {
  totalDocks: number;
  occupiedDocks: number;
  availableDocks: number;
  maintenanceDocks: number;
  occupancyRate: number; // percentage
  avgStayDurationMinutes: number;
  delayedDocksCount: number;
  queueCount: number;
  avgQueueWaitMinutes: number;
  congestionIndex: number; // 0 to 100
  congestionStatus: 'Fluido' | 'Moderado' | 'Crítico';
  vehiclesProcessedToday: number;
  throughputPerHour: { hour: string; count: number }[];
  dockEfficiency: { dockId: number; dockName: string; efficiency: number; opsCount: number; avgTime: number }[];
  vehicleTypeDistribution: { type: VehicleCategory; count: number; label: string }[];
  peakHours: string[];
}
