
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PolicyState {
  policyText: string;
  policyImageUrl: string | null;
  updatePolicyText: (text: string) => void;
  updatePolicyImage: (imageUrl: string | null) => void;
}

// Default policy text
const DEFAULT_POLICY_TEXT = `
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

export const usePolicyStore = create<PolicyState>()(
  persist(
    (set) => ({
      policyText: DEFAULT_POLICY_TEXT,
      policyImageUrl: null,
      
      updatePolicyText: (text) => {
        set({ policyText: text });
      },
      
      updatePolicyImage: (imageUrl) => {
        set({ policyImageUrl: imageUrl });
      },
    }),
    {
      name: 'policy-storage',
    }
  )
);
