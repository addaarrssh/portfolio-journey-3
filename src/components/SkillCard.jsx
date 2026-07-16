// Renders a single word in the CV word-cloud. Size/rotation are derived
// deterministically from the word itself so the layout is stable across
// re-renders without needing stored random seeds.
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SIZE_STEPS = ["text-sm", "text-lg", "text-2xl", "text-3xl", "text-4xl"];

export default function SkillCard({ skill, learning = false }) {
  const hash = hashString(skill);
  const size = SIZE_STEPS[hash % SIZE_STEPS.length];
  const rotate = (hash % 7) - 3; // -3deg .. 3deg

  return (
    <span className="inline-block px-2 py-1" style={{ transform: `rotate(${rotate}deg)` }}>
      <span
        data-cursor
        className={`skill-chip font-display inline-block cursor-default select-none ${size} ${
          learning
            ? "text-cream/40 border-b-2 border-dashed border-cream/30"
            : "font-semibold text-cream"
        }`}
      >
        {skill}
      </span>
    </span>
  );
}
