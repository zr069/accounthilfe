"use client";

export interface TimelineStep {
  label: string;
  date: string;
  status: "done" | "active" | "pending";
  subtext?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} className="flex gap-4 relative" style={{ paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
          {i < steps.length - 1 && (
            <div
              className={`absolute left-[5px] top-3.5 w-0.5 ${
                s.status === "done" ? "bg-green" : "bg-border"
              }`}
              style={{ height: "calc(100% - 6px)" }}
            />
          )}
          <div
            className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
              s.status === "done"
                ? "bg-green"
                : s.status === "active"
                ? "bg-accent shadow-[0_0_8px_rgba(200,16,46,0.27)]"
                : "bg-border"
            }`}
          />
          <div>
            <div
              className={`text-sm font-medium ${
                s.status === "pending" ? "text-faint" : "text-foreground"
              }`}
            >
              {s.label}
            </div>
            <div className="text-[13px] text-faint mt-0.5">{s.date}</div>
            {s.subtext && (
              <div className="text-xs text-accent mt-1 font-medium">{s.subtext}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
