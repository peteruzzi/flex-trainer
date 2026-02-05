"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MuscleGroup } from "@/lib/muscle-mapping";

interface MuscleBalanceChartProps {
  balance: Record<MuscleGroup, number>;
  imbalances: {
    neglected: MuscleGroup[];
    overtrained: MuscleGroup[];
  };
}

const groupLabels: Record<MuscleGroup, { label: string; emoji: string }> = {
  push: { label: "Push", emoji: "💪" },
  pull: { label: "Pull", emoji: "🏋️" },
  upper: { label: "Upper", emoji: "🦾" },
  lower: { label: "Lower", emoji: "🦵" },
  cardio: { label: "Cardio", emoji: "❤️" },
  core: { label: "Core", emoji: "🎯" },
};

// Get intensity label from weighted value
function getIntensityLabel(value: number): string {
  if (value === 0) return "None";
  if (value < 1) return "Minimal";
  if (value < 2) return "Light";
  if (value < 3) return "Moderate";
  if (value < 4) return "Solid";
  return "Heavy";
}

export function MuscleBalanceChart({ balance, imbalances }: MuscleBalanceChartProps) {
  const maxValue = Math.max(...Object.values(balance), 1);
  const totalIntensity = Object.values(balance).reduce((sum, val) => sum + val, 0);
  
  // Calculate balance score
  const values = Object.values(balance);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const balanceScore = max === 0 ? 100 : Math.round((min / max) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Training Balance (30 days)</CardTitle>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Balance Score</div>
            <div className={`text-lg font-bold ${
              balanceScore >= 70 ? "text-green-600" : 
              balanceScore >= 40 ? "text-amber-600" : "text-red-600"
            }`}>
              {balanceScore}%
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Total intensity: {totalIntensity.toFixed(1)} · Weighted by workout type
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(Object.entries(balance) as [MuscleGroup, number][]).map(([group, intensity]) => {
            const isNeglected = imbalances.neglected.includes(group);
            const isOvertrained = imbalances.overtrained.includes(group);
            const percentage = (intensity / maxValue) * 100;

            return (
              <div key={group} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <span>{groupLabels[group].emoji}</span>
                    <span>{groupLabels[group].label}</span>
                    {isNeglected && (
                      <span className="text-xs text-amber-600 ml-1">⚠️ Low</span>
                    )}
                    {isOvertrained && (
                      <span className="text-xs text-blue-600 ml-1">📈 High</span>
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {intensity.toFixed(1)} · {getIntensityLabel(intensity)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isNeglected
                        ? "bg-amber-400"
                        : isOvertrained
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {imbalances.neglected.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4">
            💡 Consider adding more{" "}
            {imbalances.neglected.map((g) => groupLabels[g].label.toLowerCase()).join(", ")}{" "}
            intensity to your routine.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
