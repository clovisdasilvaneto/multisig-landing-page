/** Single source of truth for brand + scroll choreography. */
export const BRAND = "LOCKSTEP";
export const TAGLINE = "Self-custody for the paranoid";

export const FRAME_COUNT = 145;

/** Frame ranges for the three scrubbed chapters (inclusive). */
export const CHAPTERS = {
  hero: [0, 35],
  attack: [36, 95],
  multisig: [96, FRAME_COUNT - 1],
} as const;

/** Fire beat (frames) used for the accent tween + threat meter. */
export const FIRE = { in: [36, 52], peak: [52, 84], out: [84, 102] } as const;

/** Frames at which each signer lights up as the network forms. */
export const SIGNER_FRAMES = [106, 118, 130] as const;

/**
 * Approximate horizontal position of the mascot in the source video (0..1),
 * keyed by frame. Used to keep him in shot on narrow (4:5) crops.
 */
export const MASCOT_TRACK: [frame: number, x: number][] = [
  [0, 0.43], [40, 0.45], [60, 0.56], [72, 0.6], [96, 0.63],
  [108, 0.59], [120, 0.58], [144, 0.57],
];

export const COLORS = {
  green: "#12FF80",
  fire: "#FF5A1F",
};

/** Pin length of the scrubbed stage, in viewport heights. */
export const STAGE_VH = { desktop: 300, mobile: 220 };

export const NAV = [
  { n: "01", label: "Manifesto", href: "#manifesto" },
  { n: "02", label: "Arsenal", href: "#arsenal" },
  { n: "03", label: "Protocol", href: "#protocol" },
  { n: "04", label: "Contact", href: "#contact" },
];
