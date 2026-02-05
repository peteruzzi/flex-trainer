"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MTBFormProps {
  distance: number | undefined;
  elevation: number | undefined;
  calories: number | undefined;
  duration: number | undefined;
  onDistanceChange: (distance: number | undefined) => void;
  onElevationChange: (elevation: number | undefined) => void;
  onCaloriesChange: (calories: number | undefined) => void;
  onDurationChange: (duration: number | undefined) => void;
}

export function MTBForm({
  distance,
  elevation,
  calories,
  duration,
  onDistanceChange,
  onElevationChange,
  onCaloriesChange,
  onDurationChange,
}: MTBFormProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        🚵 Enter your ride details manually, or sync from Strava (coming soon!)
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Distance (miles)</Label>
          <Input
            type="number"
            step="0.1"
            min={0}
            placeholder="0.0"
            value={distance || ""}
            onChange={(e) =>
              onDistanceChange(e.target.value ? parseFloat(e.target.value) : undefined)
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Elevation (ft)</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={elevation || ""}
            onChange={(e) =>
              onElevationChange(e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Duration (min)</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={duration || ""}
            onChange={(e) =>
              onDurationChange(e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Calories</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={calories || ""}
            onChange={(e) =>
              onCaloriesChange(e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>
      </div>
    </div>
  );
}
