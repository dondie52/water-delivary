import { ProductsDashboard } from "@/components/admin/products-dashboard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function ProductsPage() {
  return <ProductsDashboard />;
}
