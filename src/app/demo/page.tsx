"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Setting up demo session...");

  useEffect(() => {
    async function setupDemo() {
      try {
        setStatus("Creating demo session...");
        const res = await fetch("/api/demo", { method: "POST" });
        
        if (!res.ok) {
          throw new Error("Failed to create demo session");
        }
        
        setStatus("Redirecting to dashboard...");
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        console.error(error);
        setStatus("Error setting up demo. Please try again.");
      }
    }
    
    setupDemo();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-4xl mb-4 animate-pulse">💪</div>
      <h1 className="text-xl font-bold mb-2">Flex Trainer</h1>
      <p className="text-muted-foreground">{status}</p>
    </div>
  );
}
