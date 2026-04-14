import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentProfileData } from "@/types/view-models";

export function ThreeRProfileCard({ profile }: { profile: StudentProfileData }) {
  const columns = [
    {
      label: "Righteousness",
      merits: profile.merits.righteousness,
      demerits: profile.summary.righteousness_demerits,
      color: "bg-righteousness"
    },
    {
      label: "Respect",
      merits: profile.merits.respect,
      demerits: profile.summary.respect_demerits,
      color: "bg-respect"
    },
    {
      label: "Responsibility",
      merits: profile.merits.responsibility,
      demerits: profile.summary.responsibility_demerits,
      color: "bg-responsibility"
    }
  ];

  const nets = columns.map((entry) => ({
    ...entry,
    net: entry.merits - entry.demerits
  }));
  const strongest = nets.slice().sort((a, b) => b.net - a.net)[0];
  const weakest = nets.slice().sort((a, b) => a.net - b.net)[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>3R summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {nets.map((entry) => (
          <div key={entry.label} className="rounded-3xl border border-border bg-white p-4">
            <p className="text-sm font-semibold text-text-primary">{entry.label}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>Merits</span>
              <span className="font-semibold">{entry.merits}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Demerits</span>
              <span className="font-semibold">{entry.demerits}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Net</span>
              <span className="font-semibold">{entry.net}</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-bg-secondary">
              <div
                className={`${entry.color} h-2 rounded-full`}
                style={{ width: `${Math.min(Math.max((entry.merits + 1) / (entry.merits + entry.demerits + 2), 0.1), 1) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <div className="rounded-3xl border border-border bg-bg-secondary/55 p-4 lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Strongest R</p>
              <p className="mt-2 font-semibold text-text-primary">{strongest.label}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Weakest R</p>
              <p className="mt-2 font-semibold text-text-primary">{weakest.label}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

