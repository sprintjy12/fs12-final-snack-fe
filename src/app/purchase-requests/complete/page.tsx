import { redirect } from "next/navigation";

/** Legacy path. Canonical route: `/purchase/requests/complete` */
export default function PurchaseRequestsCompleteRedirectPage() {
  redirect("/purchase/requests/complete");
}
