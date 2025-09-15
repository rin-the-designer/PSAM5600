import { useEffect, useState } from "react";
import {
  ensureStrudel,
  setBank,
  getBank,
  setBpm,
  buildAssignment,
  evalCode,
} from "../strudel";
import {
  padKeys,
  PadKey,
  getPadSamples,
  setPadSample,
  COMMON_SAMPLES,
} from "../state";

const BANKS = [
  "tr909",
  "tr808",
  "RolandTR909",
  "RolandTR808",
  "mridangam",
  "kit",
  "drum",
  "electro",
];

export default function Settings() {
  const [bank, updateBank] = useState<string>(getBank());
  const [bpm, updateBpm] = useState<number>(120);
  const [padSamples, setPadSamplesLocal] = useState(getPadSamples());

  useEffect(() => {
    ensureStrudel();
  }, []);

  function changePad(key: PadKey, sample: string) {
    setPadSample(key, sample);
    setPadSamplesLocal(getPadSamples());
  }

  function applyBank(value: string) {
    updateBank(value);
    setBank(value);
  }

  function applyBpm(value: number) {
    updateBpm(value);
    setBpm(value);
  }

  function audition() {
    evalCode(`${buildAssignment("hh*4, bd sd")}.play()`);
  }

  return (
    <div className="settings">
      <div className="row">
        <label>Bank</label>
        <select value={bank} onChange={(e) => applyBank(e.target.value)}>
          {BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div className="row">
        <label>BPM</label>
        <input
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => applyBpm(parseInt(e.target.value || "120", 10))}
        />
      </div>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <label>Pads</label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          {padKeys.map((k) => (
            <div key={k} style={{ border: "2px solid #3a3a3a", padding: 8 }}>
              <div style={{ marginBottom: 6, color: "#cfcfcf" }}>
                Key {k.toUpperCase()}
              </div>
              <select
                value={padSamples[k]}
                onChange={(e) => changePad(k, e.target.value)}
              >
                {COMMON_SAMPLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="row">
        <button onClick={audition}>Play test pattern</button>
      </div>
    </div>
  );
}
