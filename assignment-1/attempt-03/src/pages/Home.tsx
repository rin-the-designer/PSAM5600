import { useEffect, useMemo, useRef, useState } from "react";
import {
  ensureStrudel,
  triggerLayered,
  getBank,
  buildAssignment,
  evalCode,
  hushAll,
  setBpm,
} from "../strudel";
import { padKeys as keys, PadKey, getPadSamples } from "../state";

type PadConfig = {
  key: PadKey;
  label: string;
  sample: string; // e.g. 'bd', 'sd', 'hh', 'cp'
};

export default function Home() {
  const [active, setActive] = useState<Set<PadKey>>(new Set());
  const [padSamples, setPadSamples] = useState<Record<PadKey, string>>(
    getPadSamples()
  );
  const [lastCode, setLastCode] = useState<string>("");
  const [bpm, setBpmLocal] = useState<number>(120);
  const downRef = useRef<Set<PadKey>>(new Set());

  useEffect(() => {
    ensureStrudel();
  }, []);

  useEffect(() => {
    const onChange = () => setPadSamples(getPadSamples());
    window.addEventListener("padsamples:changed", onChange);
    return () => window.removeEventListener("padsamples:changed", onChange);
  }, []);

  const grid = useMemo<PadConfig[]>(
    () =>
      keys.map((k) => ({
        key: k,
        label: k.toUpperCase(),
        sample: padSamples[k],
      })),
    [padSamples]
  );

  function pressPad(k: PadKey) {
    const updated = new Set(active);
    updated.add(k);
    setActive(updated);
    const samples = Array.from(updated).map((p) => padSamples[p]);
    triggerLayered(samples);
    setLastCode(`s("${samples.join(", ")}").bank("${getBank()}").play()`);
  }

  function releasePad(k: PadKey) {
    const updated = new Set(active);
    updated.delete(k);
    setActive(updated);
  }

  function playLoop() {
    evalCode(`${buildAssignment("hh*4, bd sd")}.play()`);
  }

  function stopAll() {
    hushAll();
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key as PadKey;
      if (!keys.includes(key)) return;
      if (downRef.current.has(key)) return; // prevent repeat
      downRef.current.add(key);
      pressPad(key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key as PadKey;
      if (!keys.includes(key)) return;
      downRef.current.delete(key);
      releasePad(key);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [active, padSamples]);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">Drum Pad</div>
        <div
          className="meta"
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <span>Bank: {getBank()}</span>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span>BPM</span>
            <input
              type="number"
              min={20}
              max={300}
              value={bpm}
              onChange={(e) => {
                const v = parseInt(e.target.value || "120", 10);
                setBpmLocal(v);
                setBpm(v);
              }}
              style={{
                width: 72,
                background: "#181818",
                color: "#eaeaea",
                border: "2px solid #3a3a3a",
                borderRadius: 0,
                padding: "4px 6px",
              }}
            />
          </label>
          <button onClick={playLoop}>Play</button>
          <button onClick={stopAll}>Stop</button>
        </div>
      </div>
      <div className="grid">
        {grid.map((pad) => (
          <button
            key={pad.key}
            className={"pad" + (active.has(pad.key) ? " active" : "")}
            onMouseDown={() => pressPad(pad.key)}
            onMouseUp={() => releasePad(pad.key)}
            onMouseLeave={() => releasePad(pad.key)}
          >
            <div className="pad-label">{pad.label}</div>
            <div className="pad-sample">{pad.sample}</div>
          </button>
        ))}
      </div>
      <div className="codebox">
        <div className="code-title">Last code</div>
        <pre>{lastCode || buildAssignment("hh*4, bd sd")}</pre>
      </div>
    </div>
  );
}
