import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PREDEFINED_EXERCISES, type ExerciseInfo } from "@/lib/exercises";
import { Badge } from "@/components/ui/badge";

interface ExerciseSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ExerciseSelector({ value, onChange, placeholder }: ExerciseSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null);

  const availableGroups = React.useMemo(() => {
    return Array.from(new Set(PREDEFINED_EXERCISES.map(ex => ex.group)));
  }, []);

  const filteredGroups = React.useMemo(() => {
    const grouped: Record<string, ExerciseInfo[]> = {};
    PREDEFINED_EXERCISES.forEach((ex) => {
      if (selectedGroup && ex.group !== selectedGroup) return;
      if (!grouped[ex.group]) grouped[ex.group] = [];
      grouped[ex.group].push(ex);
    });
    return grouped;
  }, [selectedGroup]);

  return (
    <div className="w-full relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-secondary border-0 text-foreground h-10 font-normal hover:bg-secondary/80 px-3"
          >
            <span className="truncate">
              {value || placeholder || "Nome do exercício"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[100]" align="start">
          <Command>
            <div className="px-3 pt-3 pb-2 border-b">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className={cn(
                    "shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors",
                    !selectedGroup 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80"
                  )}
                >
                  Todos
                </button>
                {availableGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={cn(
                      "shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors",
                      selectedGroup === group 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80"
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
            <CommandInput 
              placeholder="Procurar exercício..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                <div className="py-2 px-4">
                  <p className="text-sm text-muted-foreground mb-2">Nenhum exercício encontrado.</p>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full text-xs"
                    onClick={() => {
                      onChange(searchValue);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    Usar "{searchValue}"
                  </Button>
                </div>
              </CommandEmpty>
              {Object.entries(filteredGroups).map(([group, items]) => (
                <CommandGroup key={group} heading={group}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.name}
                      value={item.name}
                      onSelect={(currentValue) => {
                        onChange(currentValue);
                        setOpen(false);
                        setSearchValue("");
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">{item.type}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          value === item.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
