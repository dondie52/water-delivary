"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton } from "@/components/customer/customer-button";
import { OrderConfirmScreen } from "@/components/order/order-confirm-screen";
import { OrderSuccessScreen } from "@/components/order/order-success-screen";
import { AdvancedOptionsPanel } from "@/components/order/wizard/advanced-options";
import { StickyTotalBar } from "@/components/order/wizard/sticky-total-bar";
import { StepContact } from "@/components/order/wizard/step-contact";
import { StepFulfillment } from "@/components/order/wizard/step-fulfillment";
import { StepProduct, buildIceInquiryNotes } from "@/components/order/wizard/step-product";
import { StepService } from "@/components/order/wizard/step-service";
import { WizardProgressBar } from "@/components/order/wizard/wizard-progress-bar";
import type { CustomerLookupResult } from "@/app/api/v1/customers/lookup/route";
import {
  buildReorderInput,
  getDefaultFulfillmentDate,
  getNextAvailableSlot
} from "@/lib/orders/slot-availability";
import {
  applyServiceDefaults,
  hasIceCatalogProduct,
  inferServiceFromOrder,
  validateWizardStep,
  WIZARD_STEPS,
  type ServiceType,
  type WizardStep
} from "@/lib/orders/order-wizard";
import {
  calculateOrderTotal,
  CustomerOrder,
  deliverySlots,
  OrderFormInput,
  pickupLocations,
  PromoCode
} from "@/modules/orders/customer-order";
import type { PriceItem } from "@/modules/catalog/pricing";
import { defaultPilotSettings, type PilotSettings } from "@/modules/settings/pilot-settings";

const LAST_PHONE_KEY = "fwm_last_phone";

function buildInitialForm(): OrderFormInput {
  return {
    productSku: "FWM-REFILL-L",
    quantity: 0,
    refillLitres: 20,
    fulfillmentType: "pickup",
    pickupLocation: pickupLocations[0],
    deliverySlot: deliverySlots[0].label,
    requestedFulfillmentDate: new Date().toISOString().slice(0, 10),
    deliveryAddress: "",
    customerNotes: "",
    containerCount: 1,
    largeContainerCount: 0,
    orderType: "standard",
    stickerDesignRequired: false,
    brandingText: "",
    eventName: "",
    designNotes: "",
    artworkUrl: "",
    customerName: "",
    phoneNumber: "",
    promoCode: "",
    referredByPhone: "",
    paymentMethod: "cash"
  };
}

const stepTitles: Record<WizardStep, { title: string; subtitle: string }> = {
  service: { title: "What do you need?", subtitle: "Choose your water service." },
  product: { title: "Choose product & quantity", subtitle: "Pick your size and how much you need." },
  fulfillment: { title: "Pickup or delivery?", subtitle: "We default to the fastest option for you." },
  contact: { title: "Your phone number", subtitle: "We use this to confirm and track your order." },
  confirm: { title: "Confirm your order", subtitle: "Review and place your order." }
};

function parseService(value?: string): ServiceType | null {
  if (value === "refill" || value === "bottled" || value === "personalized" || value === "ice") return value;
  return null;
}

export function CustomerOrderForm({
  initialPhone,
  reorderOrderNumber,
  initialService
}: {
  initialPhone?: string;
  reorderOrderNumber?: string;
  initialService?: string;
}) {
  const [form, setForm] = useState<OrderFormInput>(buildInitialForm);
  const [service, setService] = useState<ServiceType | null>(parseService(initialService));
  const [wizardStep, setWizardStep] = useState<WizardStep>(parseService(initialService) ? "product" : "service");
  const [refillSize, setRefillSize] = useState<number | "custom">(20);
  const [customRefill, setCustomRefill] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [customerLookup, setCustomerLookup] = useState<CustomerLookupResult | null>(null);
  const [settings, setSettings] = useState<PilotSettings>(defaultPilotSettings);
  const [catalogProducts, setCatalogProducts] = useState<PriceItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isArtworkUploading, setIsArtworkUploading] = useState(false);
  const [availability, setAvailability] = useState<Array<{ label: string; isFull: boolean; isPast: boolean; used: number; capacity: number }>>([]);
  const [todayOrderingClosed, setTodayOrderingClosed] = useState(false);
  const [forceAdvancedOpen, setForceAdvancedOpen] = useState(false);
  const lookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serviceInitialized = useRef(false);

  const catalog = catalogProducts.length > 0 ? catalogProducts : undefined;
  const isIceInquiry = service === "ice" && !hasIceCatalogProduct(catalogProducts);

  const totals = useMemo(
    () => calculateOrderTotal(form, settings, catalog, promo),
    [form, settings, catalog, promo]
  );

  const productLine = useMemo(() => {
    if (service === "refill" || form.refillLitres > 0) {
      return `${form.refillLitres}L refill`;
    }
    if (isIceInquiry) {
      return `Ice · ${form.quantity} unit(s)`;
    }
    const name = totals.selectedProduct?.name?.replace("Fresh Water ", "") ?? form.productSku;
    return `${name} · qty ${form.quantity}`;
  }, [service, form.refillLitres, form.quantity, form.productSku, isIceInquiry, totals.selectedProduct?.name]);

  const nextSlot = useMemo(() => getNextAvailableSlot(availability), [availability]);
  const isReturningCustomer = Boolean(customerLookup?.lastOrder);
  const needsName = !isReturningCustomer && !form.customerName.trim();
  const slotLabel = form.deliverySlot ?? nextSlot ?? "Next available";

  useEffect(() => {
    if (serviceInitialized.current || !initialService) return;
    const parsed = parseService(initialService);
    if (parsed) {
      setService(parsed);
      setForm((current) => applyServiceDefaults(parsed, current, catalogProducts));
      setWizardStep("product");
      serviceInitialized.current = true;
    }
  }, [initialService, catalogProducts]);

  useEffect(() => {
    async function loadAvailability() {
      const response = await fetch(`/api/v1/order-availability?date=${form.requestedFulfillmentDate}`, { cache: "no-store" });
      const payload = await response.json();

      if (response.ok) {
        setSettings(payload.data.settings);
        setAvailability(payload.data.slots);
        setTodayOrderingClosed(payload.data.todayOrderingClosed);

        const slot = getNextAvailableSlot(payload.data.slots);
        const date = getDefaultFulfillmentDate(payload.data.todayOrderingClosed);

        setForm((current) => ({
          ...current,
          requestedFulfillmentDate: payload.data.todayOrderingClosed ? date : current.requestedFulfillmentDate,
          pickupLocation: current.pickupLocation || pickupLocations[0],
          deliverySlot:
            current.fulfillmentType === "delivery" && slot
              ? slot
              : current.deliverySlot || deliverySlots[0].label,
          paymentMethod: current.paymentMethod ?? "cash"
        }));
      }
    }

    loadAvailability();
  }, [form.requestedFulfillmentDate]);

  useEffect(() => {
    async function loadCatalog() {
      setCatalogLoading(true);
      try {
        const response = await fetch("/api/v1/catalog/products", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()).data as PriceItem[];
          setCatalogProducts(data);
        }
      } finally {
        setCatalogLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const lookupCustomer = useCallback(async (phone: string) => {
    if (phone.replace(/\D/g, "").length < 7) {
      setCustomerLookup(null);
      return;
    }

    setIsLookingUp(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/customers/lookup?phone=${encodeURIComponent(phone.trim())}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not look up customer");
      }

      const lookup: CustomerLookupResult = payload.data;
      setCustomerLookup(lookup.orderCount > 0 ? lookup : null);

      if (lookup.lastOrder) {
        setForm((current) => ({
          ...current,
          customerName: lookup.customerName || current.customerName,
          deliveryAddress: lookup.preferredDeliveryAddress ?? current.deliveryAddress,
          deliverySlot: lookup.preferredDeliverySlot ?? current.deliverySlot,
          fulfillmentType: lookup.preferredFulfillmentType ?? current.fulfillmentType,
          pickupLocation: lookup.lastOrder?.pickupLocation ?? current.pickupLocation
        }));
      }
    } catch {
      setCustomerLookup(null);
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  useEffect(() => {
    const savedPhone = initialPhone || (typeof window !== "undefined" ? localStorage.getItem(LAST_PHONE_KEY) : null);
    if (savedPhone) {
      setForm((current) => ({ ...current, phoneNumber: savedPhone }));
      lookupCustomer(savedPhone);
    }
  }, [initialPhone, lookupCustomer]);

  useEffect(() => {
    async function loadReorder() {
      if (!reorderOrderNumber) return;

      const response = await fetch(`/api/v1/customer-orders?orderNumber=${encodeURIComponent(reorderOrderNumber)}`, { cache: "no-store" });
      const payload = await response.json();

      if (response.ok && payload.data?.[0]) {
        const lastOrder: CustomerOrder = payload.data[0];
        const date = getDefaultFulfillmentDate(todayOrderingClosed);
        const slot = nextSlot ?? lastOrder.deliverySlot ?? deliverySlots[0].label;
        const reorderForm = buildReorderInput(lastOrder, slot, date);
        setForm(reorderForm);
        if (lastOrder.refillLitres > 0) {
          const perContainer = lastOrder.refillLitres / Math.max(lastOrder.containerCount, 1);
          if ([5, 10, 20, 25].includes(perContainer)) {
            setRefillSize(perContainer);
          } else {
            setRefillSize("custom");
            setCustomRefill(perContainer);
          }
        }
        if (lastOrder.refillLitres > 0) setService("refill");
        else setService(inferServiceFromOrder(lastOrder));
        setWizardStep("confirm");
        lookupCustomer(lastOrder.phoneNumber);
      }
    }

    loadReorder();
  }, [reorderOrderNumber, lookupCustomer, nextSlot, todayOrderingClosed]);

  function updateForm<Key extends keyof OrderFormInput>(key: Key, value: OrderFormInput[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadArtwork(file: File) {
    const payload = new FormData();
    payload.append("file", file);
    setIsArtworkUploading(true);

    try {
      const response = await fetch("/api/v1/customer-orders/artwork", {
        method: "POST",
        body: payload
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not upload artwork");
      }

      updateForm("artworkUrl", data.data.path);
    } finally {
      setIsArtworkUploading(false);
    }
  }

  function handlePhoneChange(phone: string) {
    updateForm("phoneNumber", phone);

    if (lookupTimeoutRef.current) {
      clearTimeout(lookupTimeoutRef.current);
    }

    lookupTimeoutRef.current = setTimeout(() => {
      lookupCustomer(phone);
    }, 300);
  }

  function handleServiceSelect(nextService: ServiceType) {
    setService(nextService);
    setForm((current) => applyServiceDefaults(nextService, current, catalogProducts));
    setError(null);
  }

  function handleRefillSize(size: number) {
    if (size === -1) {
      setRefillSize("custom");
      setForm((current) => ({
        ...current,
        productSku: "FWM-REFILL-L",
        quantity: 0,
        refillLitres: customRefill * current.containerCount
      }));
      return;
    }
    setRefillSize(size);
    setForm((current) => ({
      ...current,
      productSku: "FWM-REFILL-L",
      quantity: 0,
      refillLitres: size * current.containerCount
    }));
  }

  function handleCustomRefill(litres: number) {
    setCustomRefill(litres);
    setForm((current) => ({
      ...current,
      refillLitres: litres * current.containerCount
    }));
  }

  function handleContainerCountChange(count: number) {
    const safeCount = Math.max(1, count);
    const litresPerContainer = refillSize === "custom" ? customRefill : refillSize;
    setForm((current) => ({
      ...current,
      containerCount: safeCount,
      refillLitres: litresPerContainer * safeCount
    }));
  }

  function handleSelectProduct(sku: string) {
    const product = catalogProducts.find((item) => item.sku === sku);
    setForm((current) => ({
      ...current,
      productSku: sku,
      quantity: sku === "FWM-DESIGN-STICKER" ? 1 : Math.max(current.quantity, 1),
      orderType: product?.category === "personalized_water" || service === "personalized" ? "personalized" : current.orderType
    }));
  }

  function handleOrderAgain() {
    if (!customerLookup?.lastOrder) return;

    const lastOrder = customerLookup.lastOrder;
    const inferred = inferServiceFromOrder(lastOrder);
    const date = getDefaultFulfillmentDate(todayOrderingClosed);
    const slot = nextSlot ?? lastOrder.deliverySlot ?? deliverySlots[0].label;
    const reorderForm = buildReorderInput(lastOrder, slot, date);

    setService(inferred);
    setForm(reorderForm);

    if (lastOrder.refillLitres > 0) {
      const perContainer = lastOrder.refillLitres / Math.max(lastOrder.containerCount, 1);
      if ([5, 10, 20, 25].includes(perContainer)) {
        setRefillSize(perContainer);
      } else {
        setRefillSize("custom");
        setCustomRefill(perContainer);
      }
    }

    setWizardStep("confirm");
    setError(null);
  }

  function handleQuantityChange(qty: number) {
    setForm((current) => ({
      ...current,
      quantity: qty,
      customerNotes:
        service === "ice" && !hasIceCatalogProduct(catalogProducts)
          ? buildIceInquiryNotes(qty)
          : current.customerNotes
    }));
  }

  function goBack() {
    const index = WIZARD_STEPS.indexOf(wizardStep);
    if (index > 0) {
      setWizardStep(WIZARD_STEPS[index - 1]);
      setError(null);
    }
  }

  function goNext() {
    const stepError = validateWizardStep(wizardStep, form, service, { needsName });
    if (stepError) {
      setError(stepError);
      return;
    }

    if (wizardStep === "service" && service) {
      setWizardStep("product");
      setError(null);
      return;
    }

    const index = WIZARD_STEPS.indexOf(wizardStep);
    if (index < WIZARD_STEPS.length - 1) {
      setWizardStep(WIZARD_STEPS[index + 1]);
      setError(null);
    }
  }

  function goToConfirm() {
    const contactError = validateWizardStep("contact", form, service, { needsName });
    if (contactError) {
      setError(contactError);
      return;
    }
    if (form.fulfillmentType === "delivery" && !form.deliverySlot) {
      setError("No delivery slots available. Try tomorrow.");
      return;
    }
    setError(null);
    setWizardStep("confirm");
  }

  async function submitOrder() {
    if (form.fulfillmentType === "delivery" && !form.deliveryAddress?.trim()) {
      setWizardStep("fulfillment");
      setError("Enter where we should deliver.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/customer-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paymentMethod: form.paymentMethod ?? "cash" })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not submit order");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_PHONE_KEY, form.phoneNumber);
      }

      setOrder(payload.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not submit order");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function validatePromo() {
    if (!form.promoCode?.trim()) {
      setPromo(null);
      setPromoMessage("Enter a promo code first.");
      return;
    }

    setPromoMessage(null);
    const prePromoTotal = calculateOrderTotal(form, settings, catalog).total;
    const response = await fetch(`/api/v1/promos/validate?code=${encodeURIComponent(form.promoCode.trim())}&total=${prePromoTotal}`, { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      setPromo(null);
      setPromoMessage(payload.error ?? "Promo code is not valid.");
      return;
    }

    setPromo(payload.data.promo);
    setPromoMessage(`Promo applied: ${payload.data.promo.code}`);
  }

  function resetForm() {
    setOrder(null);
    setForm(buildInitialForm());
    setService(null);
    setRefillSize(20);
    setWizardStep("service");
    setCustomerLookup(null);
    setPromo(null);
    setPromoMessage(null);
    setError(null);
    setForceAdvancedOpen(false);
  }

  if (order) {
    return (
      <CustomerShell showAssistant={false} compactFooter>
        <OrderSuccessScreen order={order} onPlaceAnother={resetForm} />
      </CustomerShell>
    );
  }

  if (wizardStep === "confirm") {
    return (
      <CustomerShell showAssistant={false} compactFooter>
        <OrderConfirmScreen
          form={form}
          service={service}
          productLine={productLine}
          totals={{ total: totals.total, deliveryFee: totals.deliveryFee }}
          isIceInquiry={isIceInquiry}
          isSubmitting={isSubmitting}
          error={error}
          onBack={() => {
            setWizardStep("contact");
            setError(null);
          }}
          onSubmit={submitOrder}
        />
      </CustomerShell>
    );
  }

  const { title, subtitle } = stepTitles[wizardStep];
  const showStickyTotal = wizardStep === "product" || wizardStep === "fulfillment" || wizardStep === "contact";
  const continueDisabled =
    (wizardStep === "service" && !service) ||
    (wizardStep === "product" && catalogLoading && service !== "refill") ||
    (wizardStep === "product" && service === "personalized" && isArtworkUploading);

  return (
    <CustomerShell className={showStickyTotal ? "pb-20" : "pb-6"}>
      <section className="mx-auto min-h-[calc(100vh-4rem)] max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        {wizardStep === "service" ? (
          <div className="mb-5 rounded-2xl border border-cyan-100 bg-white px-5 py-5 text-[#061a4f] shadow-sm shadow-cyan-900/5 sm:px-6">
            <p className="text-sm font-bold text-primary">Fresh Water Market ordering</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Order in under a minute</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-primary/75">
              Pick your service, choose pickup or delivery, and confirm with your phone number.
            </p>
          </div>
        ) : (
          <p className="mb-4 text-sm font-bold text-primary">Fresh Water Market ordering</p>
        )}

        <WizardProgressBar currentStep={wizardStep} />

        {wizardStep !== "service" ? (
          <button
            type="button"
            className="focus-ring mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}

        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-900/5 sm:p-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#061a4f]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-primary/75">{subtitle}</p>

          {!settings.pilotActive || todayOrderingClosed ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
              {settings.pilotActive ? "Today's delivery windows have passed. Please order for the next delivery day." : settings.orderCutoffMessage}
            </p>
          ) : null}

          <div className="mt-6">
            {wizardStep === "service" ? (
              <StepService selected={service} catalog={catalogProducts} onSelect={handleServiceSelect} />
            ) : null}

            {wizardStep === "product" && service ? (
              <StepProduct
                service={service}
                form={form}
                catalog={catalogProducts}
                catalogLoading={catalogLoading}
                refillSize={refillSize}
                customRefill={customRefill}
                onSelectProduct={handleSelectProduct}
                onRefillSize={handleRefillSize}
                onCustomRefill={handleCustomRefill}
                onQuantityChange={handleQuantityChange}
                onContainerCountChange={service === "refill" ? handleContainerCountChange : undefined}
                onUpdate={updateForm}
                onUploadArtwork={uploadArtwork}
              />
            ) : null}

            {wizardStep === "fulfillment" ? (
              <StepFulfillment
                form={form}
                availability={availability}
                slotLabel={slotLabel}
                onFulfillmentType={(type) => updateForm("fulfillmentType", type)}
                onPickupLocation={(location) => updateForm("pickupLocation", location)}
                onDeliverySlot={(slot) => updateForm("deliverySlot", slot)}
                onDeliveryAddress={(address) => updateForm("deliveryAddress", address)}
              />
            ) : null}

            {wizardStep === "contact" ? (
              <>
                <StepContact
                  form={form}
                  needsName={needsName}
                  isLookingUp={isLookingUp}
                  customerLookup={customerLookup}
                  onPhoneChange={handlePhoneChange}
                  onNameChange={(name) => updateForm("customerName", name)}
                  onOrderAgain={handleOrderAgain}
                />
                <div className="mt-5">
                  <AdvancedOptionsPanel
                    form={form}
                    catalog={catalogProducts}
                    availability={availability}
                    promoMessage={promoMessage}
                    promoApplied={Boolean(promo)}
                    forceOpen={forceAdvancedOpen}
                    hideContainerCount={service === "refill"}
                    onUpdate={updateForm}
                    onContainerCountChange={handleContainerCountChange}
                    onValidatePromo={validatePromo}
                  />
                </div>
              </>
            ) : null}
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>
          ) : null}

          <div className="mt-6">
            {wizardStep === "contact" ? (
              <CustomerButton
                type="button"
                className="w-full"
                disabled={!settings.pilotActive || todayOrderingClosed || Boolean(availability.find((slot) => slot.label === form.deliverySlot)?.isFull && form.fulfillmentType === "delivery")}
                onClick={goToConfirm}
              >
                Review order
              </CustomerButton>
            ) : (
              <CustomerButton
                type="button"
                className="w-full"
                disabled={continueDisabled}
                onClick={goNext}
              >
                {isArtworkUploading && wizardStep === "product"
                  ? "Uploading artwork..."
                  : catalogLoading && wizardStep === "product"
                    ? "Loading products..."
                    : "Continue"}
              </CustomerButton>
            )}
          </div>
        </div>

        {showStickyTotal ? (
          <StickyTotalBar
            total={totals.total}
            quoteLabel={isIceInquiry ? "Contact for quote" : undefined}
          />
        ) : null}
      </section>
    </CustomerShell>
  );
}
