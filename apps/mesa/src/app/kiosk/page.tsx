import { Suspense } from "react";
import GastroKiosk from "@/components/GastroKiosk";

export default async function KioskPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const qr = params.qr ?? "";
  return (
    <Suspense fallback={null}>
      <GastroKiosk qrToken={qr} />
    </Suspense>
  );
}
