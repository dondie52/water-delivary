"use client";

import { useEffect, useState } from "react";
import { FileText, ImageIcon, Upload, X } from "lucide-react";
import type { PriceItem } from "@/modules/catalog/pricing";
import type { OrderFormInput } from "@/modules/orders/customer-order";
import {
  formatProductLabel,
  getProductsForService,
  hasIceCatalogProduct,
  ICE_INQUIRY_NOTE_PREFIX,
  REFILL_SIZES,
  type ServiceType
} from "@/lib/orders/order-wizard";
import { formatCurrency } from "@/lib/utils";
import { QuantityStepper, SelectableTile } from "@/components/order/wizard/quantity-stepper";
import { WizardProductGridSkeleton } from "@/components/skeletons/customer-skeletons";

export function StepProduct({
  service,
  form,
  catalog,
  catalogLoading,
  refillSize,
  customRefill,
  onSelectProduct,
  onRefillSize,
  onCustomRefill,
  onQuantityChange,
  onContainerCountChange,
  onUpdate,
  onUploadArtwork
}: {
  service: ServiceType;
  form: OrderFormInput;
  catalog: PriceItem[];
  catalogLoading?: boolean;
  refillSize: number | "custom";
  customRefill: number;
  onSelectProduct: (sku: string) => void;
  onRefillSize: (size: number) => void;
  onCustomRefill: (litres: number) => void;
  onQuantityChange: (qty: number) => void;
  onContainerCountChange?: (count: number) => void;
  onUpdate?: <K extends keyof OrderFormInput>(key: K, value: OrderFormInput[K]) => void;
  onUploadArtwork?: (file: File) => Promise<void>;
}) {
  const [artworkName, setArtworkName] = useState("");
  const [artworkPreview, setArtworkPreview] = useState("");
  const [artworkError, setArtworkError] = useState("");
  const [isUploadingArtwork, setIsUploadingArtwork] = useState(false);

  useEffect(() => {
    return () => {
      if (artworkPreview) URL.revokeObjectURL(artworkPreview);
    };
  }, [artworkPreview]);

  if (catalogLoading && service !== "refill") {
    return <WizardProductGridSkeleton />;
  }

  const products = getProductsForService(service, catalog);
  const isIceInquiry = service === "ice" && !hasIceCatalogProduct(catalog);

  if (service === "refill") {
    const litresPerContainer = refillSize === "custom" ? customRefill : refillSize;

    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-[#061a4f]">Refill size per container</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {REFILL_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={`focus-ring h-12 rounded-2xl border text-sm font-bold transition-colors ${refillSize === size ? "border-primary bg-primary text-white" : "border-cyan-100 bg-white text-primary hover:border-primary/35 hover:bg-aqua/35"}`}
                onClick={() => onRefillSize(size)}
              >
                {size}L
              </button>
            ))}
            <button
              type="button"
              className={`focus-ring h-12 rounded-2xl border text-sm font-bold transition-colors ${refillSize === "custom" ? "border-primary bg-primary text-white" : "border-cyan-100 bg-white text-primary hover:border-primary/35 hover:bg-aqua/35"}`}
              onClick={() => onRefillSize(-1)}
            >
              Custom
            </button>
          </div>
        </div>
        {refillSize === "custom" ? (
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#061a4f]">Litres per container</span>
            <input
              className="focus-ring h-12 w-full rounded-2xl border border-cyan-100 bg-white px-4 text-sm"
              type="number"
              min="1"
              step="0.5"
              value={customRefill}
              onChange={(event) => onCustomRefill(Number(event.target.value))}
            />
          </label>
        ) : null}
        {onContainerCountChange ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-100 bg-aqua/35 p-4 sm:flex-row sm:justify-between">
            <span className="text-sm font-semibold text-primary">Number of containers</span>
            <QuantityStepper
              value={form.containerCount || 1}
              onChange={onContainerCountChange}
              min={1}
              max={20}
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between rounded-2xl bg-aqua/45 px-4 py-3">
          <span className="text-sm font-semibold text-primary">
            Total refill ({form.containerCount || 1} × {litresPerContainer}L)
          </span>
          <span className="text-lg font-black text-primary">{form.refillLitres}L</span>
        </div>
      </div>
    );
  }

  if (isIceInquiry) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4">
          <p className="text-sm font-bold text-primary">Contact for current pricing</p>
          <p className="mt-2 text-sm leading-6 text-primary/75">
            Ice prices vary by availability. Submit your request and we will confirm the price with you before delivery.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-100 bg-aqua/35 p-4 sm:flex-row sm:justify-between">
          <span className="text-sm font-semibold text-primary">How much ice do you need?</span>
          <QuantityStepper value={form.quantity || 1} onChange={onQuantityChange} />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return <WizardProductGridSkeleton />;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <SelectableTile
            key={product.sku}
            selected={form.productSku === product.sku}
            onClick={() => onSelectProduct(product.sku)}
          >
            <p className="font-bold text-[#061a4f]">{formatProductLabel(product)}</p>
            <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(product.price)}</p>
          </SelectableTile>
        ))}
      </div>
      {form.productSku && form.productSku !== "FWM-DESIGN-STICKER" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-100 bg-aqua/35 p-4 sm:flex-row sm:justify-between">
          <span className="text-sm font-semibold text-primary">Quantity</span>
          <QuantityStepper value={form.quantity || 1} onChange={onQuantityChange} />
        </div>
      ) : form.productSku === "FWM-DESIGN-STICKER" ? (
        <p className="text-sm text-primary/75">Sticker design is a one-time add-on. Quantity is 1.</p>
      ) : null}
      {service === "personalized" && onUpdate && onUploadArtwork ? (
        <PersonalizedDesignPanel
          form={form}
          artworkName={artworkName}
          artworkPreview={artworkPreview}
          artworkError={artworkError}
          isUploadingArtwork={isUploadingArtwork}
          onUpdate={onUpdate}
          onPickArtwork={async (file) => {
            setArtworkError("");

            const allowedTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
            if (!allowedTypes.includes(file.type)) {
              setArtworkError("Upload a PNG, JPG, WebP, or PDF file.");
              return;
            }

            if (file.size > 8 * 1024 * 1024) {
              setArtworkError("Artwork must be 8MB or smaller.");
              return;
            }

            if (artworkPreview) URL.revokeObjectURL(artworkPreview);
            setArtworkPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
            setArtworkName(file.name);
            setIsUploadingArtwork(true);

            try {
              await onUploadArtwork(file);
            } catch (error) {
              setArtworkError(error instanceof Error ? error.message : "Could not upload artwork.");
              setArtworkName("");
              setArtworkPreview("");
              onUpdate("artworkUrl", "");
            } finally {
              setIsUploadingArtwork(false);
            }
          }}
          onRemoveArtwork={() => {
            if (artworkPreview) URL.revokeObjectURL(artworkPreview);
            setArtworkName("");
            setArtworkPreview("");
            setArtworkError("");
            onUpdate("artworkUrl", "");
          }}
        />
      ) : null}
    </div>
  );
}

function PersonalizedDesignPanel({
  form,
  artworkName,
  artworkPreview,
  artworkError,
  isUploadingArtwork,
  onUpdate,
  onPickArtwork,
  onRemoveArtwork
}: {
  form: OrderFormInput;
  artworkName: string;
  artworkPreview: string;
  artworkError: string;
  isUploadingArtwork: boolean;
  onUpdate: <K extends keyof OrderFormInput>(key: K, value: OrderFormInput[K]) => void;
  onPickArtwork: (file: File) => void;
  onRemoveArtwork: () => void;
}) {
  const storedArtworkName = form.artworkUrl ? form.artworkUrl.split("/").pop() ?? "Artwork uploaded" : "";
  const displayName = artworkName || storedArtworkName;

  return (
    <div className="grid gap-4 rounded-2xl border border-cyan-100 bg-aqua/30 p-4">
      <div>
        <p className="text-sm font-bold text-[#061a4f]">Bottle design</p>
        <p className="mt-1 text-sm leading-6 text-primary/75">
          Add your logo, picture, or label artwork now, or leave notes for our team.
        </p>
      </div>

      <label className="focus-within:ring-ring grid cursor-pointer gap-3 rounded-2xl border border-dashed border-primary/35 bg-white p-4 transition-colors hover:bg-aqua/25 focus-within:ring-2 focus-within:ring-offset-2">
        <input
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          disabled={isUploadingArtwork}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onPickArtwork(file);
          }}
        />
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-aqua text-primary">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#061a4f]">
              {isUploadingArtwork ? "Uploading artwork..." : "Upload picture or design"}
            </span>
            <span className="mt-0.5 block text-xs font-semibold text-primary/70">PNG, JPG, WebP, or PDF up to 8MB</span>
          </span>
        </span>
      </label>

      {displayName || form.artworkUrl ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-white p-3 sm:flex-row sm:items-center">
          {artworkPreview ? (
            <span
              className="block h-20 w-full rounded-xl bg-cover bg-center sm:w-24"
              style={{ backgroundImage: `url(${artworkPreview})` }}
              aria-label="Artwork preview"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-aqua text-primary">
              {displayName.toLowerCase().endsWith(".pdf") ? <FileText className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#061a4f]">{displayName || "Artwork uploaded"}</p>
            <p className="mt-0.5 text-xs font-semibold text-primary/70">
              {isUploadingArtwork ? "Uploading..." : form.artworkUrl ? "Attached to this order" : "Ready to attach"}
            </p>
          </div>
          <button
            type="button"
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-white px-3 text-sm font-bold text-primary hover:bg-aqua/35"
            onClick={onRemoveArtwork}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        </div>
      ) : null}

      {artworkError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{artworkError}</p>
      ) : null}

      <label className="flex items-center gap-2 text-sm font-semibold text-[#061a4f]">
        <input
          type="checkbox"
          checked={form.stickerDesignRequired}
          onChange={(event) => onUpdate("stickerDesignRequired", event.target.checked)}
        />
        Need us to design the sticker
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="focus-ring h-11 w-full rounded-xl border border-cyan-100 bg-white px-3 text-sm placeholder:text-primary/55"
          placeholder="Branding text"
          value={form.brandingText}
          onChange={(event) => onUpdate("brandingText", event.target.value)}
        />
        <input
          className="focus-ring h-11 w-full rounded-xl border border-cyan-100 bg-white px-3 text-sm placeholder:text-primary/55"
          placeholder="Event name"
          value={form.eventName}
          onChange={(event) => onUpdate("eventName", event.target.value)}
        />
      </div>
      <textarea
        className="focus-ring min-h-24 w-full rounded-xl border border-cyan-100 bg-white p-3 text-sm placeholder:text-primary/55"
        placeholder="Design notes"
        value={form.designNotes}
        onChange={(event) => onUpdate("designNotes", event.target.value)}
      />
    </div>
  );
}

export function buildIceInquiryNotes(quantity: number) {
  return `${ICE_INQUIRY_NOTE_PREFIX} — ${quantity} unit(s). Pricing to be confirmed when we contact you.`;
}
