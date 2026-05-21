"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
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
  session: Session | null;
  staff: StaffProfile | null;
  loading: boolean;
  error: string | null;
}

function fallbackProfile(email: string): StaffProfile {
  return { id: "", name: email.split("@")[0], email, role: "admin", shift: "", phone: "" };
}

async function fetchStaffProfile(email: string): Promise<StaffProfile | null> {
  try {
    const { data, error } = await supabase
      .from("staff")
      .select("id, name, email, role, shift, phone")
      .eq("email", email)
      .single();

    if (error || !data) return null;

    const row = data as Record<string, unknown>;
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

  useEffect(() => {
    // Resolve initial session — show login if nothing after 4s
    const timeout = setTimeout(() => {
      setState({ session: null, staff: null, loading: false, error: null });
    }, 4_000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user?.email) {
        // Enter with session immediately; load staff in background
        setState({ session, staff: fallbackProfile(session.user.email), loading: false, error: null });
        const staff = await fetchStaffProfile(session.user.email);
        if (staff) setState((prev) => ({ ...prev, staff }));
      } else {
        setState({ session: null, staff: null, loading: false, error: null });
      }
    }).catch(() => {
      clearTimeout(timeout);
      setState({ session: null, staff: null, loading: false, error: null });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        setState((prev) => ({
          ...prev,
          session,
          staff: prev.staff ?? fallbackProfile(session.user.email ?? ""),
          loading: false,
          error: null,
        }));
        const staff = await fetchStaffProfile(session.user.email);
        if (staff) setState((prev) => ({ ...prev, staff }));
      } else {
        setState({ session: null, staff: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPin = useCallback(async (email: string, pin: string): Promise<{ ok: boolean; error?: string }> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: "PIN incorrecto" }));
        return { ok: false, error: "PIN incorrecto" };
      }
      // onAuthStateChange will handle setting session + staff
      return { ok: true };
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Error de conexión" }));
      return { ok: false, error: "Error de conexión" };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signInWithPin, signOut };
}
