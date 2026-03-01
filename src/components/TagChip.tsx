import { cn } from "@/lib/utils";

const chipColors = [
  "bg-chip-lavender",
  "bg-chip-peach",
  "bg-chip-mint",
  "bg-chip-sky",
  "bg-chip-rose",
] as const;

interface TagChipProps {
  label: string;
  colorIndex?: number;
  className?: string;
}

const TagChip = ({ label, colorIndex = 0, className }: TagChipProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium text-foreground/75 tracking-wide transition-colors duration-150",
      chipColors[colorIndex % chipColors.length],
      className
    )}
  >
    {label}
  </span>
);

export default TagChip;
