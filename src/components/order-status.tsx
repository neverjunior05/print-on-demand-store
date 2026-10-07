"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

const steps = [
  { id: "received", label: "Order received", note: "Your idea is in good hands.", icon: "check" as const },
  { id: "printing", label: "On the press", note: "Your design is becoming a thing.", icon: "shirt" as const },
  { id: "shipped", label: "On its way", note: "A little something is headed your way.", icon: "truck" as const },
  { id: "delivered", label: "Delivered", note: "Go make somebody's day.", icon: "box" as const },
];

export function OrderStatus({ orderId, initialStatus = "received" }: { orderId?: string; initialStatus?: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState("");
  const currentIndex = steps.findIndex((step) => step.id === status);
  useEffect(() => {
    if (!orderId || typeof EventSource === "undefined") return;
    const stream = new EventSource(`/api/orders/${orderId}/stream`);
    stream.addEventListener("status", (event) => {
      const data = JSON.parse((event as MessageEvent<string>).data) as { status?: string; trackingNumber?: string };
      if (data.status) setStatus(data.status);
      if (data.trackingNumber) setTracking(data.trackingNumber);
    });
    stream.onerror = () => stream.close();
    return () => stream.close();
  }, [orderId]);
  return <div className="order-status-component"><div className="order-status-top"><span className="eyebrow">YOUR ORDER, IN REAL LIFE</span>{tracking && <span className="tracking-pill">TRACKING · {tracking}</span>}</div><div className="status-timeline">{steps.map((step, index) => <div className={`status-step ${index < currentIndex ? "status-complete" : index === currentIndex ? "status-current" : ""}`} key={step.id}><div className="status-rail"><span className="status-icon"><Icon name={step.icon} size={17} /></span>{index < steps.length - 1 && <span className="status-connector" />}</div><div className="status-copy"><strong>{step.label}</strong><small>{step.note}</small></div><span className="status-state-label">{index < currentIndex ? "DONE" : index === currentIndex ? "NOW" : "UP NEXT"}</span></div>)}</div><p className="status-live-note"><span className="status-live-dot" /> Status updates as your order moves through the print shop.</p></div>;
}
