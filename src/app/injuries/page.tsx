"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InjuryCard } from "@/components/injuries/injury-card";
import { AddInjuryForm } from "@/components/injuries/add-injury-form";
import { getInjuryModifications, type Injury } from "@/lib/injury-mapping";
import { toast } from "sonner";

export default function InjuriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: injuries = [], isLoading } = useQuery<Injury[]>({
    queryKey: ["injuries"],
    queryFn: async () => {
      const res = await fetch("/api/injuries");
      if (!res.ok) throw new Error("Failed to fetch injuries");
      return res.json();
    },
    enabled: !!session,
  });

  const addMutation = useMutation({
    mutationFn: async (data: { bodyArea: string; name: string; severity: string; notes?: string }) => {
      const res = await fetch("/api/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add injury");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries"] });
      queryClient.invalidateQueries({ queryKey: ["recommendation"] });
      toast.success("Injury logged");
      setShowAddForm(false);
    },
    onError: () => {
      toast.error("Failed to log injury");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/injuries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, endDate: status === "resolved" ? new Date().toISOString() : null }),
      });
      if (!res.ok) throw new Error("Failed to update injury");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries"] });
      queryClient.invalidateQueries({ queryKey: ["recommendation"] });
      toast.success("Injury updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/injuries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete injury");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries"] });
      queryClient.invalidateQueries({ queryKey: ["recommendation"] });
      toast.success("Injury deleted");
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-2xl">💪</div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const activeInjuries = injuries.filter(i => i.status === "active" || i.status === "recovering");
  const resolvedInjuries = injuries.filter(i => i.status === "resolved");
  const modifications = getInjuryModifications(injuries);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className="text-sm">
            ← Back
          </button>
          <h1 className="font-bold">Injuries</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Summary Card */}
        {activeInjuries.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>Active Considerations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {modifications.warnings.map((warning, i) => (
                <p key={i} className="text-sm">{warning}</p>
              ))}
              {modifications.alternatives.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Recommended alternatives:</span>{" "}
                  {modifications.alternatives.slice(0, 4).join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Form or Button */}
        {showAddForm ? (
          <AddInjuryForm
            onAdd={(data) => addMutation.mutate(data)}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            + Log Injury
          </Button>
        )}

        {/* Active Injuries */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse h-32 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : activeInjuries.length > 0 ? (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">
              Active & Recovering ({activeInjuries.length})
            </h2>
            {activeInjuries.map((injury) => (
              <InjuryCard
                key={injury.id}
                injury={injury}
                onUpdateStatus={(id, status) => updateMutation.mutate({ id, status })}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-2">💪</div>
              <p className="text-muted-foreground">No active injuries - keep it up!</p>
            </CardContent>
          </Card>
        )}

        {/* Resolved Injuries */}
        {resolvedInjuries.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground">
              Resolved ({resolvedInjuries.length})
            </h2>
            {resolvedInjuries.map((injury) => (
              <InjuryCard
                key={injury.id}
                injury={injury}
                onUpdateStatus={(id, status) => updateMutation.mutate({ id, status })}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
