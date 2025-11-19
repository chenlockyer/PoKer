
export interface CardData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  suit: 'spades' | 'hearts' | 'clubs' | 'diamonds';
  rank: string;
  color: 'red' | 'black';
  locked: boolean;
}

export enum RotationMode {
  FLAT = 'FLAT',
  VERTICAL_X = 'VERTICAL_X',
  VERTICAL_Z = 'VERTICAL_Z',
  TILTED_LEFT = 'TILTED_LEFT',
  TILTED_RIGHT = 'TILTED_RIGHT'
}

export enum InteractionMode {
  QUICK = 'QUICK',
  PRECISION = 'PRECISION'
}
