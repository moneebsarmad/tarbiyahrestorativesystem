import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ArabicTextProps {
  arabic: string;
  transliteration?: string | null;
  translation: string;
  source: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-[1.15rem]",
  md: "text-[1.45rem]",
  lg: "text-[1.8rem]"
} as const;

export function ArabicText({
  arabic,
  transliteration,
  translation,
  source,
  size = "md"
}: ArabicTextProps) {
  return (
    <Card className="border-[#eadfca] bg-[#fbf6eb] shadow-none">
      <CardContent className="space-y-4 p-5">
        <p
          dir="rtl"
          className={cn(
            "font-arabic leading-loose text-[#3d2a18]",
            sizeClasses[size]
          )}
        >
          {arabic}
        </p>
        {transliteration ? (
          <p className="text-sm italic text-[#6d5a45]">{transliteration}</p>
        ) : null}
        <p className="text-sm leading-7 text-[#433628]">{translation}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-[#8b785e]">{source}</p>
      </CardContent>
    </Card>
  );
}

