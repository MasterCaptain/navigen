// src/lib/compliance/types.ts

export type OperationMode =
  | 'TRANSIT'
  | 'AT_ANCHOR'
  | 'LANDING'
  | 'CRUISING'
  | 'UNKNOWN';

export type VesselProfile = {
  flagState?: string;
  hasLocalGuide?: boolean;
  passengerCount?: number;
  iceClass?: string | null;
};