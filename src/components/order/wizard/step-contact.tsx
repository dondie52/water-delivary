import type { CustomerLookupResult } from "@/app/api/v1/customers/lookup/route";
import type { OrderFormInput } from "@/modules/orders/customer-order";
import { QuickReorderCard } from "@/components/order/quick-reorder-card";

const inputClass = "focus-ring h-12 w-full rounded-2xl border border-cyan-100 bg-white px-4 text-sm placeholder:text-primary/55";

export function StepContact({
  form,
  needsName,
  isLookingUp,
  customerLookup,
  onPhoneChange,
  onNameChange,
  onOrderAgain
}: {
  form: OrderFormInput;
  needsName: boolean;
  isLookingUp: boolean;
  customerLookup: CustomerLookupResult | null;
  onPhoneChange: (phone: string) => void;
  onNameChange: (name: string) => void;
  onOrderAgain: () => void;
}) {
  return (
    <div className="space-y-5">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[#061a4f]">Phone number</span>
        <input
          className={inputClass}
          value={form.phoneNumber}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="7XXXXXXX"
          inputMode="tel"
          autoComplete="tel"
        />
        {isLookingUp ? <span className="text-xs text-primary/65">Looking up your account...</span> : null}
      </label>

      {customerLookup?.lastOrder ? (
        <QuickReorderCard
          customerName={customerLookup.customerName}
          lastOrder={customerLookup.lastOrder}
          onOrderAgain={onOrderAgain}
        />
      ) : null}

      {needsName ? (
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[#061a4f]">Your name</span>
          <input
            className={inputClass}
            value={form.customerName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
      ) : null}
    </div>
  );
}
