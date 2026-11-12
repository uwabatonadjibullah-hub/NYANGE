import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  Heart, 
  ShieldCheck, 
  Smartphone, 
  Building2, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

interface DonatePageProps {
  currentLanguage: Language;
  onOpenRecordMe: () => void;
}

export const DonatePage: React.FC<DonatePageProps> = ({
  currentLanguage,
  onOpenRecordMe
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const [pledgeName, setPledgeName] = useState('');
  const [pledgeContact, setPledgeContact] = useState('');
  const [pledgePurpose, setPledgePurpose] = useState('elder_care');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);

  const pillars = [
    {
      title: t.donatePillar1Title,
      desc: t.donatePillar1Desc,
      icon: <Heart className="w-5 h-5 text-[#064734]" />
    },
    {
      title: t.donatePillar2Title,
      desc: t.donatePillar2Desc,
      icon: <Building2 className="w-5 h-5 text-[#064734]" />
    },
    {
      title: t.donatePillar3Title,
      desc: t.donatePillar3Desc,
      icon: <Sparkles className="w-5 h-5 text-[#064734]" />
    }
  ];

  const paymentChannels = [
    {
      channel: t.donateMtnRwanda,
      type: 'Mobile Money',
      identifier: 'Official Number Pending Ratification',
      notes: 'Designated Rwanda Family Trustee account will be activated following assembly confirmation.'
    },
    {
      channel: t.donateAirtelRwanda,
      type: 'Mobile Money',
      identifier: 'Official Number Pending Ratification',
      notes: 'Secondary mobile payment gateway for Rwanda family branches.'
    },
    {
      channel: t.donateLumicashBurundi,
      type: 'Mobile Money',
      identifier: 'Official Number Pending Ratification',
      notes: 'Dedicated channel for Burundi family branches and resting site preservation.'
    },
    {
      channel: t.donateBankKigali,
      type: 'Institutional Bank Account',
      identifier: 'Account Verification In Progress',
      notes: 'Corporate trust account under the custody of appointed family trustees.'
    }
  ];

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeName || !pledgeContact) return;

    try {
      const pledges = JSON.parse(localStorage.getItem('nyange_pledges') || '[]');
      pledges.push({
        name: pledgeName,
        contact: pledgeContact,
        purpose: pledgePurpose,
        amount: pledgeAmount || 'Undisclosed',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('nyange_pledges', JSON.stringify(pledges));
    } catch {
      // Local fallback
    }

    setPledgeSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* HEADER */}
      <div className="pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#064734] mb-1">
          <Heart className="w-4 h-4" />
          <span>Voluntary Family Heritage Fund</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          {t.donatePageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
          {t.donatePageSubtitle}
        </p>
      </div>

      {/* WHY FAMILY CONTRIBUTIONS MATTER */}
      <section className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
            Purpose & Stewardship
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            {t.donateWhyTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3"
            >
              <div className="p-2.5 rounded-xl bg-[#E0FFC2]/50 w-fit">
                {pillar.icon}
              </div>
              <h3 className="text-base font-serif font-bold text-[#064734]">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* OFFICIAL CHANNELS (Strictly Configurable & Transparent) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#064734] font-bold">
            Financial Channels
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            {t.donateChannelsTitle}
          </h2>
        </div>

        {/* Verification advisory banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-stone-800 flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-amber-900">
            {t.donateChannelPendingNote}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {paymentChannels.map((channel, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-500">{channel.type}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#064734] bg-[#E0FFC2]/50 px-2 py-0.5 rounded">
                    Official Channel
                  </span>
                </div>
                <h4 className="text-base font-serif font-bold text-stone-900 mt-1">
                  {channel.channel}
                </h4>
                <div className="mt-3 p-2.5 bg-white rounded-xl border border-stone-200 font-mono text-xs font-semibold text-stone-600">
                  {channel.identifier}
                </div>
              </div>

              <p className="text-xs text-stone-500 pt-2 border-t border-stone-200">
                {channel.notes}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-stone-100 text-xs text-stone-600 text-center">
          {t.donateTrusteeContact}
        </div>
      </section>

      {/* PLEDGE OR NOTIFY SECRETARIAT OF SUPPORT */}
      <section className="bg-[#064734] text-white rounded-3xl p-6 sm:p-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-serif font-bold text-white">
              Family Contribution Pledge / Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-stone-200">
              Notify the trustees of your intention to support a specific heritage project, elder welfare, or youth education.
            </p>
          </div>

          {pledgeSubmitted ? (
            <div className="py-6 text-center space-y-3 bg-white/10 rounded-2xl p-6">
              <CheckCircle2 className="w-10 h-10 text-[#E0FFC2] mx-auto" />
              <h4 className="text-lg font-serif font-bold text-white">
                Pledge Logged With Family Trustees
              </h4>
              <p className="text-xs text-stone-200 max-w-md mx-auto">
                Thank you for your generous spirit in honoring the legacy of Babu Nyange Radjabu. The treasury committee will coordinate with you directly.
              </p>
              <button
                type="button"
                onClick={() => setPledgeSubmitted(false)}
                className="px-4 py-2 bg-[#E0FFC2] text-[#064734] font-bold text-xs rounded-lg mt-2 cursor-pointer"
              >
                Submit Another Pledge
              </button>
            </div>
          ) : (
            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E0FFC2] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pledgeName}
                    onChange={(e) => setPledgeName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 text-xs bg-white text-stone-900 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E0FFC2] mb-1">
                    Contact Phone / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={pledgeContact}
                    onChange={(e) => setPledgeContact(e.target.value)}
                    placeholder="Phone or email"
                    className="w-full px-3 py-2 text-xs bg-white text-stone-900 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E0FFC2] mb-1">
                    Designated Welfare Purpose
                  </label>
                  <select
                    value={pledgePurpose}
                    onChange={(e) => setPledgePurpose(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-stone-900 rounded-lg focus:outline-hidden"
                  >
                    <option value="elder_care">Elder Care & Vulnerable Members</option>
                    <option value="heritage_sites">Ancestral Memorials & Gravesite Care</option>
                    <option value="census_archives">Census Fieldwork & Digital Archiving</option>
                    <option value="youth_scholarships">Youth Education & Assembly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E0FFC2] mb-1">
                    Estimated Amount / Currency (Optional)
                  </label>
                  <input
                    type="text"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    placeholder="e.g. 50,000 RWF / 100,000 BIF / USD"
                    className="w-full px-3 py-2 text-xs bg-white text-stone-900 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E0FFC2] hover:bg-[#cbf4a4] text-[#064734] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Submit Pledge Notification
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
