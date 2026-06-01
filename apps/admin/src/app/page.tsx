"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRestaurantId } from "@/lib/supabase";
import LoginScreen from "@/components/LoginScreen";

const GastroAdmin = dynamic(() => import("@/components/GastroAdmin"), { ssr: false });

export default function Page() {
  const router = useRouter();
  const { session, staff, loading, signInWithPin, signOut } = useAuth();

  // If logged in but no restaurant_id in JWT, send to register
  useEffect(() => {
    if (!loading && session) {
      const rid = getRestaurantId();
      if (!rid || rid === "nido") return; // nido = demo, allow
      // rid is valid, nothing to do
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "#666",
          fontSize: 14,
          letterSpacing: 2,
        }}
      >
        HOLU
      </div>
    );
  }

  if (!session || !staff) {
    return <LoginScreen onLogin={signInWithPin} loading={loading} />;
  }

  return <GastroAdmin authStaff={staff} onSignOut={signOut} />;
}
