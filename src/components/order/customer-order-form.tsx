"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton } from "@/components/customer/customer-button";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { CartLineList } from "@/components/cart/cart-line-list";
import { buildOrderPayloadFromCartItem, cartItemLineTotal } from "@/lib/cart/cart-checkout";
import { CartOrderSuccessScreen } from "@/components/order/cart-order-success-screen";
import { OrderCheckoutBar } from "@/components/order/order-checkout-bar";
import { OrderConfirmScreen } from "@/components/order/order-confirm-screen";
import { OrderFlowLayout } from "@/components/order/order-flow-layout";
import { OrderProductPicker, type ProductFilter } from "@/components/order/order-product-picker";
import { OrderSuccessScreen } from "@/components/order/order-success-screen";
import { AdvancedOptionsPanel } from "@/components/order/wizard/advanced-options";
import { StepContact } from "@/components/order/wizard/step-contact";
import { StepFulfillment } from "@/components/order/wizard/step-fulfillment";
import { buildIceInquiryNotes } from "@/components/order/wizard/step-product";
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

const stepTitles: Record<Exclude<WizardStep, "service" | "confirm">, { title: string; subtitle: string }> = {
  product: { title: "Choose Your Water", subtitle: "Pick your products and quantities." },
  fulfillment: { title: "Pickup or Delivery", subtitle: "Choose how you want to receive your order." },
  contact: { title: "Your Details", subtitle: "We use your phone number to confirm and track your order." }
};

function parseProductFilter(value?: string): ProductFilter {
  const service = parseService(value);
  return service ?? "all";
}

function parseService(value?: string): ServiceType | null {
  if (value === "refill" || value === "bottled" || value === "personalized" || value === "ice") return value;
  return null;
}

type FieldErrors = {
  phone?: string;
  name?: string;
  deliveryAddress?: string;
};

function mapValidationError(message: string, step: WizardStep): { fieldErrors: FieldErrors; generalError: string | null } {
  if (step === "contact") {
    if (message === "Enter your phone number.") return { fieldErrors: { phone: message }, generalError: null };
    if (message === "Enter your name.") return { fieldErrors: { name: message }, generalError: null };
  }
  if (step === "fulfillment" && message === "Enter where we should deliver.") {
    return { fieldErrors: { deliveryAddress: message }, generalError: null };
  }
  return { fieldErrors: {}, generalError: message };
}

export function CustomerOrderForm({
  initialPhone,
  reorderOrderNumber,
  initialService,
  fromCart = false
}: {
  initialPhone?: string;
  reorderOrderNumber?: string;
  initialService?: string;
  fromCart?: boolean;
}) {
  const router = useRouter();
  const { profile, isAuthenticated } = useCustomerAuth();
  const { items: cartItems, clearCart } = useCart();
  const cartMode = fromCart && isAuthenticated;
  const [form, setForm] = useState<OrderFormInput>(buildInitialForm);
  const [service, setService] = useState<ServiceType | null>(parseService(initialService) ?? "bottled");
  const [productFilter, setProductFilter] = useState<ProductFilter>(parseProductFilter(initialService));
  const [wizardStep, setWizardStep] = useState<WizardStep>(cartMode ? "fulfillment" : "product");
  const [refillSize, setRefillSize] = useState<number | "custom">(20);
  const [customRefill, setCustomRefill] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [cartOrders, setCartOrders] = useState<CustomerOrder[]>([]);
  const [customerLookup, setCustomerLookup] = useState<CustomerLookupResult | null>(null);
  const [settings, setSettings] = useState<PilotSettings>(defaultPilotSettings);
  const [catalogProducts, setCatalogProducts] = useState<PriceItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
  const isReturningCustomer = Boolean(customerLookup?.lastOrder) || Boolean(profile);
  const needsName = !isReturningCustomer && !form.customerName.trim();
  const slotLabel = form.deliverySlot ?? nextSlot ?? "Next available";

  const cartLines = useMemo(
    () =>
      cartItems.map((item) => ({
        name: item.productName,
        detail:
          item.serviceType === "refill"
            ? `${item.refillLitres}L · ${item.containerCount} container(s)`
            : `Qty ${item.quantity}`,
        total: cartItemLineTotal(item)
      })),
    [cartItems]
  );

  const cartSubtotal = useMemo(() => cartLines.reduce((sum, line) => sum + line.total, 0), [cartLines]);

  const cartCheckoutTotals = useMemo(() => {
    const deliveryFee =
      form.fulfillmentType === "delivery" && cartItems.length > 0 ? settings.studentDeliveryFee * cartItems.length : 0;
    return { total: cartSubtotal + deliveryFee, deliveryFee };
  }, [cartSubtotal, cartItems.length, form.fulfillmentType, settings.studentDeliveryFee]);

  useEffect(() => {
    if (!cartMode) return;
    if (cartItems.length === 0 && !order && cartOrders.length === 0) {
      router.replace("/cart");
    }
  }, [cartMode, cartItems.length, order, cartOrders.length, router]);

  useEffect(() => {
    if (profile) {
      setForm((current) => ({
        ...current,
        customerName: profile.fullName || current.customerName,
        phoneNumber: profile.phoneNumber || current.phoneNumber
      }));
    }
  }, [profile]);

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
      setCatalogError(false);
      try {
        const response = await fetch("/api/v1/catalog/products", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()).data as PriceItem[];
          setCatalogProducts(data);
        } else {
          setCatalogError(true);
        }
      } catch {
        setCatalogError(true);
      } finally {
        setCatalogLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const reloadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(false);
    try {
      const response = await fetch("/api/v1/catalog/products", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()).data as PriceItem[];
        setCatalogProducts(data);
      } else {
        setCatalogError(true);
      }
    } catch {
      setCatalogError(true);
    } finally {
      setCatalogLoading(false);
    }
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

  function handleFilterChange(nextFilter: ProductFilter) {
    setProductFilter(nextFilter);
    if (nextFilter !== "all") {
      handleServiceSelect(nextFilter);
    }
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

  function applyStepValidation(message: string | null, step: WizardStep) {
    if (!message) {
      setFieldErrors({});
      setError(null);
      return true;
    }
    const mapped = mapValidationError(message, step);
    setFieldErrors(mapped.fieldErrors);
    setError(mapped.generalError);
    return false;
  }

  function goBack() {
    const stepOrder: WizardStep[] = ["product", "fulfillment", "contact"];
    const index = stepOrder.indexOf(wizardStep);
    if (index > 0) {
      setWizardStep(stepOrder[index - 1]);
      setFieldErrors({});
      setError(null);
    }
  }

  function goNext() {
    if (wizardStep === "product" && isAuthenticated) {
      router.push("/cart");
      return;
    }

    const stepError = validateWizardStep(wizardStep, form, service, { needsName: cartMode ? false : needsName });
    if (!applyStepValidation(stepError, wizardStep)) {
      return;
    }

    const stepOrder: WizardStep[] = ["product", "fulfillment", "contact", "confirm"];
    const index = stepOrder.indexOf(wizardStep);
    if (index < stepOrder.length - 2) {
      setWizardStep(stepOrder[index + 1]);
      setFieldErrors({});
      setError(null);
    }
  }

  function goToConfirm() {
    const contactError = validateWizardStep("contact", form, service, { needsName: cartMode ? false : needsName });
    if (!applyStepValidation(contactError, "contact")) {
      return;
    }
    if (form.fulfillmentType === "delivery" && !form.deliverySlot) {
      setError("No delivery slots available. Try tomorrow.");
      return;
    }
    setFieldErrors({});
    setError(null);
    setWizardStep("confirm");
  }

  async function submitOrder() {
    if (form.fulfillmentType === "delivery" && !form.deliveryAddress?.trim()) {
      setWizardStep("fulfillment");
      setFieldErrors({ deliveryAddress: "Enter where we should deliver." });
      setError(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (cartMode && cartItems.length > 0) {
        const placed: CustomerOrder[] = [];

        for (const item of cartItems) {
          const payload = buildOrderPayloadFromCartItem(item, form);
          const response = await fetch("/api/v1/customer-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, paymentMethod: form.paymentMethod ?? "cash" })
          });
          const body = await response.json();

          if (!response.ok) {
            throw new Error(body.error ?? `Could not submit ${item.productName}`);
          }

          placed.push(body.data);
        }

        await clearCart();

        if (typeof window !== "undefined" && form.phoneNumber) {
          localStorage.setItem(LAST_PHONE_KEY, form.phoneNumber);
        }

        setCartOrders(placed);
        return;
      }

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
    setCartOrders([]);
    setForm(buildInitialForm());
    setService("bottled");
    setProductFilter("all");
    setRefillSize(20);
    setWizardStep(fromCart && isAuthenticated ? "fulfillment" : "product");
    setCustomerLookup(null);
    setPromo(null);
    setPromoMessage(null);
    setError(null);
    setFieldErrors({});
    setForceAdvancedOpen(false);
  }

  if (cartOrders.length > 0) {
    return (
      <CustomerShell showAssistant={false} compactFooter>
        <CartOrderSuccessScreen orders={cartOrders} onPlaceAnother={resetForm} />
      </CustomerShell>
    );
  }

  if (order) {
    return (
      <CustomerShell showAssistant={false} compactFooter>
        <OrderSuccessScreen order={order} onPlaceAnother={resetForm} />
      </CustomerShell>
    );
  }

  if (wizardStep === "confirm") {
    const confirmTotals = cartMode ? cartCheckoutTotals : { total: totals.total, deliveryFee: totals.deliveryFee };
    const confirmIceInquiry = cartMode ? cartItems.some((item) => item.sku === "FWM-ICE-INQUIRY") : isIceInquiry;
    const placeOrderLabel = isSubmitting
      ? "Placing order..."
      : cartMode && cartItems.length > 1
        ? "Place orders"
        : "Place Order";

    return (
      <OrderFlowLayout
        currentStep="confirm"
        mobileCheckoutBar={
          <OrderCheckoutBar
            label={placeOrderLabel}
            total={confirmIceInquiry ? undefined : confirmTotals.total}
            quoteLabel={confirmIceInquiry ? "Contact for quote" : undefined}
            disabled={isSubmitting}
            onClick={submitOrder}
          />
        }
      >
          <button
            type="button"
            className="focus-ring mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            onClick={() => {
              setWizardStep("contact");
              setError(null);
            }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
          <OrderConfirmScreen
            form={form}
            service={service}
            productLine={cartMode ? `${cartItems.length} cart item(s)` : productLine}
            cartLines={cartMode ? cartLines : undefined}
            totals={confirmTotals}
            isIceInquiry={confirmIceInquiry}
            isSubmitting={isSubmitting}
            error={error}
          onSubmit={submitOrder}
        />
      </OrderFlowLayout>
    );
  }

  const stepMeta = wizardStep === "product" || wizardStep === "fulfillment" || wizardStep === "contact" ? stepTitles[wizardStep] : null;
  const continueDisabled =
    cartMode
      ? false
      : !service ||
        (wizardStep === "product" && catalogLoading) ||
        (wizardStep === "product" && service === "personalized" && isArtworkUploading);

  const continueLabel =
    wizardStep === "product"
      ? isAuthenticated
        ? "View cart"
        : isArtworkUploading
          ? "Uploading artwork..."
          : catalogLoading
            ? "Loading products..."
            : "Add Products to Continue"
      : wizardStep === "fulfillment"
        ? "Continue"
        : "Review order";

  const reviewDisabled =
    !settings.pilotActive ||
    todayOrderingClosed ||
    Boolean(availability.find((slot) => slot.label === form.deliverySlot)?.isFull && form.fulfillmentType === "delivery");

  const checkoutTotal = cartMode ? cartCheckoutTotals.total : totals.total;
  const checkoutQuote = cartMode
    ? undefined
    : isIceInquiry
      ? "Contact for quote"
      : undefined;
  const showCheckoutTotal = wizardStep !== "contact" && (cartMode ? checkoutTotal > 0 : checkoutTotal > 0 || isIceInquiry);

  const handleCheckoutAction = () => {
    if (wizardStep === "contact") {
      goToConfirm();
    } else {
      goNext();
    }
  };

  const checkoutDisabled = wizardStep === "contact" ? reviewDisabled : continueDisabled;

  return (
    <OrderFlowLayout
      currentStep={wizardStep}
      mobileCheckoutBar={
          <OrderCheckoutBar
            label={wizardStep === "contact" ? "Review order" : continueLabel}
            total={showCheckoutTotal && !checkoutQuote ? checkoutTotal : undefined}
            quoteLabel={checkoutQuote}
            disabled={checkoutDisabled}
            onClick={handleCheckoutAction}
          />
        }
      >
        {wizardStep !== "product" ? (
          <button
            type="button"
            className="focus-ring mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        ) : null}

        {wizardStep === "product" ? (
          <OrderProductPicker
            filter={productFilter}
            onFilterChange={handleFilterChange}
            service={service}
            form={form}
            catalog={catalogProducts}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            onRetryCatalog={reloadCatalog}
            refillSize={refillSize}
            customRefill={customRefill}
            onSelectProduct={handleSelectProduct}
            onSelectService={handleServiceSelect}
            onRefillSize={handleRefillSize}
            onCustomRefill={handleCustomRefill}
            onQuantityChange={handleQuantityChange}
            onContainerCountChange={handleContainerCountChange}
            onCartError={setError}
          />
        ) : stepMeta ? (
          <>
            <div aria-live="polite" aria-atomic="true">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{stepMeta.title}</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{stepMeta.subtitle}</p>
            </div>
          </>
        ) : null}

        {!settings.pilotActive || todayOrderingClosed ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="status">
            {settings.pilotActive ? "Today's delivery windows have passed. Please order for the next delivery day." : settings.orderCutoffMessage}
          </p>
        ) : null}

        <div className="mt-6">
          {cartMode && wizardStep === "fulfillment" ? (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground">Cart summary</h2>
              <div className="mt-3">
                <CartLineList items={cartItems} readOnly onUpdateQuantity={async () => undefined} onRemove={async () => undefined} />
              </div>
            </div>
          ) : null}

          {wizardStep === "fulfillment" ? (
            <StepFulfillment
              form={form}
              availability={availability}
              slotLabel={slotLabel}
              deliveryAddressError={fieldErrors.deliveryAddress}
              onFulfillmentType={(type) => {
                updateForm("fulfillmentType", type);
                setFieldErrors((current) => ({ ...current, deliveryAddress: undefined }));
              }}
              onPickupLocation={(location) => updateForm("pickupLocation", location)}
              onDeliverySlot={(slot) => updateForm("deliverySlot", slot)}
              onDeliveryAddress={(address) => {
                updateForm("deliveryAddress", address);
                setFieldErrors((current) => ({ ...current, deliveryAddress: undefined }));
              }}
            />
          ) : null}

          {wizardStep === "contact" ? (
            <>
              <StepContact
                form={form}
                needsName={needsName}
                isLookingUp={isLookingUp}
                customerLookup={customerLookup}
                phoneError={fieldErrors.phone}
                nameError={fieldErrors.name}
                onPhoneChange={(phone) => {
                  handlePhoneChange(phone);
                  setFieldErrors((current) => ({ ...current, phone: undefined }));
                }}
                onNameChange={(name) => {
                  updateForm("customerName", name);
                  setFieldErrors((current) => ({ ...current, name: undefined }));
                }}
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
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 hidden lg:block">
          {wizardStep === "contact" ? (
            <CustomerButton type="button" className="w-full" disabled={reviewDisabled} onClick={goToConfirm}>
              Review order
            </CustomerButton>
          ) : (
            <CustomerButton type="button" className="w-full" disabled={continueDisabled} onClick={goNext}>
              {continueLabel}
            </CustomerButton>
          )}
        </div>

        {showCheckoutTotal ? (
          <p className="mt-3 hidden text-center text-sm font-semibold text-muted-foreground lg:block">
            {checkoutQuote ?? `Estimated total: P${checkoutTotal.toFixed(2)}`}
          </p>
        ) : null}
      </OrderFlowLayout>
  );
}
