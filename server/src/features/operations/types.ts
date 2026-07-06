// Domain types for stadium operations: live crowd state, open incidents,
// sustainability metrics, and the AI briefing built from them.

/** Crowd-management status derived from a zone's density. */
export type ZoneStatus = 'comfortable' | 'busy' | 'critical';

/** A stadium zone document stored in Firestore. */
export interface ZoneRecord {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
}

/** A zone enriched with derived density and status for the dashboard. */
export interface ZoneOccupancy extends ZoneRecord {
  densityPct: number;
  status: ZoneStatus;
}

/** An operational incident reported inside the venue. */
export interface Incident {
  id: string;
  zoneId: string;
  category: 'crowd' | 'medical' | 'facility' | 'security';
  severity: 'low' | 'medium' | 'high';
  summary: string;
  status: 'open' | 'resolved';
  reportedAt: string;
}

/** Venue sustainability counters for the current event day. */
export interface SustainabilityMetrics {
  wasteDivertedPct: number;
  energyKwh: number;
  waterRefillCount: number;
  co2SavedKg: number;
}

/** The full operational picture at one moment in time. */
export interface OpsSnapshot {
  zones: ZoneOccupancy[];
  incidents: Incident[];
  sustainability: SustainabilityMetrics;
  generatedAt: string;
}

/** An AI-generated operations briefing. */
export interface OpsBriefing {
  briefing: string;
  generatedAt: string;
}
