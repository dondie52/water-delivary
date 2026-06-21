import { Activity, BarChart3, Boxes, Building2, Car, CreditCard, Megaphone, PackageCheck, Repeat2, ShieldCheck, Sparkles, Users } from "lucide-react";

export const operatingModules = [
  { name: "Customers", icon: Users, metric: "18,420", signal: "+12.4% monthly growth", status: "Retention focus" },
  { name: "Orders", icon: PackageCheck, metric: "1,286", signal: "94% confirmed under 3 min", status: "Live queue" },
  { name: "Delivery", icon: Car, metric: "312", signal: "87% on-time slot adherence", status: "Capacity watch" },
  { name: "Inventory", icon: Boxes, metric: "9", signal: "Low-stock alerts across bottles and labels", status: "Action needed" },
  { name: "CRM", icon: Activity, metric: "74", signal: "Corporate leads in pipeline", status: "Follow-ups due" },
  { name: "Marketing", icon: Megaphone, metric: "6", signal: "Referral and WhatsApp campaigns active", status: "Growing" },
  { name: "Finance", icon: CreditCard, metric: "P428k", signal: "Monthly recurring corporate revenue", status: "Receivables clean" },
  { name: "Corporate", icon: Building2, metric: "39", signal: "Managed accounts with monthly invoicing", status: "Expansion ready" },
  { name: "Analytics", icon: BarChart3, metric: "14", signal: "Executive KPIs refreshed today", status: "Healthy" },
  { name: "AI Ops", icon: Sparkles, metric: "22%", signal: "Forecasted refill demand lift this week", status: "Review" },
  { name: "Automation", icon: Repeat2, metric: "8,910", signal: "Messages and reminders sent this month", status: "Running" },
  { name: "Security", icon: ShieldCheck, metric: "13", signal: "Role policies mapped to RLS", status: "Controlled" }
];

export const executiveKpis = [
  { label: "Revenue Today", value: "P42,860", detail: "+18% vs last Saturday" },
  { label: "Gross Margin", value: "41.8%", detail: "Bottled and refill blended" },
  { label: "Orders in Flight", value: "186", detail: "64 delivery, 82 pickup, 40 production" },
  { label: "Churn Risk", value: "3.2%", detail: "AI follow-up queue generated" }
];

export const commandQueues = [
  { label: "Orders awaiting confirmation", count: 18, priority: "high" },
  { label: "Branded jobs awaiting artwork approval", count: 11, priority: "medium" },
  { label: "Deliveries needing dispatcher assignment", count: 27, priority: "high" },
  { label: "Inventory items below reorder point", count: 9, priority: "high" },
  { label: "Corporate invoices due within 7 days", count: 16, priority: "medium" },
  { label: "Dorm refill reminders ready to send", count: 240, priority: "low" }
];
