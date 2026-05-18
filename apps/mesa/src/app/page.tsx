import { redirect } from "next/navigation";

// The root route only exists to handle bare visits (e.g. during dev).
// Real entry points are QR codes that encode /mesa?qr=TOKEN.
export default function RootPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Can't await searchParams inside a sync component in Next 15 —
  // redirect immediately; the /mesa page handles missing qr gracefully.
  void searchParams;
  redirect("/mesa?qr=A7K92");
}
