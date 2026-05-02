export const motion = {
  subtle: { damping: 22, stiffness: 180, mass: 1 },
  default: { damping: 18, stiffness: 140, mass: 1 },
  ritual: { damping: 14, stiffness: 90, mass: 1 },
  entrance: { damping: 20, stiffness: 140, mass: 1 },
} as const;

export type MotionPreset = keyof typeof motion;
