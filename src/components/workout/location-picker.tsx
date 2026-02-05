"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Location } from "@/types";

interface LocationPickerProps {
  locations: Location[];
  value: string | undefined;
  onChange: (locationId: string) => void;
  workoutType?: string;
}

export function LocationPicker({ locations, value, onChange, workoutType }: LocationPickerProps) {
  // Filter locations based on workout type
  const filteredLocations = locations.filter((loc) => {
    if (workoutType === "pilates") return loc.type === "studio";
    if (workoutType === "crossfit") return loc.type === "box";
    if (workoutType === "mtb") return loc.type === "trail";
    return true;
  });

  // If no matching locations, show all
  const displayLocations = filteredLocations.length > 0 ? filteredLocations : locations;

  return (
    <div className="space-y-2">
      <Label>Location</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {displayLocations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
