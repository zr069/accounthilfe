"use client";

import type { TrackResult } from "@/lib/fristlogik";

interface TrackInfoProps {
  track: TrackResult;
}

export default function TrackInfo({ track }: TrackInfoProps) {
  const isB = track.track === "B_LAWSUIT";
  const isKnapp = track.fristTyp === "frankfurt_hamburg";

  const color = isB ? "text-amber" : "text-green";
  const bg = isB ? "bg-amber-light" : "bg-green-light";
  const borderColor = isB ? "border-amber/20" : "border-green/20";

  let title: string;
  let message: string;

  if (isB) {
    title = "Einstweilige Verfügung nicht mehr möglich";
    message = `Die Sperrung liegt ${track.tageHer} Tage zurück. Die Monatsfrist ist abgelaufen. Wir können eine Abmahnung versenden und anschließend Klage erheben.`;
  } else if (isKnapp) {
    title = "Einstweilige Verfügung möglich – aber knapp";
    message = `Die Sperrung liegt ${track.tageHer} Tage zurück. Bei Frankfurt/Hamburg gilt eine 5-Wochen-Frist – eV noch möglich, aber die Zeit ist knapp.`;
  } else {
    title = "Einstweilige Verfügung möglich";
    message = `Die Sperrung liegt ${track.tageHer} Tage zurück. Einstweilige Verfügung ist möglich. Wir versenden eine Abmahnung mit kurzer Frist.`;
  }

  return (
    <div className={`p-3.5 rounded-[10px] border ${borderColor} ${bg} mt-5`}>
      <p className={`text-sm font-semibold mb-1 ${color}`}>{title}</p>
      <p className="text-sm text-muted leading-relaxed">{message}</p>
    </div>
  );
}
