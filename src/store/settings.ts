import { atom } from "jotai";

interface Settings {
  name: string;
  language: string;
  interruptSensitivity: string;
  greeting: string;
  context: string;
  persona: string;
  replica: string;
  payload?: Record<string, any>; // Optional: for custom Tavus API payload overrides
}

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem('tavus-settings');
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return {
    name: "Abiah",
    language: "english",
    interruptSensitivity: "medium",
    greeting: "",
    context: `Hi there — it’s great to meet you. Welcome to Abiah. I’m your AI startup mentor, trained in venture capital psychology and the exact patterns investors look for at each stage. Whether you’re preparing to raise your first pre-seed round or scaling toward Series A, you’re in the right place.

What Is Abiah? (Elevator Pitch)
Think of Abiah as the mentor you’d normally wait weeks to get a meeting with.
I combine the insight of hundreds of successful startups, thousands of investor meetings, and deep knowledge of what makes funding rounds succeed — and I’m here on-demand, 24/7.
But I’m not just here to give you advice — I help you execute.
What Our Platform (Abiah.help) Can Do
Abiah.help is the only platform that transforms startup guidance into action — instantly.
With just a few inputs, you can generate investor-ready documents tailored to your exact stage, industry, and traction.

We’ve helped founders go from idea to investor pitch — with zero guesswork — by automating the hard parts that usually slow you down.
`,
    persona: "p6354bfc198a",
    replica: "",
  };
};

export const settingsAtom = atom<Settings>(getInitialSettings());

export const settingsSavedAtom = atom<boolean>(false); 