"use client";
import React from "react";
import { DashboardExample } from "../components/layout/DashboardExample";
import { LoginPage } from "../components/layout/LoginPage";
import { useAuth } from "../lib/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <main className="min-h-screen">
      <DashboardExample />
    </main>
  );
}
