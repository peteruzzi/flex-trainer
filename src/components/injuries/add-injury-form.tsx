"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BODY_AREAS, COMMON_INJURIES, type BodyArea, type InjurySeverity } from "@/lib/injury-mapping";

interface AddInjuryFormProps {
  onAdd: (injury: {
    bodyArea: string;
    name: string;
    severity: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function AddInjuryForm({ onAdd, onCancel }: AddInjuryFormProps) {
  const [bodyArea, setBodyArea] = useState<BodyArea | "">("");
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [severity, setSeverity] = useState<InjurySeverity>("moderate");
  const [notes, setNotes] = useState("");

  const filteredCommonInjuries = bodyArea
    ? COMMON_INJURIES.filter(i => i.bodyArea === bodyArea)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyArea) return;
    
    const injuryName = name === "custom" ? customName : name;
    if (!injuryName) return;

    onAdd({
      bodyArea,
      name: injuryName,
      severity,
      notes: notes || undefined,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Log Injury</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Body Area */}
          <div className="space-y-2">
            <Label>Body Area</Label>
            <div className="grid grid-cols-4 gap-2">
              {BODY_AREAS.map((area) => (
                <button
                  key={area.value}
                  type="button"
                  onClick={() => {
                    setBodyArea(area.value);
                    setName("");
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    bodyArea === area.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-lg">{area.emoji}</div>
                  <div className="text-xs">{area.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Injury Name */}
          {bodyArea && (
            <div className="space-y-2">
              <Label>Injury</Label>
              {filteredCommonInjuries.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {filteredCommonInjuries.map((injury) => (
                    <button
                      key={injury.name}
                      type="button"
                      onClick={() => setName(injury.name)}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        name === injury.name
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {injury.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setName("custom")}
                    className={`px-2 py-1 text-xs rounded border transition-all ${
                      name === "custom"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    + Custom
                  </button>
                </div>
              )}
              {(name === "custom" || bodyArea === "custom") && (
                <Input
                  placeholder="Describe the injury"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              )}
            </div>
          )}

          {/* Severity */}
          {(name || customName) && (
            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["mild", "moderate", "severe"] as InjurySeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`p-2 rounded-lg border text-center text-sm capitalize transition-all ${
                      severity === sev
                        ? sev === "mild"
                          ? "border-yellow-500 bg-yellow-50"
                          : sev === "moderate"
                          ? "border-orange-500 bg-orange-50"
                          : "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(name || customName) && (
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!bodyArea || (!name && !customName)}
              className="flex-1"
            >
              Log Injury
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
