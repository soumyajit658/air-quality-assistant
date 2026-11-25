export const POPULAR_INDIAN_CITIES = [
  'Kolkata',
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Patna',
  'Lucknow',
  'Pune',
  'Chennai',
];

export const HOUSEHOLD_MEMBERS = [
  { id: 'kids', label: 'Kids', hint: 'Developing lungs, outdoor school commute' },
  { id: 'elderly', label: 'Elderly', hint: 'Higher cardiovascular & smog sensitivity' },
  { id: 'respiratory', label: 'Respiratory sensitivity', hint: 'Asthma, COPD, allergies, bronchitis' },
  { id: 'pets', label: 'Pets', hint: 'Low-to-ground exposure & indoor dander' },
];

export const COMMUTE_MODES = [
  { id: 'petrol', label: 'Petrol Bike/Car', emissionFactor: 'High PM & tailpipe NOx' },
  { id: 'diesel', label: 'Diesel/Bus', emissionFactor: 'Heavy soot & roadside PM2.5' },
  { id: 'metro_ev', label: 'Metro/EV', emissionFactor: 'Low direct tailpipe emission' },
  { id: 'walk_cycle', label: 'Walk/Cycle', emissionFactor: 'Zero emission, high inhalation rate' },
];

export const HOME_SETUPS = [
  { id: 'no_purifier', label: 'No air purifier', exclusiveGroup: 'purifier' },
  { id: 'single_purifier', label: 'Single-room purifier', exclusiveGroup: 'purifier' },
  { id: 'cross_ventilated', label: 'Cross-ventilated flat', exclusiveGroup: null },
  { id: 'ground_main_road', label: 'Ground floor near main road', exclusiveGroup: null },
];

export const COOKING_WASTE_HABITS = [
  { id: 'lpg_induction', label: 'LPG/Induction' },
  { id: 'incense_dhoop', label: 'Incense/Dhoop usage' },
  { id: 'dry_sweeping', label: 'Dry sweeping' },
];

export const DAILY_PLEDGES = [
  {
    id: 'metro_commute',
    title: 'Switch 2 commutes to Metro / EV shuttle',
    category: 'Mobility',
    exposureReductionPct: 16,
    co2SavedKgPerWeek: 4.8,
    impactLabel: '-16% weekly commute PM2.5 & 4.8 kg CO₂ saved',
  },
  {
    id: 'wet_mop',
    title: 'Wet mop instead of dry broom',
    category: 'Indoor Dust',
    exposureReductionPct: 18,
    co2SavedKgPerWeek: 0.4,
    impactLabel: '-18% indoor dust resuspension',
  },
  {
    id: 'skip_incense',
    title: 'Skip evening incense / dhoop & waste burning',
    category: 'Source Control',
    exposureReductionPct: 22,
    co2SavedKgPerWeek: 1.9,
    impactLabel: '-22% evening indoor PM2.5 spike',
  },
  {
    id: 'seal_windows',
    title: 'Seal window & door gaps during peak smog hours',
    category: 'Shielding',
    exposureReductionPct: 15,
    co2SavedKgPerWeek: 0.6,
    impactLabel: '-15% ambient smog infiltration',
  },
  {
    id: 'safest_window_vent',
    title: 'Ventilate & exercise only in Safest Outdoor Window',
    category: 'Timing',
    exposureReductionPct: 14,
    co2SavedKgPerWeek: 0.5,
    impactLabel: '-14% peak-hour lung dose',
  },
];
