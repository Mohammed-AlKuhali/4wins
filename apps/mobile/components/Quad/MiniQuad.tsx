import React from 'react';
import { Quad } from './Quad';
import type { QuadState } from './types';

interface MiniQuadProps {
  size?: number;
  state: QuadState;
  isRestDay?: boolean;
}

export function MiniQuad({ size = 32, state, isRestDay = false }: MiniQuadProps) {
  return <Quad size={size} state={state} isRestDay={isRestDay} />;
}

export default MiniQuad;
