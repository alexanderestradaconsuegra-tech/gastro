import Landing from "@/components/Landing";

export default function Page() {
  return <Landing n8nBase={process.env.N8N_WEBHOOK_BASE_URL ?? ""} adminUrl={process.env.ADMIN_URL ?? ""} />;
}
