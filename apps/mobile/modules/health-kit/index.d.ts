export declare const isHealthKitAvailable: () => boolean;
export declare const isHealthConnectAvailable: () => boolean;
export declare function requestHealthPermissions(): Promise<boolean>;
export declare function getTodayMovement(): Promise<{
  steps: number;
  activeEnergyKcal: number;
  workoutMinutes: number;
} | null>;
export declare function createHealthObserver(callback: () => void): () => void;
