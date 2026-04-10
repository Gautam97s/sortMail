import { redirect } from "next/navigation";

export default function BillingHistoryRedirectPage() {
    redirect("/settings/billing");
}
