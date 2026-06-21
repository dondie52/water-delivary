import { CustomerOrder } from "@/modules/orders/customer-order";

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function summarizeDailyOperations(orders: CustomerOrder[]) {
  const today = getTodayKey();
  const todaysOrders = orders.filter((order) => order.requestedFulfillmentDate === today);
  const byDeliverySlot = groupCount(todaysOrders.filter((order) => order.fulfillmentType === "delivery"), "deliverySlot");
  const byPickupLocation = groupCount(todaysOrders.filter((order) => order.fulfillmentType === "pickup"), "pickupLocation");
  const needingPayment = todaysOrders.filter((order) => order.balanceDue > 0 || order.paymentStatus !== "paid");
  const readyForDelivery = todaysOrders.filter((order) => order.fulfillmentType === "delivery" && ["confirmed", "preparing", "out_for_delivery"].includes(order.status));
  const completed = todaysOrders.filter((order) => order.status === "completed");
  const revenueCollected = todaysOrders.reduce((sum, order) => sum + order.amountPaid, 0);

  return {
    todaysOrders,
    byDeliverySlot,
    byPickupLocation,
    needingPayment,
    readyForDelivery,
    completed,
    revenueCollected
  };
}

function groupCount(orders: CustomerOrder[], key: "deliverySlot" | "pickupLocation") {
  return orders.reduce<Record<string, number>>((groups, order) => {
    const groupKey = order[key] ?? "Unassigned";
    groups[groupKey] = (groups[groupKey] ?? 0) + 1;
    return groups;
  }, {});
}
