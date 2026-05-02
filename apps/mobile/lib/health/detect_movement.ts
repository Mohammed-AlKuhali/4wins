export interface MovementData {
  steps?: number;
  activeEnergyKcal?: number;
  workoutMinutes?: number;
  source: 'healthkit' | 'health_connect';
  kind?: string;
}

export function meetsMovementThreshold(data: MovementData): boolean {
  if (data.steps !== undefined && data.steps >= 3000) return true;
  if (data.activeEnergyKcal !== undefined && data.activeEnergyKcal >= 100) return true;
  if (data.workoutMinutes !== undefined && data.workoutMinutes >= 10) return true;
  return false;
}
