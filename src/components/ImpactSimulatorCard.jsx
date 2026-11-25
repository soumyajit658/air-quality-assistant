import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Megaphone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DAILY_PLEDGES } from '../data/profileOptions';
import { getAqiMeta } from '../services/airQualityService';

export default function ImpactSimulatorCard({
  selectedPledges,
  onTogglePledge,
  airQuality,
}) {
  const [copied, setCopied] = useState(false);

  const activePledges = DAILY_PLEDGES.filter((p) => selectedPledges.includes(p.id));
  const totalExposureReduction = activePledges.reduce(
    (sum, p) => sum + p.exposureReductionPct,
    0
  );
  const totalCo2Saved = activePledges.reduce((sum, p) => sum + p.co2SavedKgPerWeek, 0);

  // Max score capped cleanly at 100 based on all 5 pledges
  const maxExposure = DAILY_PLEDGES.reduce((s, p) => s + p.exposureReductionPct, 0);
  const score = Math.round((totalExposureReduction / maxExposure) * 100);

  const buildAdvisoryMessage = () => {
    const city = airQuality?.location?.name || 'Kolkata';
    const aqi = airQuality?.usAqi ?? 180;
    const pm25 = airQuality?.pm25 ?? 110;
    const meta = getAqiMeta(aqi);
    const safest = airQuality?.safestWindow?.windowLabel || '1 PM – 3 PM';
    const safestPm = airQuality?.safestWindow?.avgPm25 ?? 75;

    return [
      `*VayuSetu Neighbourhood Air Advisory — ${city}*`,
      `Current US AQI: *${aqi} (${meta.label})* | PM2.5: *${pm25} µg/m³*`,
      `Safest Outdoor Window today: *${safest}* (avg ${safestPm} µg/m³)`,
      ``,
      `*Today's Community Smog Checklist:*`,
      `• Keep morning/evening outdoor play & walks indoors for kids & elders`,
      `• Ventilate rooms only during ${safest} & seal door gaps after sunset`,
      `• Wet-mop instead of dry sweeping & skip evening dhoop/trash burning`,
      `• Wear a snug N95 mask on main roads or switch short trips to Metro/EV`,
      ``,
      `Shared via VayuSetu Urban Air Assistant`,
    ].join('\n');
  };

  const handleCopyAdvisory = async () => {
    const message = buildAdvisoryMessage();
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2600);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(buildAdvisoryMessage())}`;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Interactive Impact Simulator */}
      <div className="lg:col-span-7 rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5 sm:p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Interactive Impact Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle 5 high-impact daily pledges to simulate your household&apos;s weekly protection.
            </p>
          </div>
          <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">
            {activePledges.length} / {DAILY_PLEDGES.length} active
          </span>
        </div>

        {/* Weekly Household Exposure & Emission Reduction Score Bar */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Weekly Household Exposure &amp; Emission Reduction Score
            </span>
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {score}
              <span className="text-sm font-normal text-slate-500"> / 100</span>
            </span>
          </div>

          <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              style={{ width: `${score}%` }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-500 ease-out"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-300">
              Estimated PM2.5 exposure cut:{' '}
              <strong className="font-mono text-emerald-300">
                -{totalExposureReduction}%
              </strong>
            </span>
            <span className="text-slate-300">
              Weekly CO₂ prevented:{' '}
              <strong className="font-mono text-emerald-300">
                {totalCo2Saved.toFixed(1)} kg CO₂/wk
              </strong>
            </span>
          </div>
        </div>

        {/* 5 Daily Pledges Checklist */}
        <div className="mt-4 space-y-2.5">
          {DAILY_PLEDGES.map((pledge) => {
            const checked = selectedPledges.includes(pledge.id);
            return (
              <button
                key={pledge.id}
                type="button"
                onClick={() => onTogglePledge(pledge.id)}
                className={`w-full flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                  checked
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/55 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      checked
                        ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold">{pledge.title}</div>
                    <div className="mt-0.5 text-[11px] text-emerald-400/90 font-medium">
                      {pledge.impactLabel}
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-block shrink-0 rounded-lg border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {pledge.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Community Advisory Card */}
      <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-5 sm:p-6 shadow-xl shadow-black/30">
        <div>
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Megaphone className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Community Smog Card</h2>
              <p className="text-xs text-slate-400">
                Alert your RWA, school parent group, or neighbours on WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/85 p-4 text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-line">
            {buildAdvisoryMessage()}
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={handleCopyAdvisory}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Copied WhatsApp Advisory!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Community Advisory</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Open directly in WhatsApp</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </section>
  );
}
