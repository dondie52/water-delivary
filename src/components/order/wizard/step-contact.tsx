import type { CustomerLookupResult } from "@/app/api/v1/customers/lookup/route";
import type { OrderFormInput } from "@/modules/orders/customer-order";
import { QuickReorderCard } from "@/components/order/quick-reorder-card";

const inputClass =
  "focus-ring h-12 w-full rounded-xl border border-input bg-white px-4 text-sm placeholder:text-muted-foreground";

export function StepContact({
  form,
  needsName,
  isLookingUp,
  customerLookup,
  phoneError,
  nameError,
  onPhoneChange,
  onNameChange,
  onOrderAgain
}: {
  form: OrderFormInput;
  needsName: boolean;
  isLookingUp: boolean;
  customerLookup: CustomerLookupResult | null;
  phoneError?: string | null;
  nameError?: string | null;
  onPhoneChange: (phone: string) => void;
  onNameChange: (name: string) => void;
  onOrderAgain: () => void;
}) {
  return (
    <div className="space-y-5">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-foreground">Phone number</span>
        <input
          className={inputClass}
          value={form.phoneNumber}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="7XXXXXXX"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={Boolean(phoneError)}
          aria-describedby={phoneError ? "phone-error" : undefined}
        />
        {phoneError ? (
          <span id="phone-error" className="text-sm font-semibold text-destructive">
            {phoneError}
          </span>
        ) : null}
        {isLookingUp ? <span className="text-xs text-muted-foreground">Looking up your account...</span> : null}
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
          <span className="text-sm font-semibold text-foreground">Your name</span>
          <input
            className={inputClass}
            value={form.customerName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "name-error" : undefined}
          />
          {nameError ? (
            <span id="name-error" className="text-sm font-semibold text-destructive">
              {nameError}
            </span>
          ) : null}
        </label>
      ) : null}
    </div>
  );
}
