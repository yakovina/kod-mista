// Іконки скіна — обвідні SVG, колір від currentColor.
const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  "aria-hidden": true,
} as const;

export const ArrowIcon = () => (
  <svg {...base}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const CheckIcon = () => (
  <svg {...base} width={30} height={30} strokeWidth={3}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const SendIcon = () => (
  <svg {...base} width={20} height={20}>
    <path d="M3 11l18-8-8 18-2-8-8-2z" />
  </svg>
);

export const RetryIcon = () => (
  <svg {...base}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5" />
  </svg>
);
