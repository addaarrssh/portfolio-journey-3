// Real education fact only — no fabricated jobs or internships.

export const education = {
  id: "nit-jamshedpur",
  institution: "National Institute of Technology (NIT), Jamshedpur",
  degree: "B.Tech in Production and Industrial Engineering",
  location: "Jamshedpur, Jharkhand, India",
  startYear: 2024,
  endYear: 2028,
  cgpa: "7.45 / 10",
};

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
