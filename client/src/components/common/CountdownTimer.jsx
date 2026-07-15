import { useEffect, useState } from "react";

const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

const CountdownTimer = ({ endsAt }) => {
  const calc = () => {
    const diff = Math.max(0, new Date(endsAt) - Date.now());
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
      done: diff === 0,
    };
  };

  const [t, setT] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]); // eslint-disable-line

  if (t.done) return null;

  return (
    <span className="font-display text-xs font-bold tabular-nums text-[#EF4444]">
      {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
    </span>
  );
};

export default CountdownTimer;
