"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
import type { PriceItem } from "@/modules/catalog/pricing";
import type { OrderFormInput } from "@/modules/orders/customer-order";
import {
  formatProductLabel,
  getProductsForService,
  hasIceCatalogProduct,
  REFILL_SIZES,
  type ServiceType
} from "@/lib/orders/order-wizard";
import { productImageForService } from "@/lib/catalog/product-image";
import { formatCurrency, cn } from "@/lib/utils";
import { BrandImage } from "@/components/customer/brand-image";
import { CustomerButton, CustomerButtonLink } from "@/components/customer/customer-button";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { QuantityStepper } from "@/components/order/wizard/quantity-stepper";
import { ProductRowSkeleton } from "@/components/skeletons/customer-skeletons";

export type ProductFilter = "all" | ServiceType;

const FILTER_OPTIONS: { value: ProductFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "refill", label: "Refill" },
  { value: "bottled", label: "Bottled" },
  { value: "personalized", label: "Branded" },
  { value: "ice", label: "Ice" }
];

const thumbClass = "h-20 w-20 shrink-0 rounded-xl bg-cyan-50 object-contain p-1 ring-1 ring-cyan-100";

function inferServiceForProduct(product: PriceItem): ServiceType {
  if (product.category === "refill" || product.sku === "FWM-REFILL-L") return "refill";
  if (product.category === "personalized_water" || product.category === "design") return "personalized";
  if (product.sku.startsWith("FWM-ICE")) return "ice";
  return "bottled";
}

function buildVisibleProducts(filter: ProductFilter, catalog: PriceItem[]): Array<{ product: PriceItem; service: ServiceType }> {
  const services: ServiceType[] =
    filter === "all" ? ["refill", "bottled", "personalized", "ice"] : [filter];

  const rows: Array<{ product: PriceItem; service: ServiceType }> = [];

  for (const service of services) {
    if (service === "ice" && !hasIceCatalogProduct(catalog)) {
      rows.push({
        service: "ice",
        product: {
          sku: "FWM-ICE-INQUIRY",
          name: "Ice supply",
          category: "bottled_water",
          unit: "bag",
          price: 0,
          active: true
        }
      });
      continue;
    }

    const products = getProductsForService(service, catalog);
    for (const product of products) {
      rows.push({ product, service });
    }
  }

  return rows;
}

const addButtonClass =
  "focus-ring inline-flex min-h-11 min-w-[88px] items-center justify-center gap-1 rounded-xl border px-4 text-sm font-semibold transition-colors";

export function OrderProductPicker({
  filter,
  onFilterChange,
  service,
  form,
  catalog,
  catalogLoading,
  catalogError,
  onRetryCatalog,
  refillSize,
  customRefill,
  onSelectProduct,
  onSelectService,
  onRefillSize,
  onCustomRefill,
  onQuantityChange,
  onContainerCountChange,
  onCartError
}: {
  filter: ProductFilter;
  onFilterChange: (filter: ProductFilter) => void;
  service: ServiceType | null;
  form: OrderFormInput;
  catalog: PriceItem[];
  catalogLoading?: boolean;
  catalogError?: boolean;
  onRetryCatalog?: () => void;
  refillSize: number | "custom";
  customRefill: number;
  onSelectProduct: (sku: string) => void;
  onSelectService: (service: ServiceType) => void;
  onRefillSize: (size: number) => void;
  onCustomRefill: (litres: number) => void;
  onQuantityChange: (qty: number) => void;
  onContainerCountChange: (count: number) => void;
  onCartError?: (message: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useCustomerAuth();
  const { cartSkus, items: cartItems, addItem } = useCart();
  const [addingSku, setAddingSku] = useState<string | null>(null);

  const visibleProducts = useMemo(() => buildVisibleProducts(filter, catalog), [filter, catalog]);
  const refillProduct = catalog.find((item) => item.sku === "FWM-REFILL-L");
  const isIceInquiry = service === "ice" && !hasIceCatalogProduct(catalog);
  const showRefillPanel = service === "refill" && (filter === "all" || filter === "refill");
  const cartCount = cartItems.length;

  function requireLogin() {
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }

  async function handleAddToCart(input: {
    sku: string;
    serviceType: ServiceType;
    quantity: number;
    refillLitres?: number;
    containerCount?: number;
    productName: string;
    unitPrice: number;
  }) {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }

    setAddingSku(input.sku);
    try {
      await addItem(input);
      onSelectService(input.serviceType);
      if (input.sku !== "FWM-REFILL-L" && input.sku !== "FWM-ICE-INQUIRY") {
        onSelectProduct(input.sku);
      }
    } catch (error) {
      onCartError?.(error instanceof Error ? error.message : "Could not add to cart");
    } finally {
      setAddingSku(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Choose Your Water</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Order refills, bottled water, branded cases, or ice. Pickup around campus or student delivery from P30.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Filter by type</p>
        {isAuthenticated && cartCount > 0 ? (
          <CustomerButtonLink href="/cart" variant="outline" className="h-11 gap-1.5 px-3 text-sm">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            View cart ({cartCount})
          </CustomerButtonLink>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            className={cn(
              "focus-ring min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              filter === option.value
                ? "border-primary bg-primary text-white"
                : "border-primary/30 bg-white text-primary hover:border-primary hover:bg-primary/5"
            )}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 divide-y divide-cyan-100 border-y border-cyan-100">
        {catalogLoading ? (
          Array.from({ length: 4 }).map((_, index) => <ProductRowSkeleton key={index} />)
        ) : catalogError ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-foreground">Could not load products.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            {onRetryCatalog ? (
              <CustomerButton type="button" variant="outline" className="mt-4" onClick={onRetryCatalog}>
                Retry
              </CustomerButton>
            ) : null}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-foreground">No products match this filter.</p>
            <button
              type="button"
              className="focus-ring mt-2 text-sm font-semibold text-primary underline underline-offset-2"
              onClick={() => onFilterChange("all")}
            >
              Show all products
            </button>
          </div>
        ) : (
          visibleProducts.map(({ product, service: rowService }) => {
            if (rowService === "refill") {
              const inCart = cartSkus.has("FWM-REFILL-L");
              const priceLabel = refillProduct ? `${formatCurrency(refillProduct.price)}/L` : "P1.60/L";

              return (
                <div key="refill-row" className="py-4">
                  <div className="flex items-start gap-4">
                    <BrandImage
                      src={productImageForService("refill")}
                      alt="Water refill"
                      className={thumbClass}
                      fallbackLabel="Refill"
                      width={80}
                      height={80}
                      sizes="80px"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">Water Refill</p>
                        <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-bold text-foreground">
                          Most popular
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">Bring your container · {priceLabel}</p>
                      <button
                        type="button"
                        className="focus-ring mt-1 text-sm font-semibold text-primary underline underline-offset-2"
                        onClick={() => onSelectService("refill")}
                      >
                        Details
                      </button>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-sm font-bold text-foreground">{priceLabel}</p>
                      <button
                        type="button"
                        className={cn(
                          addButtonClass,
                          inCart
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-primary bg-white text-primary hover:bg-primary/5"
                        )}
                        disabled={addingSku === "FWM-REFILL-L"}
                        onClick={() => {
                          onSelectService("refill");
                          handleAddToCart({
                            sku: "FWM-REFILL-L",
                            serviceType: "refill",
                            quantity: 0,
                            refillLitres: form.refillLitres || 20,
                            containerCount: form.containerCount || 1,
                            productName: "Water Refill",
                            unitPrice: refillProduct?.price ?? 1.6
                          });
                        }}
                      >
                        {inCart ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden="true" />
                            Added
                          </>
                        ) : (
                          "Add"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            if (product.sku === "FWM-ICE-INQUIRY") {
              const inCart = cartSkus.has("FWM-ICE-INQUIRY");
              return (
                <div key="ice-inquiry" className="py-4">
                  <div className="flex items-start gap-4">
                    <BrandImage
                      src={productImageForService("ice")}
                      alt="Ice supply"
                      className={thumbClass}
                      fallbackLabel="Ice"
                      width={80}
                      height={80}
                      sizes="80px"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">Ice supply</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">Contact for current pricing</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-sm font-bold text-foreground">Quote</p>
                      <button
                        type="button"
                        className={cn(
                          addButtonClass,
                          inCart
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-primary bg-white text-primary hover:bg-primary/5"
                        )}
                        disabled={addingSku === "FWM-ICE-INQUIRY"}
                        onClick={() => {
                          handleAddToCart({
                            sku: "FWM-ICE-INQUIRY",
                            serviceType: "ice",
                            quantity: form.productSku === "FWM-ICE-INQUIRY" || service === "ice" ? form.quantity || 1 : 1,
                            productName: "Ice supply",
                            unitPrice: 0
                          });
                        }}
                      >
                        {inCart ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden="true" />
                            Added
                          </>
                        ) : (
                          "Add"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            const inCart = cartSkus.has(product.sku);
            const inferred = inferServiceForProduct(product);
            const quantity = form.productSku === product.sku ? form.quantity || 1 : 1;

            return (
              <div key={product.sku} className="py-4">
                <div className="flex items-start gap-4">
                  <BrandImage
                    src={productImageForService(inferred)}
                    alt={formatProductLabel(product)}
                    className={thumbClass}
                    fallbackLabel={formatProductLabel(product)}
                    width={80}
                    height={80}
                    sizes="80px"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{formatProductLabel(product)}</p>
                    <p className="mt-0.5 text-sm capitalize text-muted-foreground">
                      {product.unit}
                      {product.unit === "case" ? " · 24 bottles" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(product.price)}</p>
                    <button
                      type="button"
                      className={cn(
                        addButtonClass,
                        inCart
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-primary bg-white text-primary hover:bg-primary/5"
                      )}
                      disabled={addingSku === product.sku}
                      onClick={() => {
                        handleAddToCart({
                          sku: product.sku,
                          serviceType: rowService,
                          quantity,
                          productName: formatProductLabel(product),
                          unitPrice: product.price
                        });
                      }}
                    >
                      {inCart ? (
                        <>
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Added
                        </>
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showRefillPanel ? (
        <div className="mt-6 space-y-4 rounded-xl bg-aqua/45 p-4">
          <p className="text-sm font-semibold text-foreground">Refill size per container</p>
          <div className="flex flex-wrap gap-2">
            {REFILL_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={refillSize === size}
                className={cn(
                  "focus-ring min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  refillSize === size
                    ? "border-primary bg-primary text-white"
                    : "border-primary/30 bg-white text-primary hover:border-primary"
                )}
                onClick={() => onRefillSize(size)}
              >
                {size}L
              </button>
            ))}
            <button
              type="button"
              aria-pressed={refillSize === "custom"}
              className={cn(
                "focus-ring min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                refillSize === "custom"
                  ? "border-primary bg-primary text-white"
                  : "border-primary/30 bg-white text-primary hover:border-primary"
              )}
              onClick={() => onRefillSize(-1)}
            >
              Custom
            </button>
          </div>
          {refillSize === "custom" ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Litres per container</span>
              <input
                className="focus-ring h-12 w-full max-w-xs rounded-xl border border-input bg-white px-3 text-sm"
                type="number"
                min="1"
                step="0.5"
                value={customRefill}
                onChange={(event) => onCustomRefill(Number(event.target.value))}
              />
            </label>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-foreground">Number of containers</span>
            <QuantityStepper value={form.containerCount || 1} onChange={onContainerCountChange} min={1} max={20} />
          </div>
          <p className="text-sm font-semibold text-primary">
            Total: {form.refillLitres}L ({form.containerCount || 1} container{(form.containerCount || 1) > 1 ? "s" : ""})
          </p>
        </div>
      ) : null}

      {service && service !== "refill" && form.productSku ? (
        <div className="mt-6 flex flex-col gap-3 rounded-xl bg-aqua/45 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-foreground">
            {isIceInquiry ? "How much ice do you need?" : "Quantity"}
          </span>
          <QuantityStepper value={form.quantity || 1} onChange={onQuantityChange} min={1} max={99} />
        </div>
      ) : null}
    </div>
  );
}
