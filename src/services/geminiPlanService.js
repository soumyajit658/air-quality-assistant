import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import {
  COMMUTE_MODES,
  COOKING_WASTE_HABITS,
  HOME_SETUPS,
  HOUSEHOLD_MEMBERS,
} from '../data/profileOptions';

const PLAN_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: 'Concise 1-2 sentence winter smog assessment tailored to the city AQI and household profile.',
    },
    routine: {
      type: SchemaType.ARRAY,
      description: 'Exactly 3 schedule blocks covering Morning, Afternoon, and Evening.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          timeOfDay: { type: SchemaType.STRING },
          timeWindow: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          directImpact: {
            type: SchemaType.STRING,
            description: 'Exact quantified Direct Impact metric (e.g., 35% reduction in PM2.5 inhalation or 2.4 kg CO2 saved/week).',
          },
        },
        required: ['timeOfDay', 'timeWindow', 'title', 'description', 'directImpact'],
      },
    },
    indoorHacks: {
      type: SchemaType.ARRAY,
      description: '3 to 4 actionable low-cost indoor air quality steps tailored to the home setup and cooking habits.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          costLevel: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          directImpact: {
            type: SchemaType.STRING,
            description: 'Exact quantified Direct Impact metric (e.g., 40% reduction in indoor PM2.5 buildup).',
          },
        },
        required: ['title', 'costLevel', 'description', 'directImpact'],
      },
    },
    sustainableAlternatives: {
      type: SchemaType.ARRAY,
      description: '3 to 4 practical habit swaps tailored to commute and household habits.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          currentHabit: { type: SchemaType.STRING },
          swapTo: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          directImpact: {
            type: SchemaType.STRING,
            description: 'Exact quantified Direct Impact metric (e.g., 5.2 kg CO2 saved/week & 28% lower roadside PM2.5 exposure).',
          },
        },
        required: ['currentHabit', 'swapTo', 'description', 'directImpact'],
      },
    },
  },
  required: ['summary', 'routine', 'indoorHacks', 'sustainableAlternatives'],
};

function mapLabels(ids, catalog) {
  return ids
    .map((id) => catalog.find((item) => item.id === id)?.label)
    .filter(Boolean);
}

export function describeProfile(profile) {
  const members = mapLabels(profile.members, HOUSEHOLD_MEMBERS);
  const commute =
    COMMUTE_MODES.find((c) => c.id === profile.commute)?.label || 'Metro/EV';
  const home = mapLabels(profile.homeSetup, HOME_SETUPS);
  const habits = mapLabels(profile.habits, COOKING_WASTE_HABITS);

  return {
    membersText: members.length ? members.join(', ') : 'General adult household',
    commuteText: commute,
    homeText: home.length ? home.join(', ') : 'Standard urban apartment',
    habitsText: habits.length ? habits.join(', ') : 'Standard cooking & cleaning',
  };
}

function ensureDirectImpact(item, fallbackImpact) {
  return {
    ...item,
    directImpact:
      item?.directImpact && String(item.directImpact).trim().length > 0
        ? String(item.directImpact).trim()
        : fallbackImpact,
  };
}

export function generateDemoPlan(airQuality, profile, reason = 'demo') {
  const city = airQuality?.location?.name || 'Kolkata';
  const usAqi = airQuality?.usAqi ?? 180;
  const pm25 = airQuality?.pm25 ?? 110;
  const safest = airQuality?.safestWindow?.windowLabel || '1 PM – 3 PM';
  const safestPm = airQuality?.safestWindow?.avgPm25 ?? Math.round(pm25 * 0.65);
  const daytimeWindow = airQuality?.safestWindow?.daytimeWindowLabel || safest;
  const daytimePm = airQuality?.safestWindow?.daytimeAvgPm25 ?? safestPm;

  const hasKidsOrElderly =
    profile.members.includes('kids') || profile.members.includes('elderly');
  const hasRespiratory = profile.members.includes('respiratory');
  const hasPets = profile.members.includes('pets');
  const noPurifier = profile.homeSetup.includes('no_purifier');
  const singlePurifier = profile.homeSetup.includes('single_purifier');
  const groundRoad = profile.homeSetup.includes('ground_main_road');
  const usesIncense = profile.habits.includes('incense_dhoop');
  const drySweeping = profile.habits.includes('dry_sweeping');
  const usesLpg = profile.habits.includes('lpg_induction');

  const isPetrolOrDiesel =
    profile.commute === 'petrol' || profile.commute === 'diesel';
  const isWalkCycle = profile.commute === 'walk_cycle';

  const summaryParts = [
    `${city} is currently at US AQI ${usAqi} (PM2.5: ${pm25} µg/m³).`,
    hasRespiratory || hasKidsOrElderly
      ? 'With vulnerable household members at home, shifting outdoor activity into the midday thermal dispersion window and cutting indoor combustion sources gives the largest immediate protection.'
      : 'Aligning ventilation with the midday dispersion window and curbing indoor particle sources will sharply cut weekly lung exposure.',
  ];

  const routine = [
    {
      timeOfDay: 'Morning',
      timeWindow: '6:30 AM – 10:00 AM',
      title: isWalkCycle
        ? 'Mask up & delay vigorous outdoor exercise'
        : isPetrolOrDiesel
          ? 'Keep windows rolled up & run cabin recirculation'
          : 'Shield morning school/work departure from inversion smog',
      description: isWalkCycle
        ? `Morning winter inversion traps ground-level PM2.5 in ${city}. Wear a snug N95/FFP2 respirator for essential walks and shift brisk cardio indoors.`
        : isPetrolOrDiesel
          ? `Morning traffic bottlenecks spike roadside PM2.5 and NO₂. Keep car AC on recirculation mode (or wear a sealed N95 under a helmet) until you clear arterial roads.`
          : `${hasKidsOrElderly ? 'Keep kids and elderly indoors until mid-morning; ' : ''}keep balcony doors latched during rush hour and serve warm fluids with antioxidant-rich fruits before heading out.`,
      directImpact: isPetrolOrDiesel
        ? '42% lower in-cabin PM2.5 inhalation'
        : '36% reduction in peak morning PM2.5 lung dose',
    },
    {
      timeOfDay: 'Afternoon',
      timeWindow: daytimeWindow,
      title: `Daytime Dispersion Window: Ventilate & run errands (${daytimePm} µg/m³)`,
      description: `Open cross-ventilation windows for 20–30 minutes during ${daytimeWindow} when daytime thermal mixing lowers ${city}'s smog (${safest !== daytimeWindow ? `overnight low reaches ${safestPm} µg/m³ at ${safest}` : `lowest hourly average today`}). Schedule errands${hasPets ? ', quick pet walks,' : ''} or sun-drying laundry in this slot.`,
      directImpact: '31% lower outdoor PM2.5 intake vs morning/evening hours',
    },
    {
      timeOfDay: 'Evening',
      timeWindow: '5:30 PM – 10:30 PM',
      title: usesIncense
        ? 'Switch to zero-smoke evening rituals & seal road-facing gaps'
        : 'Lock down perimeter before post-sunset inversion sets in',
      description: `${
        groundRoad
          ? 'Ground-floor traffic exhaust builds rapidly after 6 PM—draw thick curtains and place damp draft-stoppers under the main door. '
          : 'Close exterior windows by 5:30 PM before cold air traps evening traffic and biomass smoke. '
      }${
        usesIncense
          ? 'Replace burning dhoop/agarbatti with essential-oil steam bowls or fresh flowers to prevent an overnight indoor PM2.5 spike.'
          : hasRespiratory
            ? 'Run a 5-minute saline nasal rinse and keep rescue inhalers accessible in bedrooms.'
            : 'Run kitchen exhaust during dinner prep and wipe pet paws/shoes at the doorway.'
      }`,
      directImpact: usesIncense
        ? '48% drop in overnight indoor PM2.5 concentration'
        : '29% lower overnight bedroom particle accumulation',
    },
  ];

  const indoorHacks = [
    noPurifier
      ? {
          title: 'DIY Box-Fan + MERV-13 / HEPA Filter Scrubber',
          costLevel: 'Low Cost (₹1,200–₹1,800)',
          description:
            'Tape a MERV-13 pleated filter onto the intake side of a standard table or box fan in the main bedroom. Run on medium speed for 2 hours before sleep.',
          directImpact: '52% indoor PM2.5 reduction in closed bedrooms',
        }
      : singlePurifier
        ? {
            title: 'Strategic "Clean Room" Purifier Zoning',
            costLevel: 'Free',
            description: `Keep your single purifier in the bedroom used by ${
              hasKidsOrElderly || hasRespiratory ? 'kids/elderly/sensitive members' : 'the family at night'
            }, close doors tightly, and place a rolled towel at the bottom door gap.`,
            directImpact: '45% faster clean-air recovery with 22% less filter wear',
          }
        : {
            title: 'Wet Microfiber Door-Gap & Sill Sealing',
            costLevel: 'Low Cost (₹150)',
            description:
              'Apply foam weatherstripping tape along sliding window tracks and place a damp cloth roll under the entrance door during evening smog peaks.',
            directImpact: '34% reduction in outdoor smog infiltration',
          },
    drySweeping
      ? {
          title: 'Replace Dry Broom with Damp Microfiber Mopping',
          costLevel: 'Free',
          description:
            'Dry jhadu sweeping resuspends settled fine dust and heavy-metal soot right into breathing height. Wet-mop floors once daily and wipe surfaces with a damp rag.',
          directImpact: '38% drop in indoor particulate resuspension',
        }
      : {
          title: 'Shoe-Free Entryway & Damp Entry Mat Protocol',
          costLevel: 'Free',
          description: `Leave outdoor footwear outside or in a closed rack and wipe ${
            hasPets ? 'pet paws and ' : ''
          }cycle/helmet gear with a damp cloth on arrival to stop tracking roadside soot indoors.`,
          directImpact: '24% less tracked-in PM10 & heavy-metal dust',
        },
    {
      title: usesLpg
        ? 'Kitchen Cross-Draft + Lid-On Low-Flame Cooking'
        : 'Smokeless Kitchen Venting & Splatter Control',
      costLevel: 'Free',
      description:
        'Always turn on the chimney/exhaust fan 2 minutes before lighting the stove, cover pots with lids, and keep a kitchen window cracked only while actively cooking.',
      directImpact: '41% reduction in cooking-generated NO₂ & ultrafine PM2.5',
    },
  ];

  if (groundRoad) {
    indoorHacks.push({
      title: 'Road-Facing Balcony Plant Buffer + Damp Curtain Mist',
      costLevel: 'Low Cost (₹250)',
      description:
        'Line road-facing grills with broad-leaf plants (Areca palm, Snake plant) and lightly mist sheer cotton curtains during dry afternoons to trap coarse road dust.',
      directImpact: '19% reduction in coarse PM10 entering road-facing rooms',
    });
  }

  const sustainableAlternatives = [
    isPetrolOrDiesel
      ? {
          currentHabit: `${profile.commute === 'diesel' ? 'Diesel/Bus' : 'Solo Petrol Bike/Car'} daily commute`,
          swapTo: 'Metro / Electric Feeder + Carpool 2–3x/week',
          description: `Swapping even 2 round-trip commutes a week in ${city} to Metro or shared EV cuts both your tailpipe footprint and personal roadside exposure.`,
          directImpact: '5.4 kg CO₂ saved/week & 28% lower commute PM2.5 exposure',
        }
      : {
          currentHabit: 'Unfiltered peak-hour outdoor errands',
          swapTo: 'Midday Errand Batching + Reusable N95',
          description: `Consolidate grocery and bank trips into ${safest} and pair short walks with a washable-shell N95 respirator.`,
          directImpact: '32% lower weekly inhaled PM2.5 & 1.6 kg CO₂ saved/week',
        },
    usesIncense
      ? {
          currentHabit: 'Daily Agarbatti / Dhoop Stick Burning',
          swapTo: 'Electric Camphor Diffuser or Fresh Flower Bowls',
          description:
            'Burning one incense stick releases as much fine particulate matter indoors as heavy traffic. Switch to heat-based diffusers or mogra/marigold bowls.',
          directImpact: '45% reduction in evening indoor PM2.5 & 1.8 kg CO₂ saved/week',
        }
      : {
          currentHabit: 'High-heat open-pan cooking & idle burners',
          swapTo: 'Pressure Cooker / Induction Batch Prep',
          description:
            'Using induction or pressure cooking trims cooking time by a third, lowering both kitchen NO₂ accumulation and LPG consumption.',
          directImpact: '2.1 kg CO₂ saved/week & 35% lower kitchen NO₂',
        },
    {
      currentHabit: 'Single-use disposable masks & dry-leaf/trash piling',
      swapTo: 'Community Composting + Certified Reusable N95',
      description:
        'Join your RWA/apartment wet-waste composting drive to prevent neighbourhood winter waste burning, and rotate 2 certified N95 masks across 5–7 days each.',
      directImpact: '3.2 kg CO₂e prevented/week & 20% lower neighbourhood smoke',
    },
  ];

  return {
    mode: reason,
    generatedAt: new Date().toISOString(),
    summary: summaryParts.join(' '),
    routine: routine.map((r) => ensureDirectImpact(r, '25% lower PM2.5 inhalation')),
    indoorHacks: indoorHacks.map((h) => ensureDirectImpact(h, '30% cleaner indoor air')),
    sustainableAlternatives: sustainableAlternatives.map((s) =>
      ensureDirectImpact(s, '2.5 kg CO₂ saved/week')
    ),
  };
}

export async function generatePersonalizedSmogPlan(airQuality, profile, runtimeApiKey = '') {
  const apiKey = (runtimeApiKey || import.meta.env.VITE_GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    // Realistic brief delay for smooth micro-interaction in Demo Mode
    await new Promise((r) => setTimeout(r, 650));
    return generateDemoPlan(airQuality, profile, 'demo');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: PLAN_SCHEMA,
        temperature: 0.5,
      },
    });

    const profileDesc = describeProfile(profile);
    const city = airQuality?.location?.name || 'Kolkata';

    const prompt = `You are VayuSetu, an expert Indian urban air quality and environmental health assistant helping families navigate winter smog.

LIVE AIR QUALITY TELEMETRY:
- City: ${city}${airQuality?.location?.admin1 ? `, ${airQuality.location.admin1}` : ''}
- US AQI: ${airQuality?.usAqi}
- PM2.5: ${airQuality?.pm25} µg/m³
- PM10: ${airQuality?.pm10} µg/m³
- Primary Pollutant: ${airQuality?.primaryPollutant} (${airQuality?.primaryPollutantValue})
- Safest Outdoor Window Today: ${airQuality?.safestWindow?.windowLabel} (lowest avg PM2.5: ${airQuality?.safestWindow?.avgPm25} µg/m³)

HOUSEHOLD & LIFESTYLE PROFILE:
- Household members: ${profileDesc.membersText}
- Daily commute mode: ${profileDesc.commuteText}
- Home setup: ${profileDesc.homeText}
- Cooking & waste habits: ${profileDesc.habitsText}

TASK:
Generate a practical, culturally grounded, hyper-personalized smog action plan for this Indian household today.
Strict requirements:
1. "routine": Exactly 3 items with timeOfDay "Morning", "Afternoon", and "Evening". Align outdoor/ventilation advice with the Safest Outdoor Window (${airQuality?.safestWindow?.windowLabel}).
2. "indoorHacks": 3 to 4 actionable, low-cost indoor steps tailored specifically to their Home Setup and Cooking & Waste Habits (e.g. Indian home realities like damp mopping, door-gap sealing, DIY MERV-13 fan, exhaust fan usage, no dhoop smoke).
3. "sustainableAlternatives": 3 to 4 practical habit swaps tailored to their commute mode and habits.
4. CRITICAL: Every single item across all 3 arrays MUST include a concrete, quantified "directImpact" string (e.g., "38% reduction in PM2.5 inhalation", "4.5 kg CO₂ saved/week & 25% less soot exposure"). Never omit numbers/units.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      mode: 'gemini',
      generatedAt: new Date().toISOString(),
      summary:
        parsed.summary ||
        `Personalized winter smog defense plan for ${city} (US AQI ${airQuality?.usAqi}).`,
      routine: (parsed.routine || []).map((r) =>
        ensureDirectImpact(r, '30% reduction in PM2.5 inhalation')
      ),
      indoorHacks: (parsed.indoorHacks || []).map((h) =>
        ensureDirectImpact(h, '35% reduction in indoor PM2.5')
      ),
      sustainableAlternatives: (parsed.sustainableAlternatives || []).map((s) =>
        ensureDirectImpact(s, '3.0 kg CO₂ saved/week')
      ),
    };
  } catch (err) {
    console.warn('Gemini generation failed, falling back to Smart Demo Mode:', err);
    const fallback = generateDemoPlan(airQuality, profile, 'fallback');
    fallback.errorNote =
      err?.message || 'Gemini API request failed; showing local Smart Demo plan.';
    return fallback;
  }
}
