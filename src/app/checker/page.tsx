'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { evaluateEligibility } from '@/lib/rules-engine/evaluator';
import { UserProfile, Province, EmploymentType, AssessmentResult } from '@/lib/rules-engine/types';
import {
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, XCircle,
  HelpCircle, MapPin, Users, Briefcase, GraduationCap, Heart,
  Accessibility, ArrowRight, RotateCcw, MessageCircle, Banknote,
  HeartPulse, ShieldPlus, Package, FileText, ExternalLink, Phone, Globe, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

const PROVINCES: { value: Province; label: string; labelUr: string }[] = [
  { value: 'punjab', label: 'Punjab', labelUr: 'پنجاب' },
  { value: 'sindh', label: 'Sindh', labelUr: 'سندھ' },
  { value: 'kpk', label: 'Khyber Pakhtunkhwa', labelUr: 'خیبرپختونخوا' },
  { value: 'balochistan', label: 'Balochistan', labelUr: 'بلوچستان' },
  { value: 'islamabad', label: 'Islamabad (ICT)', labelUr: 'اسلام آباد' },
  { value: 'ajk', label: 'Azad Jammu & Kashmir', labelUr: 'آزاد جموں و کشمیر' },
  { value: 'gilgit_baltistan', label: 'Gilgit-Baltistan', labelUr: 'گلگت بلتستان' },
];

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'daily_wage', label: 'Daily Wage Worker' },
  { value: 'agricultural', label: 'Agricultural / Farming' },
  { value: 'domestic_worker', label: 'Domestic Worker' },
  { value: 'self_employed', label: 'Self-Employed / Small Business' },
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
];

const STATUS_CONFIG = {
  LIKELY_ELIGIBLE: { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Likely Eligible', class: 'status-eligible', color: '#34D399' },
  MAY_BE_ELIGIBLE: { icon: <AlertCircle className="w-5 h-5" />, label: 'May Be Eligible', class: 'status-maybe', color: '#FBBF24' },
  LIKELY_NOT_ELIGIBLE: { icon: <XCircle className="w-5 h-5" />, label: 'Likely Not Eligible', class: 'status-unlikely', color: '#FB7185' },
  INSUFFICIENT_DATA: { icon: <HelpCircle className="w-5 h-5" />, label: 'More Info Needed', class: 'status-maybe', color: '#94A3B8' },
};

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  kafaalat: <Banknote className="w-5 h-5" />, taleemi_wazaif: <GraduationCap className="w-5 h-5" />,
  nashonuma: <HeartPulse className="w-5 h-5" />, sehat_sahulat: <ShieldPlus className="w-5 h-5" />,
  ramzan_relief: <Package className="w-5 h-5" />,
};

const STEPS = [
  { id: 'province', icon: <MapPin className="w-5 h-5" /> },
  { id: 'household', icon: <Users className="w-5 h-5" /> },
  { id: 'income', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'children', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'health', icon: <Heart className="w-5 h-5" /> },
];

export default function CheckerPage() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [profile, setProfile] = useState<UserProfile>({});
  const isEn = language === 'en';

  const handleSubmit = () => {
    const assessment = evaluateEligibility(profile);
    setResults(assessment);
  };

  const reset = () => { setStep(0); setProfile({}); setResults(null); };

  if (results) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-cream">Your Results</h1>
              <p className="text-sage-400 mt-1">Based on the information you provided</p>
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sage-400 hover:text-cream text-sm"><RotateCcw className="w-4 h-4" /> Start Over</button>
              <Link href="/navigator" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 text-sm font-bold"><MessageCircle className="w-4 h-4" /> Talk to AI</Link>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-gold rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div><div className="text-3xl font-bold text-emerald-400">{results.likelyEligibleCount}</div><div className="text-sm text-sage-400">Likely Eligible</div></div>
              <div><div className="text-3xl font-bold text-yellow-400">{results.mayBeEligibleCount}</div><div className="text-sm text-sage-400">May Be Eligible</div></div>
              <div><div className="text-3xl font-bold text-sage-400">{results.totalProgramsChecked}</div><div className="text-sm text-sage-400">Programs Checked</div></div>
            </div>
          </div>

          {/* Cross-program alerts */}
          {results.crossProgramAlerts.en.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-6">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">🔗 Cross-Program Benefits</h3>
              {results.crossProgramAlerts.en.map((a, i) => <p key={i} className="text-sm text-sage-300">{a}</p>)}
            </div>
          )}

          {/* Result cards */}
          <div className="space-y-4">
            {results.results.map(r => {
              const s = STATUS_CONFIG[r.status];
              return (
                <div key={r.programId} className="glass rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${r.program.color}15`, color: r.program.color }}>{PROGRAM_ICONS[r.programId]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-cream">{isEn ? r.program.name.en : r.program.name.ur}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${s.class}`}>{s.label}</span>
                      </div>
                      <p className="text-sm text-gold-400 mt-1">{isEn ? r.program.benefit.en : r.program.benefit.ur}</p>
                      <p className="text-sm text-sage-400 mt-2">{isEn ? r.explanation.en : r.explanation.ur}</p>
                      {r.provinceNote && <div className="mt-3 p-3 rounded-lg bg-gold-500/5 border border-gold-500/20"><p className="text-xs text-gold-400">⚠️ {isEn ? r.provinceNote.en : r.provinceNote.ur}</p></div>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.program.registrationChannels.slice(0, 2).map((ch, i) => (
                          <span key={i} className="text-xs px-3 py-1.5 rounded-lg glass text-sage-300 flex items-center gap-1.5">
                            {ch.type === 'sms' && <><MessageSquare className="w-3 h-3" /> SMS {ch.smsCode}</>}
                            {ch.type === 'helpline' && <><Phone className="w-3 h-3" /> {ch.phone}</>}
                            {ch.type === 'web_portal' && <><Globe className="w-3 h-3" /> Online</>}
                            {ch.type === 'in_person' && <><MapPin className="w-3 h-3" /> In Person</>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
            <p className="text-xs text-gold-400/80">⚠️ {results.disclaimer.en}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-cream mb-2">{t('checker.title')}</h1>
          <p className="text-sage-400">{t('checker.desc')}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${i <= step ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'glass text-sage-600'}`}>{s.icon}</div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-gold-500/50' : 'bg-border-subtle'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Step 0: Province */}
          {step === 0 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.province')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {PROVINCES.map(p => (
                  <button key={p.value} onClick={() => { setProfile(prev => ({ ...prev, province: p.value })); setStep(1); }}
                    className={`p-4 rounded-xl text-left transition-all ${profile.province === p.value ? 'bg-gold-500/15 border border-gold-500/30 text-gold-400' : 'glass text-sage-400 hover:text-cream hover:bg-emerald-800/30'}`}>
                    <div className="font-medium text-sm">{p.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{p.labelUr}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Household */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.household')}</h2>
              <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                  <button key={n} onClick={() => { setProfile(prev => ({ ...prev, householdSize: n })); setStep(2); }}
                    className={`p-4 rounded-xl text-center font-bold text-lg transition-all ${profile.householdSize === n ? 'bg-gold-500/15 border border-gold-500/30 text-gold-400' : 'glass text-sage-400 hover:text-cream'}`}>
                    {n}{n === 12 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Employment */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.income')}</h2>
              <div className="space-y-3">
                {EMPLOYMENT_TYPES.map(e => (
                  <button key={e.value} onClick={() => { setProfile(prev => ({ ...prev, employmentType: e.value })); setStep(3); }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${profile.employmentType === e.value ? 'bg-gold-500/15 border border-gold-500/30 text-gold-400' : 'glass text-sage-400 hover:text-cream hover:bg-emerald-800/30'}`}>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Children */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.children')}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { setProfile(prev => ({ ...prev, hasSchoolAgeChildren: true })); }}
                    className={`p-6 rounded-xl text-center transition-all ${profile.hasSchoolAgeChildren === true ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'glass text-sage-400 hover:text-cream'}`}>
                    <div className="text-2xl mb-2">✓</div>Yes
                  </button>
                  <button onClick={() => { setProfile(prev => ({ ...prev, hasSchoolAgeChildren: false })); setStep(4); }}
                    className={`p-6 rounded-xl text-center transition-all ${profile.hasSchoolAgeChildren === false ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'glass text-sage-400 hover:text-cream'}`}>
                    <div className="text-2xl mb-2">✗</div>No
                  </button>
                </div>
                {profile.hasSchoolAgeChildren && (
                  <div className="animate-fade-in-up">
                    <p className="text-sm text-sage-400 mb-3">How many school-age children?</p>
                    <div className="flex gap-3">
                      {[1,2,3,4,5,6].map(n => (
                        <button key={n} onClick={() => { setProfile(prev => ({ ...prev, schoolAgeChildrenCount: n })); setStep(4); }}
                          className="w-12 h-12 rounded-xl glass text-sage-400 hover:text-cream font-bold">{n}{n===6?'+':''}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Health */}
          {step === 4 && (
            <div className="animate-fade-in-up space-y-6">
              <h2 className="text-xl font-bold text-cream">{t('checker.pregnant')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setProfile(prev => ({ ...prev, hasPregnantMember: true, hasChildrenUnder2: true }))}
                  className={`p-4 rounded-xl text-center transition-all ${profile.hasPregnantMember ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'glass text-sage-400 hover:text-cream'}`}>Yes</button>
                <button onClick={() => setProfile(prev => ({ ...prev, hasPregnantMember: false, hasChildrenUnder2: false }))}
                  className={`p-4 rounded-xl text-center transition-all ${profile.hasPregnantMember === false ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'glass text-sage-400 hover:text-cream'}`}>No</button>
              </div>

              <h2 className="text-xl font-bold text-cream">{t('checker.disabled')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setProfile(prev => ({ ...prev, hasDisabledMember: true }))}
                  className={`p-4 rounded-xl text-center transition-all ${profile.hasDisabledMember ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'glass text-sage-400 hover:text-cream'}`}>Yes</button>
                <button onClick={() => setProfile(prev => ({ ...prev, hasDisabledMember: false }))}
                  className={`p-4 rounded-xl text-center transition-all ${profile.hasDisabledMember === false ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'glass text-sage-400 hover:text-cream'}`}>No</button>
              </div>

              <button onClick={handleSubmit}
                className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 font-bold text-lg hover:from-gold-500 hover:to-gold-400 transition-all flex items-center justify-center gap-2">
                {t('checker.submit')} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Back button */}
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="mt-6 flex items-center gap-2 text-sm text-sage-500 hover:text-cream transition-colors">
              <ChevronLeft className="w-4 h-4" /> {t('checker.back')}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
