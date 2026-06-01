"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";
import LoginScreen from "@/components/LoginScreen";

const GastroAdmin = dynamic(() => import("@/components/GastroAdmin"), { ssr: false });

export default function Page() {
  const { session, staff, loading, signInWithPin, signOut } = useAuth();

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
