// Real education fact only — no fabricated jobs or internships.

export const education = {
  id: "nit-jamshedpur",
  institution: "National Institute of Technology (NIT), Jamshedpur",
  degree: "B.Tech",
  location: "Jamshedpur, Jharkhand, India",
  startYear: 2024,
  endYear: 2028,
  cgpa: "7.45 / 10",
};

export const experience = [
  {
    id: 'oa-helper',
    role: 'Growth Intern',
    company: 'OA Helper',
    location: 'Remote — Ranchi, Jharkhand',
    startDate: 'Jul 2026',
    endDate: 'Present',
    bullets: [
      'Built the campus acquisition channel nationwide — student communities, coding clubs and campus representatives — to drive platform adoption across engineering colleges.',
      'Translated campus feedback into targeting and positioning decisions, working directly with the product team on user-acquisition strategy.',
    ],
  },
];

export const leadership = [
  { role: 'Core Team Member', org: 'Phocus, NIT Jamshedpur' },
  { role: 'Volunteer', org: 'National Service Scheme (NSS)' },
];

export const competitions = [
  { name: 'XAVENIR 2026', detail: 'Hallucination detection without pretrained models' },
  { name: 'MOVES 2026', detail: '' },
];

export const heroStats = [
  { id: "projects", label: "Public Projects", value: 23, suffix: "+" },
  { id: "technologies", label: "Technologies Used", value: 25, suffix: "+" },
  {
    id: "years",
    label: "Years Building & Learning",
    value: new Date().getFullYear() - education.startYear || 1,
    suffix: "+",
  },
];
