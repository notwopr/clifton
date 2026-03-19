"use client";

import type { UserProfile } from "@/lib/types";
import { defaultProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  profiles: UserProfile[];
  activeId: string;
  onSwitch: (profile: UserProfile) => void;
  onCreate: (profile: UserProfile) => void;
  onDelete: (id: string) => void;
}

export function ProfileSelector({ profiles, activeId, onSwitch, onCreate, onDelete }: Props) {
  function handleCreate() {
    const fresh = defaultProfile();
    onCreate(fresh);
  }

  function handleDelete() {
    if (profiles.length <= 1) return;
    if (!confirm("Delete this profile? This cannot be undone.")) return;
    onDelete(activeId);
  }

  return (
    <div className="flex items-center gap-2">
      {profiles.length > 1 ? (
        <Select
          value={activeId}
          onValueChange={(id) => {
            const found = profiles.find((p) => p.id === id);
            if (found) onSwitch(found);
          }}
        >
          <SelectTrigger className="w-48 text-sm">
            <SelectValue placeholder="Select profile" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label || p.condition || "Unnamed profile"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-sm font-medium text-muted-foreground">
          {profiles[0]?.label || profiles[0]?.condition || "My Profile"}
        </span>
      )}

      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCreate}>
        <Plus className="h-3.5 w-3.5" />
        New
      </Button>

      {profiles.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
