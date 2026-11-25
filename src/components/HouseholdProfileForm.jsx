import {
  Baby,
  Bike,
  Building2,
  Bus,
  Car,
  Check,
  Flame,
  HeartPulse,
  Home,
  PawPrint,
  Sparkles,
  TrainFront,
  UserCheck,
  Wind,
} from 'lucide-react';
import {
  COMMUTE_MODES,
  COOKING_WASTE_HABITS,
  HOME_SETUPS,
  HOUSEHOLD_MEMBERS,
} from '../data/profileOptions';

const MEMBER_ICONS = {
  kids: Baby,
  elderly: UserCheck,
  respiratory: HeartPulse,
  pets: PawPrint,
};

const COMMUTE_ICONS = {
  petrol: Car,
  diesel: Bus,
  metro_ev: TrainFront,
  walk_cycle: Bike,
};

export default function HouseholdProfileForm({
  profile,
  onToggleMember,
  onSelectCommute,
  onToggleHomeSetup,
  onToggleHabit,
  onGeneratePlan,
  generating,
  hasGeminiKey,
}) {
  return (
    <section className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5 sm:p-6 shadow-xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Home className="h-5 w-5 text-emerald-400" />
            <span>Household &amp; Lifestyle Profile</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tailor your daily smog shield to who lives with you, how you commute, and your home setup.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {/* 1. Household Members */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            1. Household Members (select all that apply)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {HOUSEHOLD_MEMBERS.map((item) => {
              const active = profile.members.includes(item.id);
              const Icon = MEMBER_ICONS[item.id] || UserCheck;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleMember(item.id)}
                  className={`group flex flex-col items-start rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                    active
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-white shadow-sm shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon
                      className={`h-4 w-4 ${
                        active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {active && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="mt-2 text-xs font-semibold">{item.label}</span>
                  <span className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Daily Commute Mode */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            2. Primary Daily Commute Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {COMMUTE_MODES.map((mode) => {
              const active = profile.commute === mode.id;
              const Icon = COMMUTE_ICONS[mode.id] || Car;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSelectCommute(mode.id)}
                  className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                    active
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span
                      className={`h-2.5 w-2.5 rounded-full border ${
                        active
                          ? 'border-emerald-400 bg-emerald-400'
                          : 'border-slate-600 bg-transparent'
                      }`}
                    />
                  </div>
                  <span className="mt-2 text-xs font-semibold">{mode.label}</span>
                  <span className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">
                    {mode.emissionFactor}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Home Setup + 4. Cooking & Waste Habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              3. Home Setup
            </label>
            <div className="flex flex-wrap gap-2">
              {HOME_SETUPS.map((setup) => {
                const active = profile.homeSetup.includes(setup.id);
                return (
                  <button
                    key={setup.id}
                    type="button"
                    onClick={() => onToggleHomeSetup(setup.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className={`h-3.5 w-3.5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{setup.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              4. Cooking &amp; Household Habits
            </label>
            <div className="flex flex-wrap gap-2">
              {COOKING_WASTE_HABITS.map((habit) => {
                const active = profile.habits.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => onToggleHabit(habit.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Flame className={`h-3.5 w-3.5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{habit.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate CTA */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>
              {hasGeminiKey
                ? 'Powered by Gemini 2.5 Flash using live Open-Meteo telemetry.'
                : 'Running in Smart Demo Mode — add VITE_GEMINI_API_KEY anytime for live Gemini 2.5 Flash.'}
            </span>
          </p>

          <button
            type="button"
            onClick={onGeneratePlan}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            <span>
              {generating ? 'Crafting Smog Plan...' : 'Generate Personalized Smog Plan'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
