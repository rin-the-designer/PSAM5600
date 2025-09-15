import { initStrudel } from "@strudel/web";

let initialized = false;
let currentBank = "tr909";

export function ensureStrudel(): void {
  if (!initialized) {
    initStrudel();
    initialized = true;
  }
}

export function setBank(bank: string): void {
  currentBank = bank;
}

export function getBank(): string {
  return currentBank;
}

// Evaluate a Strudel code string
export function evalCode(code: string): void {
  ensureStrudel();
  // evaluate is provided globally by @strudel/web after initStrudel
  // @ts-expect-error evaluate is injected into global scope by Strudel
  if (typeof evaluate === "function") {
    // @ts-expect-error global
    evaluate(code);
  }
}

export function hushAll(): void {
  ensureStrudel();
  // @ts-expect-error hush is injected by Strudel
  if (typeof hush === "function") {
    // @ts-expect-error global
    hush();
  }
}

export function setBpm(bpm: number): void {
  ensureStrudel();
  const clamped = Number.isFinite(bpm) ? Math.max(20, Math.min(300, bpm)) : 120;
  // Prefer using the mini command setbpm which @strudel/web parses
  evalCode(`setbpm ${clamped}`);
}

// Trigger one-shot for multiple sounds at once (layered)
export function triggerLayered(samples: string[]): void {
  if (samples.length === 0) return;
  const unique = Array.from(new Set(samples));
  const pattern = unique.join(", ");
  evalCode(`s("${pattern}").bank("${currentBank}").play()`);
}

// Build "$:" assignment line for a persistent loop from provided mini pattern
export function buildAssignment(patternMini: string): string {
  return `$: s("${patternMini}").bank("${currentBank}")`;
}
