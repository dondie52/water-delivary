import { buildPhoneLink, FWM_PHONE_DISPLAY } from "@/lib/contact";

export function OrderFlowFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center sm:px-6">
      <p className="text-sm text-slate-600">
        Have questions?{" "}
        <a href={buildPhoneLink()} className="focus-ring font-semibold text-primary underline underline-offset-2">
          Call {FWM_PHONE_DISPLAY}
        </a>
      </p>
    </footer>
  );
}
