import { beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { FakeFirestore } from '../../helpers/fake-firestore.js';

const fakeDb = new FakeFirestore();

vi.mock('../../../src/lib/firestore.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../src/lib/firestore.js')>();
  return { ...original, getFirestore: () => fakeDb.asFirestore() };
});

const { advanceTelemetry, ensureSeeded, getSnapshot, nextOccupancy, toZoneOccupancy } =
  await import('../../../src/features/operations/service.js');

describe('toZoneOccupancy', () => {
  it('derives density percentage from occupancy and capacity', () => {
    const zone = toZoneOccupancy({ id: 'z', name: 'Zone', capacity: 1000, occupancy: 500 });
    expect(zone.densityPct).toBe(50);
    expect(zone.status).toBe('comfortable');
  });

  it('flags a zone busy at 65% density and critical at 85%', () => {
    expect(toZoneOccupancy({ id: 'z', name: 'Z', capacity: 100, occupancy: 65 }).status).toBe(
      'busy',
    );
    expect(toZoneOccupancy({ id: 'z', name: 'Z', capacity: 100, occupancy: 85 }).status).toBe(
      'critical',
    );
  });
});

describe('nextOccupancy', () => {
  const zone = { id: 'z', name: 'Zone', capacity: 10_000, occupancy: 5000 };

  it('never exceeds the maximum simulated density', () => {
    const crowded = { ...zone, occupancy: 9700 };
    expect(nextOccupancy(crowded, () => 1)).toBeLessThanOrEqual(9800);
  });

  it('never drops below the minimum simulated density', () => {
    const empty = { ...zone, occupancy: 1600 };
    expect(nextOccupancy(empty, () => 0)).toBeGreaterThanOrEqual(1500);
  });

  it('moves occupancy by at most the configured step', () => {
    const next = nextOccupancy(zone, () => 1);
    expect(Math.abs(next - zone.occupancy)).toBeLessThanOrEqual(600);
  });
});

describe('ensureSeeded / getSnapshot / advanceTelemetry', () => {
  beforeEach(() => {
    fakeDb.reset();
  });

  it('seeds baseline data only when the zones collection is empty', async () => {
    await ensureSeeded();
    expect(fakeDb.read('zones', 'north-stand')).toBeDefined();
    expect(fakeDb.read('incidents', 'inc-001')).toBeDefined();
    expect(fakeDb.read('sustainability', 'current')).toBeDefined();
  });

  it('does not overwrite existing data on a second start', async () => {
    await ensureSeeded();
    await fakeDb.collection('zones').doc('north-stand').set({
      id: 'north-stand',
      name: 'North Stand',
      capacity: 18_000,
      occupancy: 17_000,
    });
    await ensureSeeded();
    expect(fakeDb.read('zones', 'north-stand')?.['occupancy']).toBe(17_000);
  });

  it('returns zones sorted by density with incidents and sustainability', async () => {
    await ensureSeeded();
    const snapshot = await getSnapshot();
    expect(snapshot.zones.length).toBeGreaterThan(0);
    const densities = snapshot.zones.map((zone) => zone.densityPct);
    expect(densities).toEqual([...densities].sort((a, b) => b - a));
    expect(snapshot.sustainability.wasteDivertedPct).toBeGreaterThan(0);
    expect(snapshot.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('advanceTelemetry keeps every zone inside simulated density bounds', async () => {
    await ensureSeeded();
    await advanceTelemetry(() => 1);
    const snapshot = await getSnapshot();
    for (const zone of snapshot.zones) {
      expect(zone.densityPct).toBeGreaterThanOrEqual(15);
      expect(zone.densityPct).toBeLessThanOrEqual(98);
    }
  });
});
