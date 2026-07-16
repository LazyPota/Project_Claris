import { EnvironmentMonitor } from "@/components/environment-monitor";

export default function EnvironmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Water Quality Monitoring</h1>
      <EnvironmentMonitor />
    </div>
  );
}
