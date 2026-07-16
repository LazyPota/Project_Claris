import { FinanceReport } from "@/components/finance-report";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Financial Inclusion &amp; PDF Reports
      </h1>
      <FinanceReport />
    </div>
  );
}
