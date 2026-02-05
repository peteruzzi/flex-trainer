"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Setting up demo session...");
  const [error, setError] = useState<string | null>(null);

  const setupDemo = async () => {
    setError(null);
    try {
      setStatus("Creating demo session...");
      const res = await fetch("/api/demo", { method: "POST" });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Failed to create demo session");
      }
      
      setStatus("Redirecting to dashboard...");
      // Use window.location for a full page reload to pick up the new cookie
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("Error setting up demo.");
    }
  };

  useEffect(() => {
    setupDemo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-4xl mb-4 animate-pulse">💪</div>
      <h1 className="text-xl font-bold mb-2">Flex Trainer</h1>
      <p className="text-muted-foreground">{status}</p>
      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <Button onClick={setupDemo} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
