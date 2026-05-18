import { Suspense } from "react";
import GastroMesa from "@/components/GastroMesa";

function MesaLoader({ qr }: { qr: string }) {
  return <GastroMesa qrToken={qr} />;
}

export default async function MesaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const qr = params.qr ?? "";

  return (
    <Suspense fallback={null}>
      <MesaLoader qr={qr} />
    </Suspense>
  );
}
