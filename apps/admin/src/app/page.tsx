"use client";

import dynamic from "next/dynamic";

const GastroAdmin = dynamic(() => import("@/components/GastroAdmin"), { ssr: false });

export default function Page() {
  return <GastroAdmin />;
}
