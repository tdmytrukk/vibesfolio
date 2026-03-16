import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Sparkles, Archive } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const { results, loading, totalCount } = useSearch(query);
  const navigate = useNavigate();

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = (type: string, id: string) => {
    onOpenChange(false);
    const routes: Record<string, string> = {
      idea: "/ideas",
      prompt: "/prompts",
      resource: "/vault",
    };
    navigate(`${routes[type]}?highlight=${id}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search ideas, prompts, resources…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.length >= 2 && !loading && totalCount === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {results.ideas.length > 0 && (
          <CommandGroup heading="Ideas">
            {results.ideas.map((item) => (
              <CommandItem
                key={item.id}
                value={`idea-${item.id}-${item.title}`}
                onSelect={() => handleSelect("idea", item.id)}
                className="gap-3"
              >
                <Lightbulb size={16} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.subtitle && (
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.prompts.length > 0 && (
          <CommandGroup heading="Prompts">
            {results.prompts.map((item) => (
              <CommandItem
                key={item.id}
                value={`prompt-${item.id}-${item.title}`}
                onSelect={() => handleSelect("prompt", item.id)}
                className="gap-3"
              >
                <Sparkles size={16} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.subtitle && (
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.resources.length > 0 && (
          <CommandGroup heading="Resources">
            {results.resources.map((item) => (
              <CommandItem
                key={item.id}
                value={`resource-${item.id}-${item.title}`}
                onSelect={() => handleSelect("resource", item.id)}
                className="gap-3"
              >
                <Archive size={16} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.subtitle && (
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
