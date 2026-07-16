// Copy for the narrative sections (hero tagline, origin story, purpose
// statement). Centralized here, same pattern as data/projects.js and
// data/skills.js, so wording can be edited without touching components.
//
// NOTE: a few lines below are placeholders drafted from the Canva mockup —
// marked with a "// REVIEW:" comment. Replace with your own exact wording.

export const heroCopy = {
  eyebrow: "ML/AI Portfolio",
  // REVIEW: original line, written to avoid echoing the reference site's
  // "creative by night, more creative by midnight" tagline structure.
  tagline: "Still debugging at 2 AM — some habits die hard.",
  quote: "Stay curious. Keep building.\nThe world needs more problem solvers.",
};

export const navNote = {
  title: "ML Note",
  lines: [
    "Algorithms learn from data.",
    "But you grow from consistency.",
    "Train daily. Evaluate honestly. Deploy impact.",
  ],
};

export const originStory = {
  kicker: "01 — THE START",
  // REVIEW: fill in the actual blanked phrase from your notebook page —
  // this is a placeholder guess ("solve real-world problems").
  headline: "I started with Python projects and curiosity about how data can solve real-world problems.",
  sideNoteTop: "I'm an open book.\nHere is the learning journey behind my work.",
  sideNoteMid: "It started with code.\nThen came data, models,\nand a love for building.",
  // REVIEW: the mockup's body text mentioned "marketing strategy," which
  // reads like a leftover from a different template — replaced with an
  // ML-appropriate equivalent below. Confirm this matches your real story.
  body: "I had no idea what a loss function was in first year. I started by learning Python and building small projects. Over time, I focused on ML, RAG, and systems that make reliable, honest predictions.",
};

export const purposeStory = {
  kicker: "02 — BUILDING WITH PURPOSE",
  noteTitle: "ART WITH A PURPOSE",
  noteBody: "I build ML systems that are useful, measurable, and honest about what they can predict.",
  noteFooter: "systems that actually work in production.",
  statHighlight: { value: "0.84", label: "ROC-AUC · Churn Model" },
  sideAnnotation: "crazy what happens when you just make weirdly useful stuff.",
  closing: "The goal is simple: build AI that helps people decide, learn, and act with more confidence.",
};
