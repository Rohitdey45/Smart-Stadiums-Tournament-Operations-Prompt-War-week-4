// Operations repository: reads the live operational picture from Firestore
// and advances the simulated crowd-telemetry feed. The simulator stands in
// for real gate/turnstile sensors — swapping it for a sensor ingest keeps
// every read path unchanged (see docs/decisions.md). Pure density logic
// lives in crowd.ts.
import { FieldValue } from '@google-cloud/firestore';

import { COLLECTIONS, getFirestore, SUSTAINABILITY_DOC_ID } from '../../lib/firestore.js';
import { logger } from '../../lib/logger.js';
import { nextOccupancy, toZoneOccupancy } from './crowd.js';
import { BASELINE_INCIDENTS, BASELINE_SUSTAINABILITY, BASELINE_ZONES } from './seed-data.js';
import type { Incident, OpsSnapshot, SustainabilityMetrics, ZoneRecord } from './types.js';

/** Seeds baseline zones, incidents and sustainability if the DB is empty. */
export async function ensureSeeded(): Promise<void> {
  const db = getFirestore();
  const existing = await db.collection(COLLECTIONS.zones).limit(1).get();
  if (!existing.empty) {
    return;
  }
  const batch = db.batch();
  for (const zone of BASELINE_ZONES) {
    batch.set(db.collection(COLLECTIONS.zones).doc(zone.id), zone);
  }
  for (const incident of BASELINE_INCIDENTS) {
    batch.set(db.collection(COLLECTIONS.incidents).doc(incident.id), incident);
  }
  batch.set(
    db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID),
    BASELINE_SUSTAINABILITY,
  );
  await batch.commit();
  logger.info('Seeded baseline operations data into Firestore');
}

/** Reads the current operational snapshot from Firestore. */
export async function getSnapshot(): Promise<OpsSnapshot> {
  const db = getFirestore();
  const [zonesSnap, incidentsSnap, sustainabilitySnap] = await Promise.all([
    db.collection(COLLECTIONS.zones).get(),
    db.collection(COLLECTIONS.incidents).get(),
    db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID).get(),
  ]);

  const zones = zonesSnap.docs
    .map((doc) => toZoneOccupancy(doc.data() as ZoneRecord))
    .sort((a, b) => b.densityPct - a.densityPct);
  const incidents = (incidentsSnap.docs.map((doc) => doc.data()) as Incident[]).sort((a, b) =>
    b.reportedAt.localeCompare(a.reportedAt),
  );
  const sustainability =
    (sustainabilitySnap.data() as SustainabilityMetrics | undefined) ?? BASELINE_SUSTAINABILITY;

  return { zones, incidents, sustainability, generatedAt: new Date().toISOString() };
}

/**
 * Advances the simulated telemetry feed one tick: nudges every zone's
 * occupancy and grows the water-refill sustainability counter.
 *
 * @param random - Injectable source of randomness for deterministic tests.
 */
export async function advanceTelemetry(random: () => number = Math.random): Promise<void> {
  const db = getFirestore();
  const zonesSnap = await db.collection(COLLECTIONS.zones).get();
  if (zonesSnap.empty) {
    return;
  }
  const batch = db.batch();
  for (const doc of zonesSnap.docs) {
    const zone = doc.data() as ZoneRecord;
    batch.update(doc.ref, { occupancy: nextOccupancy(zone, random) });
  }
  const refillGrowth = Math.round(random() * 40);
  batch.set(
    db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID),
    { waterRefillCount: FieldValue.increment(refillGrowth) },
    { merge: true },
  );
  await batch.commit();
}
