import { Clock, MapPin } from "lucide-react";
import { deliverySlots, pickupLocations } from "@/modules/catalog/pricing";
import type { OrderFormInput } from "@/modules/orders/customer-order";
import type { SlotAvailability } from "@/lib/orders/slot-availability";
import { cn } from "@/lib/utils";

const addressInputClass = "focus-ring h-12 w-full rounded-2xl border border-cyan-100 bg-white px-4 text-sm shadow-sm shadow-cyan-900/5 placeholder:text-primary/55";

export function StepFulfillment({
  form,
  availability,
  slotLabel,
  onFulfillmentType,
  onPickupLocation,
  onDeliverySlot,
  onDeliveryAddress
}: {
  form: OrderFormInput;
  availability: SlotAvailability[];
  slotLabel: string;
  onFulfillmentType: (type: "pickup" | "delivery") => void;
  onPickupLocation: (location: string) => void;
  onDeliverySlot: (slot: string) => void;
  onDeliveryAddress: (address: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {(["pickup", "delivery"] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={cn(
              "focus-ring h-14 rounded-2xl border text-base font-bold capitalize transition-colors",
              form.fulfillmentType === type
                ? "border-primary bg-primary text-white shadow-sm shadow-cyan-900/10"
                : "border-cyan-100 bg-white text-primary hover:border-primary/35 hover:bg-aqua/35"
            )}
            onClick={() => onFulfillmentType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {form.fulfillmentType === "pickup" ? (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <MapPin className="h-4 w-4" />
            Pickup point
          </div>
          <div className="flex flex-wrap gap-2">
            {pickupLocations.map((location) => (
              <button
                key={location}
                type="button"
                className={cn(
                  "focus-ring rounded-full border px-4 py-2.5 text-left text-sm font-semibold transition",
                  form.pickupLocation === location
                    ? "border-primary bg-primary text-white"
                    : "border-cyan-100 bg-aqua/45 text-primary hover:border-primary/40 hover:bg-white"
                )}
                onClick={() => onPickupLocation(location)}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Clock className="h-4 w-4" />
                Delivery slot
              </div>
              <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-black text-[#061a4f]">
                Student delivery from P30
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {deliverySlots.map((slot) => {
                const slotAvailability = availability.find((availableSlot) => availableSlot.label === slot.label);
                const disabled = Boolean(slotAvailability?.isFull || slotAvailability?.isPast);
                const selected = form.deliverySlot === slot.label;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={disabled}
                    className={cn(
                      "focus-ring rounded-full border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                      selected
                        ? "border-primary bg-primary text-white"
                        : "border-cyan-100 bg-aqua/45 text-primary hover:border-primary/40 hover:bg-white"
                    )}
                    onClick={() => onDeliverySlot(slot.label)}
                  >
                    {slot.label}
                    {slotAvailability?.isFull ? " · full" : ""}
                  </button>
                );
              })}
            </div>
            {!form.deliverySlot ? (
              <p className="mt-3 text-sm font-semibold text-primary/75">Next available: {slotLabel}</p>
            ) : null}
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#061a4f]">Where should we deliver?</span>
            <input
              className={addressInputClass}
              value={form.deliveryAddress ?? ""}
              onChange={(event) => onDeliveryAddress(event.target.value)}
              placeholder="Example: Block 470, Room 12, near UB Clinic"
              autoComplete="street-address"
            />
          </label>
        </div>
      )}
    </div>
  );
}
