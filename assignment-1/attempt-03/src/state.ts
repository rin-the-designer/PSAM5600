export const padKeys = [
  "1",
  "2",
  "3",
  "4",
  "q",
  "w",
  "e",
  "r",
  "a",
  "s",
  "d",
  "f",
  "z",
  "x",
  "c",
  "v",
] as const;
export type PadKey = (typeof padKeys)[number];

const defaultPadSamples: Record<PadKey, string> = {
  "1": "bd",
  "2": "sd",
  "3": "hh",
  "4": "cp",
  q: "hh",
  w: "bd",
  e: "sd",
  r: "rim",
  a: "oh",
  s: "lt",
  d: "mt",
  f: "ht",
  z: "clap",
  x: "cow",
  c: "ride",
  v: "crash",
};

let padSamples: Record<PadKey, string> = { ...defaultPadSamples };

export function getPadSamples(): Record<PadKey, string> {
  return padSamples;
}

export function setPadSample(key: PadKey, sample: string): void {
  padSamples = { ...padSamples, [key]: sample };
  window.dispatchEvent(new CustomEvent("padsamples:changed"));
}

export function resetPadSamples(): void {
  padSamples = { ...defaultPadSamples };
  window.dispatchEvent(new CustomEvent("padsamples:changed"));
}

export const COMMON_SAMPLES = [
  "bd",
  "sd",
  "hh",
  "oh",
  "cp",
  "rim",
  "lt",
  "mt",
  "ht",
  "clap",
  "cow",
  "ride",
  "crash",
  "tom",
  "perc",
  "bd2",
  "sd2",
  "hc",
  "ho",
];
