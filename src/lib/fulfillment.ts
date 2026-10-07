export type FulfillmentStatus = "received" | "printing" | "shipped" | "delivered";

const transitions: Record<FulfillmentStatus, FulfillmentStatus> = {
  received: "printing",
  printing: "shipped",
  shipped: "delivered",
  delivered: "delivered",
};

/** Mock print partner adapter; deterministic order IDs make local demos easy to follow. */
export function createMockFulfillment(orderNumber: string) {
  return {
    provider: "threadform-mock",
    externalId: `mock_${orderNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    status: "received" as FulfillmentStatus,
    trackingNumber: `TF${Date.now().toString().slice(-9)}US`,
    estimatedShipDays: 3,
    nextStatus: transitions.received,
  };
}

export function nextFulfillmentStatus(status: string): FulfillmentStatus {
  const current = status in transitions ? (status as FulfillmentStatus) : "received";
  return transitions[current];
}
