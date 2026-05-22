"use client";

import { useEffect, useState, useCallback } from "react";
import { sbSelect, sbSignIn, sbSignOut } from "@/lib/supabase";
import type { StaffRole } from "@/lib/constants";

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  shift: string;
  phone: string;
}

export interface AuthState {
  session: { email: string } | null;
  staff: StaffProfile | null;
  loading: boolean;
  error: string | null;
}

const LS_KEY = "sb-nlwrkumlrudfgsdnhfhw-auth-token";

function readStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // JWT payload has user email — decode without verify (client-side only)
    const token =
      (parsed.access_token as string | undefined) ??
      ((parsed as Record<string, Record<string, string>>).session?.access_token);
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1])) as Record<string, unknown>;
    return (payload.email as string) ?? null;
  } catch {
    return null;
  }
}

async function fetchStaffProfile(email: string): Promise<StaffProfile | null> {
  try {
    const rows = await sbSelect<Record<string, unknown>>(
      "staff",
      `select=id,name,email,role,shift,phone&email=eq.${encodeURIComponent(email)}&limit=1`
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      role: row.role as StaffRole,
      shift: (row.shift as string) ?? "",
      phone: (row.phone as string) ?? "",
    };
  } catch {
    return null;
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    staff: null,
    loading: true,
    error: null,
  });

  // On mount: check localStorage for an existing session
  useEffect(() => {
    const email = readStoredEmail();
    if (!email) {
      setState({ session: null, staff: null, loading: false, error: null });
      return;
    }
    // Show app immediately with email; load full staff profile in background
    const fallback: StaffProfile = { id: "", name: email.split("@")[0], email, role: "admin", shift: "", phone: "" };
    setState({ session: { email }, staff: fallback, loading: false, error: null });
    fetchStaffProfile(email).then((profile) => {
      if (profile) setState((prev) => ({ ...prev, staff: profile }));
    });
  }, []);

  const signInWithPin = useCallback(async (email: string, pin: string): Promise<{ ok: boolean; error?: string }> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await sbSignIn(email, pin);
    if ("error" in result) {
      setState((prev) => ({ ...prev, loading: false, error: result.error }));
      return { ok: false, error: result.error };
    }
    // Load staff profile
    const fallback: StaffProfile = { id: "", name: email.split("@")[0], email, role: "admin", shift: "", phone: "" };
    setState({ session: { email }, staff: fallback, loading: false, error: null });
    fetchStaffProfile(email).then((profile) => {
      if (profile) setState((prev) => ({ ...prev, staff: profile }));
    });
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await sbSignOut();
    setState({ session: null, staff: null, loading: false, error: null });
  }, []);

  return { ...state, signInWithPin, signOut };
}
