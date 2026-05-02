export type PillarKey = 'mental' | 'financial' | 'spiritual' | 'physical';
export type PillarState = 'empty' | 'in_progress' | 'complete';

export interface QuadState {
  mental: PillarState;
  financial: PillarState;
  spiritual: PillarState;
  physical: PillarState;
}

export interface QuadProps {
  size?: number;
  state: QuadState;
  isRestDay?: boolean;
  onArcPress?: (pillar: PillarKey) => void;
  closingAnimation?: boolean;
}
