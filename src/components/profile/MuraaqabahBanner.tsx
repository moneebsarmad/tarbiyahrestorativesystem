import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function MuraaqabahBanner({
  reason
}: {
  reason: string;
}) {
  return (
    <Card className="border-flag-muraaqabah/20 bg-flag-muraaqabah/8">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="rounded-full bg-flag-muraaqabah/12 p-2 text-flag-muraaqabah">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-flag-muraaqabah">Murāqabah active</p>
          <p className="mt-2 text-sm text-text-primary">
            This student has an active Murāqabah flag due to <span className="font-semibold">{reason.replaceAll("_", " ")}</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

