
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
  STAND_X = 'STAND_X',      // Standard Landscape
  STAND_Y = 'STAND_Y',      // Standard Landscape + 90 deg Yaw
  STAND_Z = 'STAND_Z',      // Portrait
  TILT_X_FWD = 'TILT_X_FWD',
  TILT_X_BACK = 'TILT_X_BACK',
  TILT_Z_LEFT = 'TILT_Z_LEFT',
  TILT_Z_RIGHT = 'TILT_Z_RIGHT',
  ROOF_FWD = 'ROOF_FWD',    // Steep 45 deg
  ROOF_BACK = 'ROOF_BACK'   // Steep 45 deg
}

export enum InteractionMode {
  QUICK = 'QUICK',
  PRECISION = 'PRECISION'
}

export enum PointerMode {
  PLACE = 'PLACE',
  DELETE = 'DELETE',
  MOVE = 'MOVE'
}
