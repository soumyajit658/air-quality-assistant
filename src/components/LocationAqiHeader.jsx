import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Crosshair,
  KeyRound,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import { POPULAR_INDIAN_CITIES } from '../data/profileOptions';
import { getAqiMeta } from '../services/airQualityService';

export default function LocationAqiHeader({
  airQuality,
  loading,
  error,
  onSearchCity,
  onUseGeolocation,
  geoLoading,
  hasGeminiKey,
  runtimeApiKey,
  onSaveRuntimeKey,
}) {
  const [cityInput, setCityInput] = useState(airQuality?.location?.name || 'Kolkata');
  const [hoveredHour, setHoveredHour] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyDraft, setKeyDraft] = useState(runtimeApiKey || '');

  const aqiMeta = getAqiMeta(airQuality?.usAqi ?? 0);
  const forecast = airQuality?.forecast24h || [];
  const maxPm25 = Math.max(...forecast.map((f) => f.pm25), 50);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      onSearchCity(cityInput.trim());
    }
  };

  const handleQuickCity = (city) => {
    setCityInput(city);
    onSearchCity(city);
  };

  const handleKeySubmit = (e) => {
    e.preventDefault();
    onSaveRuntimeKey(keyDraft.trim());
    setShowKeyModal(false);
  };

  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/35 p-5 sm:p-7 shadow-2xl shadow-black/40">
      {/* Subtle atmospheric glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

      {/* Top Bar: Brand + Mode / API Key toggle */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/25">
            <Wind className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                VayuSetu
              </h1>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                Winter Smog Guard
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Urban Air Quality Assistant for Indian Families &amp; Communities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setKeyDraft(runtimeApiKey || '');
              setShowKeyModal((prev) => !prev);
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
              hasGeminiKey
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-amber-500/35 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {hasGeminiKey ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gemini 2.5 Flash Active</span>
              </>
            ) : (
              <>
                <KeyRound className="h-3.5 w-3.5" />
                <span>Smart Demo Mode · Add Key</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional Runtime Gemini Key Drawer */}
      {showKeyModal && (
        <form
          onSubmit={handleKeySubmit}
          className="relative mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4"
        >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Gemini API Key (overrides VITE_GEMINI_API_KEY in browser session)
            </label>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="AIza... (leave blank to stay in Smart Demo Mode)"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 sm:pt-5">
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Save Key
            </button>
            <button
              type="button"
              onClick={() => setShowKeyModal(false)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search & Geolocation Bar */}
      <div className="relative mt-6 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSubmit} className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Enter any Indian or global city (e.g., Kolkata, Delhi, Patna)..."
                aria-label="City name"
                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/75 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>Check AQI</span>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onUseGeolocation}
            disabled={geoLoading || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-300 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
          >
            <Crosshair className={`h-4 w-4 ${geoLoading ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
            <span>{geoLoading ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>

        {/* Quick Indian city selector pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Quick cities:</span>
          {POPULAR_INDIAN_CITIES.map((city) => {
            const isActive =
              airQuality?.location?.name?.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickCity(city)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800/70 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Live Telemetry Grid */}
      {!airQuality && loading && (
        <div className="relative mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12 animate-pulse">
          <div className="lg:col-span-5 h-52 rounded-2xl border border-slate-800 bg-slate-950/75 p-5" />
          <div className="lg:col-span-7 h-52 rounded-2xl border border-slate-800 bg-slate-950/75 p-5" />
        </div>
      )}

      {airQuality && (
        <div className="relative mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Main AQI & Location Card */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950/75 p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {airQuality.location.name}
                    {airQuality.location.admin1 ? `, ${airQuality.location.admin1}` : ''}
                    {airQuality.location.country ? ` · ${airQuality.location.country}` : ''}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-mono text-5xl font-bold tracking-tight text-white">
                    {airQuality.usAqi}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    US AQI
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${aqiMeta.badgeBg}`}
              >
                <span className={`h-2 w-2 rounded-full ${aqiMeta.dotColor} animate-pulse-soft`} />
                {aqiMeta.label}
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              {aqiMeta.advice}
            </p>

            {/* Key Pollutant Strip */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-800/80">
              <div className="rounded-xl bg-slate-900/90 px-3 py-2">
                <div className="text-[11px] text-slate-400">PM2.5</div>
                <div className="font-mono text-sm font-semibold text-slate-100">
                  {airQuality.pm25}{' '}
                  <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/90 px-3 py-2">
                <div className="text-[11px] text-slate-400">PM10</div>
                <div className="font-mono text-sm font-semibold text-slate-100">
                  {airQuality.pm10}{' '}
                  <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/90 px-3 py-2">
                <div className="text-[11px] text-slate-400">Primary</div>
                <div className="font-mono text-sm font-semibold text-emerald-300">
                  {airQuality.primaryPollutant}
                </div>
              </div>
            </div>
          </div>

          {/* Safest Outdoor Window + 24-Hour PM2.5 Forecast */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950/75 p-5 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Safest Outdoor Window Today
                    </span>
                    {airQuality.isFallback && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                        Offline Sample
                      </span>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white">
                    {airQuality.safestWindow?.windowLabel}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      (avg {airQuality.safestWindow?.avgPm25} µg/m³ PM2.5)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Lowest hour: {airQuality.safestWindow?.minHourLabel} ({airQuality.safestWindow?.minPm25} µg/m³)</span>
              </div>
            </div>

            {/* 24-Hour Hourly PM2.5 Forecast Bars */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  24-Hour Hourly PM2.5 Forecast (µg/m³)
                </span>
                <span className="font-mono text-[11px] text-emerald-300">
                  {hoveredHour
                    ? `${hoveredHour.hourLabel}: ${hoveredHour.pm25} µg/m³ (AQI ${hoveredHour.usAqi})`
                    : 'Hover bars for hourly details'}
                </span>
              </div>

              <div
                className="flex items-end gap-1 h-24 pt-2"
                onMouseLeave={() => setHoveredHour(null)}
              >
                {forecast.map((point) => {
                  const heightPct = Math.max(12, Math.round((point.pm25 / maxPm25) * 100));
                  const isSafest =
                    point.time === airQuality.safestWindow?.bestStartIso ||
                    point.time === airQuality.safestWindow?.bestEndIso;
                  const pointMeta = getAqiMeta(point.usAqi);

                  return (
                    <div
                      key={point.time}
                      onMouseEnter={() => setHoveredHour(point)}
                      className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                    >
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-all duration-200 group-hover:brightness-125 ${
                          isSafest
                            ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                            : pointMeta.barClass + ' opacity-75 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis labels (every 4th hour) */}
              <div className="mt-1.5 flex justify-between text-[10px] font-mono text-slate-500">
                {forecast
                  .filter((_, idx) => idx % 4 === 0)
                  .map((p) => (
                    <span key={p.time}>{p.hourLabel}</span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
