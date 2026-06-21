import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { AssistantChatPanel } from "@/components/customer/assistant-chat-panel";

export default function AssistantPage() {
  return (
    <CustomerShell showAssistant={false} className="pb-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="focus-ring mb-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fresh Water Market
        </Link>
        <AssistantChatPanel className="min-h-[min(640px,calc(100vh-12rem))] flex-1" showClose={false} />
        <p className="mt-4 text-center text-xs text-primary/65">
          Ready to order?{" "}
          <Link href="/order" className="font-semibold text-primary hover:underline">
            Start an order
          </Link>{" "}
          or{" "}
          <Link href="/track" className="font-semibold text-primary hover:underline">
            track yours
          </Link>
          .
        </p>
      </div>
    </CustomerShell>
  );
}
