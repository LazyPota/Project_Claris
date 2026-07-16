import { EnvironmentMonitor } from "@/components/environment-monitor";
import { BiomassChart } from "@/components/biomass-chart";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      <section>
        <h2 className="mb-3 text-lg font-medium">Environment Snapshot</h2>
        <EnvironmentMonitor />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Harvest Performance</h2>
        <BiomassChart />
      </section>
    </div>
  );
}
