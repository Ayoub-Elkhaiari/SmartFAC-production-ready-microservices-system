import { useMemo } from "react";

const OtpBoxes = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const boxes = useMemo(() => Array.from({ length: 6 }, (_, i) => value[i] || ""), [value]);

  return (
    <div className="flex gap-2">
      {boxes.map((ch, i) => (
        <input
          key={i}
          value={ch}
          onChange={(e) => {
            const next = value.split("");
            next[i] = e.target.value.slice(-1);
            onChange(next.join("").slice(0, 6));
          }}
          className="h-12 w-12 rounded-xl border text-center text-lg font-semibold"
          maxLength={1}
        />
      ))}
    </div>
  );
};

export default OtpBoxes;
