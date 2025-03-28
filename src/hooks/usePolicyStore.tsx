
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from './useLanguageStore';

interface PolicyState {
  policyText: {
    de: string;
    en: string;
  };
  policyImageUrl: string | null;
  updatePolicyText: (text: string, language: Language) => void;
  updatePolicyImage: (imageUrl: string | null) => void;
  getPolicyText: (language: Language) => string;
}

// Default policy text - German
const DEFAULT_POLICY_TEXT_DE = `
<h3 class="text-xl font-bold mb-4">Besucherrichtlinie der Firma Leuka</h3>
                
<p class="mb-4">
  Willkommen bei der Firma Leuka. Um die Sicherheit und den Datenschutz aller Mitarbeiter und Besucher zu gewährleisten, bitten wir Sie, die folgenden Richtlinien zu beachten:
</p>

<ol class="list-decimal pl-6 space-y-3">
  <li>Besucher müssen sich bei Ankunft und Abreise am Empfang oder über dieses Self-Check-In-System anmelden und abmelden.</li>
  <li>Besucher erhalten eine Besuchernummer, die während des gesamten Aufenthalts mitzuführen ist.</li>
  <li>Besucher dürfen sich nur in Begleitung ihres Ansprechpartners oder einer autorisierten Person in den Räumlichkeiten aufhalten.</li>
  <li>Die Verwendung von Fotografie- oder Aufnahmegeräten ist ohne ausdrückliche Genehmigung untersagt.</li>
  <li>Vertrauliche Informationen, die während des Besuchs erlangt werden, sind streng vertraulich zu behandeln.</li>
  <li>Im Falle eines Notfalls oder einer Evakuierung folgen Sie bitte den Anweisungen des Personals.</li>
  <li>Bitte respektieren Sie die Arbeitsumgebung und vermeiden Sie übermäßigen Lärm oder Störungen.</li>
  <li>Rauchen ist nur in den ausgewiesenen Bereichen gestattet.</li>
  <li>Die Firma Leuka übernimmt keine Haftung für persönliche Gegenstände von Besuchern.</li>
  <li>Bei Verstößen gegen diese Richtlinien behält sich die Firma Leuka das Recht vor, den Besuch zu beenden.</li>
</ol>

<p class="mt-4">
  Durch die Bestätigung dieser Richtlinien erklären Sie, dass Sie diese gelesen und verstanden haben und sich während Ihres Besuchs daran halten werden.
</p>
`;

// Default policy text - English
const DEFAULT_POLICY_TEXT_EN = `
<h3 class="text-xl font-bold mb-4">Visitor Policy of Leuka Company</h3>
                
<p class="mb-4">
  Welcome to Leuka Company. To ensure the safety and data privacy of all employees and visitors, we kindly ask you to observe the following guidelines:
</p>

<ol class="list-decimal pl-6 space-y-3">
  <li>Visitors must check in and check out at reception or through this self-check-in system upon arrival and departure.</li>
  <li>Visitors will receive a visitor number which must be carried throughout their stay.</li>
  <li>Visitors may only be in the premises when accompanied by their contact person or an authorized person.</li>
  <li>The use of photography or recording equipment is prohibited without express permission.</li>
  <li>Confidential information obtained during the visit must be treated as strictly confidential.</li>
  <li>In the event of an emergency or evacuation, please follow staff instructions.</li>
  <li>Please respect the work environment and avoid excessive noise or disruptions.</li>
  <li>Smoking is only permitted in designated areas.</li>
  <li>Leuka Company assumes no liability for visitors' personal belongings.</li>
  <li>In case of violations of these guidelines, Leuka Company reserves the right to terminate the visit.</li>
</ol>

<p class="mt-4">
  By confirming these guidelines, you declare that you have read and understood them and will adhere to them during your visit.
</p>
`;

export const usePolicyStore = create<PolicyState>()(
  persist(
    (set, get) => ({
      policyText: {
        de: DEFAULT_POLICY_TEXT_DE,
        en: DEFAULT_POLICY_TEXT_EN
      },
      policyImageUrl: null,
      
      updatePolicyText: (text, language) => {
        set(state => ({
          policyText: {
            ...state.policyText,
            [language]: text
          }
        }));
      },
      
      updatePolicyImage: (imageUrl) => {
        set({ policyImageUrl: imageUrl });
      },

      getPolicyText: (language) => {
        return get().policyText[language];
      }
    }),
    {
      name: 'policy-storage',
    }
  )
);
