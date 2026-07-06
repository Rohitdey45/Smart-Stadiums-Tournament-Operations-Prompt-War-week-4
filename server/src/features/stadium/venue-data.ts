// Canonical venue dataset: Estadio Azteca (Mexico City), the FIFA World Cup
// 2026 opening-match venue. Static reference data lives in code (typed and
// reviewable); dynamic operational state lives in Firestore.
import type { VenueProfile } from './types.js';

/** Static profile of the venue used to ground every assistant answer. */
export const VENUE: VenueProfile = {
  name: 'Estadio Azteca',
  city: 'Mexico City',
  tournament: 'FIFA World Cup 2026',
  capacity: 83264,
  gates: [
    {
      id: 'gate-1',
      name: 'Gate 1 — North',
      serves: 'North Stand, sections 101–128',
      accessible: true,
    },
    {
      id: 'gate-2',
      name: 'Gate 2 — Northeast',
      serves: 'East Stand upper, sections 201–224',
      accessible: false,
    },
    {
      id: 'gate-3',
      name: 'Gate 3 — East',
      serves: 'East Stand lower, sections 129–148',
      accessible: true,
    },
    {
      id: 'gate-4',
      name: 'Gate 4 — South',
      serves: 'South Stand, sections 149–176',
      accessible: true,
    },
    {
      id: 'gate-5',
      name: 'Gate 5 — Southwest',
      serves: 'West Stand upper, sections 225–248',
      accessible: false,
    },
    {
      id: 'gate-6',
      name: 'Gate 6 — West (VIP & accessibility priority)',
      serves: 'West Stand lower, hospitality, accessible seating',
      accessible: true,
    },
  ],
  facilities: [
    {
      id: 'food-north',
      name: 'North Concourse Food Court',
      category: 'food',
      location: 'Level 1, behind sections 110–118',
      accessible: true,
      details: 'Tacos, tortas, vegetarian and halal options; card and cash.',
    },
    {
      id: 'food-south',
      name: 'South Concourse Food Court',
      category: 'food',
      location: 'Level 1, behind sections 156–164',
      accessible: true,
      details: 'Local street-food stalls and family combos.',
    },
    {
      id: 'water-refill',
      name: 'Free Water Refill Stations',
      category: 'sustainability',
      location: 'Every concourse, next to each food court',
      accessible: true,
      details: 'Bring a reusable bottle — refills are free and cut single-use plastic.',
    },
    {
      id: 'recycling-points',
      name: 'Recycling & Compost Points',
      category: 'sustainability',
      location: 'All concourse exits',
      accessible: true,
      details: 'Three-stream bins: recycling, compost, landfill.',
    },
    {
      id: 'first-aid-east',
      name: 'First Aid — East',
      category: 'medical',
      location: 'Level 1, next to Gate 3',
      accessible: true,
      details: 'Staffed by paramedics for the full event window.',
    },
    {
      id: 'first-aid-west',
      name: 'First Aid — West',
      category: 'medical',
      location: 'Level 1, next to Gate 6',
      accessible: true,
      details: 'Includes a quiet recovery room.',
    },
    {
      id: 'accessible-seating',
      name: 'Accessible Seating Platforms',
      category: 'accessibility',
      location: 'West Stand lower, via Gate 6',
      accessible: true,
      details: 'Wheelchair platforms with companion seats; book through Guest Services.',
    },
    {
      id: 'elevators-west',
      name: 'Elevators & Step-Free Route',
      category: 'accessibility',
      location: 'Gates 1, 3, 4 and 6',
      accessible: true,
      details: 'Step-free route runs the full concourse loop; elevators at each corner.',
    },
    {
      id: 'sensory-room',
      name: 'Sensory Room',
      category: 'accessibility',
      location: 'Level 2, West Stand near section 230',
      accessible: true,
      details: 'Low-stimulation space with trained staff; ear defenders available.',
    },
    {
      id: 'prayer-room',
      name: 'Multi-Faith Prayer Room',
      category: 'prayer',
      location: 'Level 2, North Stand near section 205',
      accessible: true,
      details:
        'Open from gates-open to one hour after the final whistle; ablution facilities adjacent.',
    },
    {
      id: 'family-room',
      name: 'Family & Baby Care Room',
      category: 'family',
      location: 'Level 1, South Stand near section 160',
      accessible: true,
      details: 'Nursing space, changing tables, bottle warming.',
    },
    {
      id: 'guest-services',
      name: 'Guest Services Desks',
      category: 'services',
      location: 'Inside Gates 1, 4 and 6',
      accessible: true,
      details: 'Lost & found, accessibility bookings, volunteer support, lost-child point.',
    },
  ],
  transit: [
    {
      id: 'metro',
      mode: 'metro',
      name: 'Tren Ligero — Estadio Azteca station',
      guidance:
        'Light rail from Tasqueña metro; trains every 5 minutes until 2 hours after the match. Step-free access at the stadium station.',
      accessible: true,
    },
    {
      id: 'shuttle',
      mode: 'shuttle',
      name: 'FIFA Fan Shuttle',
      guidance:
        'Free shuttles loop between the stadium, Zócalo fan festival and major hotel zones; board at the South Plaza.',
      accessible: true,
    },
    {
      id: 'bus',
      mode: 'bus',
      name: 'City bus corridors',
      guidance:
        'Routes on Calzada de Tlalpan stop 400 m from the North gates; expect diversions for 90 minutes post-match.',
      accessible: false,
    },
    {
      id: 'parking',
      mode: 'parking',
      name: 'Official parking (pre-booked only)',
      guidance:
        'Lots E and S require a pre-booked permit; accessible bays are beside Gate 6 with a drop-off lane.',
      accessible: true,
    },
    {
      id: 'rideshare',
      mode: 'rideshare',
      name: 'Rideshare pick-up zone',
      guidance:
        'Designated pick-up on Avenida del Imán, a signposted 10-minute walk from the West gates.',
      accessible: true,
    },
  ],
};
