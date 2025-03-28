
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
const DEFAULT_POLICY_TEXT_DE = 
`Besucherrichtlinie der Firma Leuka

Willkommen bei der Firma Leuka. Um die Sicherheit und den Datenschutz aller Mitarbeiter und Besucher zu gewährleisten, bitten wir Sie, die folgenden Richtlinien zu beachten:

1. Besucher müssen sich bei Ankunft und Abreise am Empfang oder über dieses Self-Check-In-System anmelden und abmelden.
2. Besucher erhalten eine Besuchernummer, die während des gesamten Aufenthalts mitzuführen ist.
3. Besucher dürfen sich nur in Begleitung ihres Ansprechpartners oder einer autorisierten Person in den Räumlichkeiten aufhalten.
4. Die Verwendung von Fotografie- oder Aufnahmegeräten ist ohne ausdrückliche Genehmigung untersagt.
5. Vertrauliche Informationen, die während des Besuchs erlangt werden, sind streng vertraulich zu behandeln.
6. Im Falle eines Notfalls oder einer Evakuierung folgen Sie bitte den Anweisungen des Personals.
7. Bitte respektieren Sie die Arbeitsumgebung und vermeiden Sie übermäßigen Lärm oder Störungen.
8. Rauchen ist nur in den ausgewiesenen Bereichen gestattet.
9. Die Firma Leuka übernimmt keine Haftung für persönliche Gegenstände von Besuchern.
10. Bei Verstößen gegen diese Richtlinien behält sich die Firma Leuka das Recht vor, den Besuch zu beenden.

Durch die Bestätigung dieser Richtlinien erklären Sie, dass Sie diese gelesen und verstanden haben und sich während Ihres Besuchs daran halten werden.`;

// Default policy text - English
const DEFAULT_POLICY_TEXT_EN = 
`Visitor Policy of Leuka Company

Welcome to Leuka Company. To ensure the safety and data privacy of all employees and visitors, we kindly ask you to observe the following guidelines:

1. Visitors must check in and check out at reception or through this self-check-in system upon arrival and departure.
2. Visitors will receive a visitor number which must be carried throughout their stay.
3. Visitors may only be in the premises when accompanied by their contact person or an authorized person.
4. The use of photography or recording equipment is prohibited without express permission.
5. Confidential information obtained during the visit must be treated as strictly confidential.
6. In the event of an emergency or evacuation, please follow staff instructions.
7. Please respect the work environment and avoid excessive noise or disruptions.
8. Smoking is only permitted in designated areas.
9. Leuka Company assumes no liability for visitors' personal belongings.
10. In case of violations of these guidelines, Leuka Company reserves the right to terminate the visit.

By confirming these guidelines, you declare that you have read and understood them and will adhere to them during your visit.`;

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
