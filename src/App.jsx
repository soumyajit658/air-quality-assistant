import { useCallback, useEffect, useState } from 'react';
import LocationAqiHeader from './components/LocationAqiHeader';
import HouseholdProfileForm from './components/HouseholdProfileForm';
import ActionPlanSection from './components/ActionPlanSection';
import ImpactSimulatorCard from './components/ImpactSimulatorCard';
import { HOME_SETUPS } from './data/profileOptions';
import {
  fetchAirQualityByCoords,
  fetchAirQualityForCity,
  getFallbackKolkataAirQuality,
  reverseGeocodeCoords,
} from './services/airQualityService';
import { generatePersonalizedSmogPlan } from './services/geminiPlanService';

const DEFAULT_PROFILE = {
  members: ['kids', 'elderly'],
  commute: 'petrol',
  homeSetup: ['no_purifier', 'cross_ventilated'],
  habits: ['lpg_induction', 'incense_dhoop'],
};

const DEFAULT_PLEDGES = ['wet_mop', 'skip_incense'];

export default function App() {
  const [airQuality, setAirQuality] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [aqiError, setAqiError] = useState('');

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [runtimeApiKey, setRuntimeApiKey] = useState('');
  const [plan, setPlan] = useState(null);
  const [planGenerating, setPlanGenerating] = useState(false);
  const [selectedPledges, setSelectedPledges] = useState(DEFAULT_PLEDGES);

  const envApiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  const hasGeminiKey = Boolean(runtimeApiKey || envApiKey);

  const loadCityAirQuality = useCallback(async (cityName) => {
    setAqiLoading(true);
    setAqiError('');
    try {
      const data = await fetchAirQualityForCity(cityName);
      setAirQuality(data);
      return data;
    } catch (err) {
      setAqiError(
        `${err.message || 'Unable to reach Open-Meteo.'} Showing offline Kolkata sample telemetry.`
      );
      const fallback = getFallbackKolkataAirQuality();
      setAirQuality((prev) => prev || fallback);
      return null;
    } finally {
      setAqiLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadCityAirQuality('Kolkata');
      if (!cancelled && data) {
        setPlanGenerating(true);
        const initialPlan = await generatePersonalizedSmogPlan(data, DEFAULT_PROFILE, '');
        if (!cancelled) {
          setPlan(initialPlan);
          setPlanGenerating(false);
        }
      } else if (!cancelled) {
        const fallback = getFallbackKolkataAirQuality();
        setAirQuality(fallback);
        const initialPlan = await generatePersonalizedSmogPlan(fallback, DEFAULT_PROFILE, '');
        if (!cancelled) {
          setPlan(initialPlan);
          setPlanGenerating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadCityAirQuality]);

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setAqiError('Browser geolocation is not supported on this device.');
      return;
    }
    setGeoLoading(true);
    setAqiError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locMeta = await reverseGeocodeCoords(latitude, longitude);
          const data = await fetchAirQualityByCoords(locMeta);
          setAirQuality(data);
        } catch (err) {
          setAqiError(err.message || 'Could not fetch AQI for your GPS location.');
        } finally {
          setGeoLoading(false);
        }
      },
      (geoErr) => {
        setGeoLoading(false);
        setAqiError(
          geoErr.code === 1
            ? 'Location permission denied. Enter any city manually above.'
            : 'Unable to determine your location right now.'
        );
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleToggleMember = (id) => {
    setProfile((prev) => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter((m) => m !== id)
        : [...prev.members, id],
    }));
  };

  const handleSelectCommute = (id) => {
    setProfile((prev) => ({ ...prev, commute: id }));
  };

  const handleToggleHomeSetup = (id) => {
    const clicked = HOME_SETUPS.find((h) => h.id === id);
    setProfile((prev) => {
      const exists = prev.homeSetup.includes(id);
      if (exists) {
        return { ...prev, homeSetup: prev.homeSetup.filter((item) => item !== id) };
      }
      let next = [...prev.homeSetup];
      if (clicked?.exclusiveGroup) {
        const groupIds = HOME_SETUPS.filter(
          (h) => h.exclusiveGroup === clicked.exclusiveGroup
        ).map((h) => h.id);
        next = next.filter((item) => !groupIds.includes(item));
      }
      return { ...prev, homeSetup: [...next, id] };
    });
  };

  const handleToggleHabit = (id) => {
    setProfile((prev) => ({
      ...prev,
      habits: prev.habits.includes(id)
        ? prev.habits.filter((h) => h !== id)
        : [...prev.habits, id],
    }));
  };

  const handleGeneratePlan = async () => {
    const telemetry = airQuality || getFallbackKolkataAirQuality();
    setPlanGenerating(true);
    const nextPlan = await generatePersonalizedSmogPlan(telemetry, profile, runtimeApiKey);
    setPlan(nextPlan);
    setPlanGenerating(false);
  };

  const handleTogglePledge = (id) => {
    setSelectedPledges((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <LocationAqiHeader
          airQuality={airQuality}
          loading={aqiLoading}
          error={aqiError}
          onSearchCity={loadCityAirQuality}
          onUseGeolocation={handleUseGeolocation}
          geoLoading={geoLoading}
          hasGeminiKey={hasGeminiKey}
          runtimeApiKey={runtimeApiKey}
          onSaveRuntimeKey={setRuntimeApiKey}
        />

        <HouseholdProfileForm
          profile={profile}
          onToggleMember={handleToggleMember}
          onSelectCommute={handleSelectCommute}
          onToggleHomeSetup={handleToggleHomeSetup}
          onToggleHabit={handleToggleHabit}
          onGeneratePlan={handleGeneratePlan}
          generating={planGenerating}
          hasGeminiKey={hasGeminiKey}
        />

        <ActionPlanSection
          plan={plan}
          generating={planGenerating}
          cityName={airQuality?.location?.name || 'your city'}
        />

        <ImpactSimulatorCard
          selectedPledges={selectedPledges}
          onTogglePledge={handleTogglePledge}
          airQuality={airQuality}
        />

        <footer className="pb-4 pt-2 text-center text-xs text-slate-500">
          VayuSetu · Live air quality powered by Open-Meteo Geocoding &amp; Air Quality APIs · AI action plans by Gemini 2.5 Flash
        </footer>
      </main>
    </div>
  );
}
