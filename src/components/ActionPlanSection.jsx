import { useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  Info,
  Leaf,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Sunrise,
  TrendingDown,
} from 'lucide-react';

const TABS = [
  { id: 'routine', label: 'Low-Emission Daily Routine', icon: CalendarClock },
  { id: 'indoor', label: 'Indoor Air Quality Hacks', icon: Shield },
  { id: 'alternatives', label: 'Sustainable Alternatives', icon: Leaf },
];

const TIME_ICONS = {
  Morning: Sunrise,
  Afternoon: Sun,
  Evening: Moon,
};

function DirectImpactBadge({ impact }) {
  return (
    <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-300">
      <TrendingDown className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
      <span>
        <span className="text-emerald-400/90 uppercase tracking-wider text-[10px] mr-1.5">
          Direct Impact:
        </span>
        {impact}
      </span>
    </div>
  );
}

export default function ActionPlanSection({ plan, generating, cityName }) {
  const [activeTab, setActiveTab] = useState('routine');

  if (generating) {
    return (
      <section className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-6 shadow-xl shadow-black/30">
        <div className="flex items-center gap-3 text-emerald-300">
          <Sparkles className="h-5 w-5 animate-spin" />
          <h2 className="text-lg font-bold text-white">
            Building your personalized smog plan for {cityName}...
          </h2>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-44 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-slate-800" />
              <div className="mt-3 h-5 w-3/4 rounded bg-slate-800" />
              <div className="mt-3 h-12 w-full rounded bg-slate-800/70" />
              <div className="mt-4 h-7 w-2/3 rounded-xl bg-emerald-500/10" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!plan) return null;

  return (
    <section className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5 sm:p-6 shadow-xl shadow-black/30">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span>Personalized Smog Action Plan</span>
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                plan.mode === 'gemini'
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300'
              }`}
            >
              {plan.mode === 'gemini' ? 'Gemini 2.5 Flash' : 'Smart Demo Mode'}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {plan.summary}
          </p>
        </div>
      </div>

      {plan.errorNote && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-200">
          <Info className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{plan.errorNote}</span>
        </div>
      )}

      {/* 3 Tabs */}
      <div
        role="tablist"
        aria-label="Action Plan Categories"
        className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-1.5"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {activeTab === 'routine' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.routine.map((item, idx) => {
              const TimeIcon = TIME_ICONS[item.timeOfDay] || CalendarClock;
              return (
                <article
                  key={`${item.timeOfDay}-${idx}`}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/75 p-4.5 hover:border-emerald-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                        <TimeIcon className="h-4 w-4" />
                        {item.timeOfDay}
                      </span>
                      <span className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                        {item.timeWindow}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {item.description}
                    </p>
                  </div>
                  <DirectImpactBadge impact={item.directImpact} />
                </article>
              );
            })}
          </div>
        )}

        {activeTab === 'indoor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.indoorHacks.map((hack, idx) => (
              <article
                key={`${hack.title}-${idx}`}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/75 p-4.5 hover:border-emerald-500/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {hack.title}
                    </h3>
                    <span className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                      {hack.costLevel}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {hack.description}
                  </p>
                </div>
                <DirectImpactBadge impact={hack.directImpact} />
              </article>
            ))}
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.sustainableAlternatives.map((alt, idx) => (
              <article
                key={`${alt.swapTo}-${idx}`}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/75 p-4.5 hover:border-emerald-500/40 transition-all"
              >
                <div>
                  <div className="flex flex-col gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 p-2.5 text-xs">
                    <span className="text-slate-400 line-through decoration-rose-400/70">
                      {alt.currentHabit}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {alt.swapTo}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {alt.description}
                  </p>
                </div>
                <DirectImpactBadge impact={alt.directImpact} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
