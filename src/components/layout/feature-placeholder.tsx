import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeaturePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  phase: string;
}

export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
  bullets,
  phase
}: FeaturePlaceholderProps) {
  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-r from-[#173326] via-accent-green to-[#245740] text-white shadow-shell">
        <CardHeader className="space-y-4">
          <Badge className="w-fit border-white/10 bg-white/10 text-white">{eyebrow}</Badge>
          <div>
            <CardTitle className="text-3xl text-white">{title}</CardTitle>
            <CardDescription className="mt-3 max-w-3xl text-base text-white/80">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Prepared in Phase {phase}</CardTitle>
          <CardDescription>
            Route protection and navigation are live. Feature implementation lands in its scheduled
            build phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {bullets.map((bullet) => (
            <div
              key={bullet}
              className="flex items-start gap-3 rounded-2xl border border-border bg-bg-secondary/70 p-4 text-sm text-text-secondary"
            >
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
              <span>{bullet}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
