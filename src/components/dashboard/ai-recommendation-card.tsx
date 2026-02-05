"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { AIRecommendation } from "@/lib/ai-mock";

interface AIRecommendationCardProps {
  recommendation: AIRecommendation | null;
  isLoading?: boolean;
}

const typeIcons: Record<string, string> = {
  workout: "🎯",
  rest: "😴",
  insight: "💡",
};

export function AIRecommendationCard({ recommendation, isLoading }: AIRecommendationCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🤖</span>
            <span>AI Coach</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-indigo-100 rounded w-3/4" />
            <div className="h-4 bg-indigo-100 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🤖</span>
            <span>AI Coach</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log some workouts to get personalized recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>🤖</span>
          <span>AI Coach</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {typeIcons[recommendation.type]} {recommendation.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold">{recommendation.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {recommendation.description}
          </p>
        </div>

        {/* Injury warnings */}
        {recommendation.injuryWarnings && recommendation.injuryWarnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium text-amber-800">⚠️ Injury Considerations:</p>
            {recommendation.injuryWarnings.slice(0, 2).map((warning, i) => (
              <p key={i} className="text-xs text-amber-700">{warning}</p>
            ))}
            {recommendation.injuryAlternatives && recommendation.injuryAlternatives.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Alternatives: {recommendation.injuryAlternatives.slice(0, 3).join(", ")}
              </p>
            )}
          </div>
        )}
        
        {/* Weight percentage recommendation */}
        {recommendation.weightRecommendation && recommendation.weightRecommendation.percentage < 100 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-800 flex items-center gap-1">
              🏋️ Weight Recommendation
            </p>
            <p className="text-lg font-bold text-blue-700 mt-1">
              {recommendation.weightRecommendation.percentage}% of max
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {recommendation.weightRecommendation.reason}
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Use the percentage calculator when logging exercises to stay on track.
            </p>
          </div>
        )}

        {recommendation.suggestedWorkout && (
          <div className="bg-white/50 rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {recommendation.suggestedWorkout.type && (
                <Badge variant="secondary">
                  {recommendation.suggestedWorkout.type}
                </Badge>
              )}
              {recommendation.suggestedWorkout.location && (
                <Badge variant="outline">
                  📍 {recommendation.suggestedWorkout.location}
                </Badge>
              )}
            </div>
            {recommendation.suggestedWorkout.focus && (
              <p className="text-xs text-muted-foreground">
                Focus: {recommendation.suggestedWorkout.focus.join(", ")}
              </p>
            )}
            {recommendation.suggestedWorkout.exercises && (
              <p className="text-xs text-muted-foreground">
                Try: {recommendation.suggestedWorkout.exercises.join(", ")}
              </p>
            )}
          </div>
        )}

        {recommendation.type === "workout" && (
          <Link href="/log">
            <Button size="sm" className="w-full mt-2">
              Log This Workout
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
