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

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    staff: null,
    loading: true,
    error: null,
  });

  const fetchStaffProfile = useCallback(async (email: string): Promise<StaffProfile | null> => {
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
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        const staff = await fetchStaffProfile(session.user.email);
        setState({ session, staff, loading: false, error: null });
      } else {
        setState({ session: null, staff: null, loading: false, error: null });
      }
    }).catch(() => {
      setState({ session: null, staff: null, loading: false, error: null });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        const staff = await fetchStaffProfile(session.user.email);
        setState({ session, staff, loading: false, error: null });
      } else {
        setState({ session: null, staff: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchStaffProfile]);

  const signInWithPin = useCallback(async (email: string, pin: string): Promise<{ ok: boolean; error?: string }> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: "PIN incorrecto" }));
      return { ok: false, error: "PIN incorrecto" };
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signInWithPin, signOut };
}
