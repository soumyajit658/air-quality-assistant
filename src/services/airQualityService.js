const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export function getAqiMeta(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 50) {
    return {
      label: 'Good',
      shortLabel: 'Good',
      advice: 'Air quality is satisfactory. Normal outdoor routines are safe.',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      dotColor: 'bg-emerald-400',
      accentHex: '#10b981',
      barClass: 'bg-emerald-400',
    };
  }
  if (val <= 100) {
    return {
      label: 'Moderate',
      shortLabel: 'Moderate',
      advice: 'Acceptable air quality; sensitive groups should limit prolonged exertion near traffic.',
      badgeBg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',
      dotColor: 'bg-yellow-400',
      accentHex: '#eab308',
      barClass: 'bg-yellow-400',
    };
  }
  if (val <= 150) {
    return {
      label: 'Unhealthy for Sensitive Groups',
      shortLabel: 'Sensitive',
      advice: 'Kids, elderly, and asthma-prone members should avoid peak morning/evening smog.',
      badgeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
      dotColor: 'bg-orange-400',
      accentHex: '#f97316',
      barClass: 'bg-orange-400',
    };
  }
  if (val <= 200) {
    return {
      label: 'Unhealthy',
      shortLabel: 'Unhealthy',
      advice: 'Everyone may experience respiratory irritation. Use N95 outdoors and keep windows sealed.',
      badgeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      dotColor: 'bg-rose-400',
      accentHex: '#f43f5e',
      barClass: 'bg-rose-400',
    };
  }
  if (val <= 300) {
    return {
      label: 'Very Unhealthy',
      shortLabel: 'Very Unhealthy',
      advice: 'Health alert: avoid outdoor exercise, seal gaps, and run indoor filtration if available.',
      badgeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
      dotColor: 'bg-purple-400',
      accentHex: '#a855f7',
      barClass: 'bg-purple-400',
    };
  }
  return {
    label: 'Hazardous',
    shortLabel: 'Hazardous',
    advice: 'Emergency smog conditions. Stay indoors with windows sealed and wear N95 if stepping out.',
    badgeBg: 'bg-red-700/25 border-red-500/50 text-red-200',
    dotColor: 'bg-red-500',
    accentHex: '#ef4444',
    barClass: 'bg-red-500',
  };
}

// Compute approximate US EPA sub-index to reliably determine primary pollutant
function estimatePollutantSubIndices(current) {
  const pm25 = Number(current.pm2_5 ?? 0);
  const pm10 = Number(current.pm10 ?? 0);
  const no2 = Number(current.nitrogen_dioxide ?? 0);
  const o3 = Number(current.ozone ?? 0);
  const so2 = Number(current.sulphur_dioxide ?? 0);

  // Normalized ratios against US AQI ~100 thresholds (PM2.5: 35.4 ug/m3, PM10: 154, NO2: 188 ug/m3, O3: 140, SO2: 196)
  const candidates = [
    { key: 'PM2.5', ratio: pm25 / 35.4, value: `${pm25.toFixed(1)} µg/m³` },
    { key: 'PM10', ratio: pm10 / 154, value: `${pm10.toFixed(1)} µg/m³` },
    { key: 'NO₂', ratio: no2 / 188, value: `${no2.toFixed(1)} µg/m³` },
    { key: 'O₃', ratio: o3 / 140, value: `${o3.toFixed(1)} µg/m³` },
    { key: 'SO₂', ratio: so2 / 196, value: `${so2.toFixed(1)} µg/m³` },
  ];

  candidates.sort((a, b) => b.ratio - a.ratio);
  return candidates[0];
}

function formatHourLabel(isoTime) {
  const hourStr = isoTime.split('T')[1]?.slice(0, 2) ?? '00';
  const hour = Number(hourStr);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${suffix}`;
}

function formatHourRange(startIso, endIso) {
  return `${formatHourLabel(startIso)} – ${formatHourLabel(endIso)}`;
}

function computeSafestOutdoorWindow(hourlyTimes, hourlyPm25, currentIsoTime) {
  if (!hourlyTimes?.length || !hourlyPm25?.length) {
    return {
      windowLabel: '1:00 PM – 3:00 PM',
      avgPm25: 0,
      minHourLabel: '2 PM',
      minPm25: 0,
    };
  }

  const todayDate = (currentIsoTime || hourlyTimes[0]).split('T')[0];
  const todayIndices = [];
  for (let i = 0; i < hourlyTimes.length; i++) {
    if (hourlyTimes[i].startsWith(todayDate) && hourlyPm25[i] != null) {
      todayIndices.push(i);
    }
  }

  const indices = todayIndices.length >= 4 ? todayIndices : hourlyTimes.slice(0, 24).map((_, i) => i);

  // Single lowest PM2.5 hour today
  let minIdx = indices[0];
  for (const idx of indices) {
    if (hourlyPm25[idx] < hourlyPm25[minIdx]) {
      minIdx = idx;
    }
  }

  // Find best contiguous 2-hour window today with lowest average PM2.5
  let bestStart = indices[0];
  let bestEnd = indices[Math.min(1, indices.length - 1)];
  let bestAvg = Infinity;

  for (let j = 0; j < indices.length - 1; j++) {
    const i1 = indices[j];
    const i2 = indices[j + 1];
    const avg = (hourlyPm25[i1] + hourlyPm25[i2]) / 2;
    const hourNum = Number(hourlyTimes[i1].split('T')[1]?.slice(0, 2) ?? 0);
    const isDaytime = hourNum >= 7 && hourNum <= 19;
    const bestHourNum = Number(hourlyTimes[bestStart].split('T')[1]?.slice(0, 2) ?? 0);
    const bestIsDaytime = bestHourNum >= 7 && bestHourNum <= 19;

    // Prefer lower PM2.5; if within 0.8 ug/m3 tie, prefer daytime hours
    if (avg < bestAvg - 0.8 || (Math.abs(avg - bestAvg) <= 0.8 && isDaytime && !bestIsDaytime)) {
      bestAvg = avg;
      bestStart = i1;
      bestEnd = i2;
    }
  }

  // Construct end hour (+1h from bestEnd) for a clean 2-hour range label
  const endHourNum = (Number(hourlyTimes[bestEnd].split('T')[1]?.slice(0, 2) ?? 0) + 1) % 24;
  const endDateFake = `2026-01-01T${String(endHourNum).padStart(2, '0')}:00`;

  // Also compute best daytime window (07:00 - 19:00) for practical Afternoon routine scheduling
  const daytimePairs = [];
  for (let j = 0; j < indices.length - 1; j++) {
    const i1 = indices[j];
    const i2 = indices[j + 1];
    const h1 = Number(hourlyTimes[i1].split('T')[1]?.slice(0, 2) ?? 0);
    if (h1 >= 10 && h1 <= 17) {
      daytimePairs.push({ i1, i2, avg: (hourlyPm25[i1] + hourlyPm25[i2]) / 2 });
    }
  }
  daytimePairs.sort((a, b) => a.avg - b.avg);
  const bestDay = daytimePairs[0];
  let daytimeLabel = formatHourRange(hourlyTimes[bestStart], endDateFake);
  let daytimeAvg = Number(bestAvg.toFixed(1));
  if (bestDay) {
    const dayEndHour = (Number(hourlyTimes[bestDay.i2].split('T')[1]?.slice(0, 2) ?? 0) + 1) % 24;
    const dayEndFake = `2026-01-01T${String(dayEndHour).padStart(2, '0')}:00`;
    daytimeLabel = formatHourRange(hourlyTimes[bestDay.i1], dayEndFake);
    daytimeAvg = Number(bestDay.avg.toFixed(1));
  }

  return {
    windowLabel: formatHourRange(hourlyTimes[bestStart], endDateFake),
    avgPm25: Number(bestAvg.toFixed(1)),
    daytimeWindowLabel: daytimeLabel,
    daytimeAvgPm25: daytimeAvg,
    minHourLabel: formatHourLabel(hourlyTimes[minIdx]),
    minPm25: Number(hourlyPm25[minIdx].toFixed(1)),
    bestStartIso: hourlyTimes[bestStart],
    bestEndIso: hourlyTimes[bestEnd],
  };
}

function build24HourForecast(hourly, currentTime) {
  const times = hourly?.time || [];
  const pm25Arr = hourly?.pm2_5 || [];
  const pm10Arr = hourly?.pm10 || [];
  const aqiArr = hourly?.us_aqi || [];

  const currentHourPrefix = currentTime ? currentTime.slice(0, 13) : '';
  let startIdx = times.findIndex((t) => t.startsWith(currentHourPrefix));
  if (startIdx === -1) startIdx = 0;

  const sliceEnd = Math.min(startIdx + 24, times.length);
  const points = [];
  for (let i = startIdx; i < sliceEnd; i++) {
    points.push({
      time: times[i],
      hourLabel: formatHourLabel(times[i]),
      pm25: Number((pm25Arr[i] ?? 0).toFixed(1)),
      pm10: Number((pm10Arr[i] ?? 0).toFixed(1)),
      usAqi: Math.round(aqiArr[i] ?? 0),
    });
  }
  return points;
}

export async function geocodeCity(cityName) {
  const query = cityName.trim();
  if (!query) throw new Error('Please enter a city name.');

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding request failed (${res.status})`);
  }
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${query}". Try a nearby major city.`);
  }

  // Prioritize India match if user typed a city without country qualifier
  const indiaMatch = data.results.find(
    (r) => r.country_code === 'IN' || r.country?.toLowerCase() === 'india'
  );
  const best = indiaMatch || data.results[0];

  return {
    name: best.name,
    admin1: best.admin1 || '',
    country: best.country || '',
    latitude: best.latitude,
    longitude: best.longitude,
  };
}

export async function reverseGeocodeCoords(latitude, longitude) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (!res.ok) throw new Error('Reverse geocode unavailable');
    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision || 'Your Location';
    return {
      name: city,
      admin1: data.principalSubdivision || '',
      country: data.countryName || '',
      latitude,
      longitude,
    };
  } catch {
    return {
      name: `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`,
      admin1: 'GPS Coordinates',
      country: '',
      latitude,
      longitude,
    };
  }
}

export async function fetchAirQualityByCoords(locationMeta) {
  const { latitude, longitude } = locationMeta;
  const url =
    `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone` +
    `&hourly=pm2_5,pm10,us_aqi&timezone=auto&forecast_days=2`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Air Quality API error (${res.status})`);
  }

  const data = await res.json();
  const current = data.current || {};
  const hourly = data.hourly || {};

  const primary = estimatePollutantSubIndices(current);
  const safestWindow = computeSafestOutdoorWindow(
    hourly.time,
    hourly.pm2_5,
    current.time
  );
  const forecast24h = build24HourForecast(hourly, current.time);

  return {
    location: locationMeta,
    timezone: data.timezone || 'IST',
    updatedAt: current.time || new Date().toISOString(),
    usAqi: Math.round(current.us_aqi ?? 0),
    pm25: Number((current.pm2_5 ?? 0).toFixed(1)),
    pm10: Number((current.pm10 ?? 0).toFixed(1)),
    no2: Number((current.nitrogen_dioxide ?? 0).toFixed(1)),
    o3: Number((current.ozone ?? 0).toFixed(1)),
    primaryPollutant: primary.key,
    primaryPollutantValue: primary.value,
    safestWindow,
    forecast24h,
    isFallback: false,
  };
}

export async function fetchAirQualityForCity(cityName = 'Kolkata') {
  const location = await geocodeCity(cityName);
  return fetchAirQualityByCoords(location);
}

// Offline/network-error fallback dataset so the app remains usable if Open-Meteo is unreachable
export function getFallbackKolkataAirQuality() {
  const baseHours = [
    148, 154, 162, 168, 174, 181, 176, 158, 132, 108, 92, 84,
    78, 74, 79, 89, 106, 129, 146, 159, 166, 163, 156, 151,
  ];
  const forecast24h = baseHours.map((pm25, idx) => {
    const suffix = idx >= 12 ? 'PM' : 'AM';
    const h12 = idx % 12 === 0 ? 12 : idx % 12;
    return {
      time: `2026-11-25T${String(idx).padStart(2, '0')}:00`,
      hourLabel: `${h12} ${suffix}`,
      pm25,
      pm10: Math.round(pm25 * 1.45),
      usAqi: Math.round(pm25 * 1.38),
    };
  });

  return {
    location: {
      name: 'Kolkata',
      admin1: 'West Bengal',
      country: 'India',
      latitude: 22.5726,
      longitude: 88.3639,
    },
    timezone: 'Asia/Kolkata',
    updatedAt: new Date().toISOString(),
    usAqi: 184,
    pm25: 118.4,
    pm10: 176.2,
    no2: 46.5,
    o3: 32.1,
    primaryPollutant: 'PM2.5',
    primaryPollutantValue: '118.4 µg/m³',
    safestWindow: {
      windowLabel: '1 PM – 3 PM',
      avgPm25: 76.0,
      minHourLabel: '1 PM',
      minPm25: 74.0,
    },
    forecast24h,
    isFallback: true,
  };
}
