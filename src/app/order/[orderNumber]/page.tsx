import { OrderReceipt } from "@/components/order/order-receipt";

export default async function OrderReceiptPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <OrderReceipt orderNumber={orderNumber} />;
}
