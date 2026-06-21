export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "in_production"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export const orderWorkflow: Record<OrderStatus, OrderStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["confirmed", "cancelled"],
  confirmed: ["in_production", "ready_for_dispatch", "ready_for_pickup", "cancelled"],
  in_production: ["ready_for_dispatch", "ready_for_pickup", "cancelled"],
  ready_for_dispatch: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  ready_for_pickup: ["completed"],
  delivered: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  refunded: []
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return orderWorkflow[from].includes(to);
}
