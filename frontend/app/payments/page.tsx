import { PageHeader } from "../components/PageHeader";
import { PaymentPanel } from "../components/PaymentPanel";

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Per-job earnings for reporters and editors, plus totals."
      />
      <div className="p-6">
        <PaymentPanel />
      </div>
    </>
  );
}
