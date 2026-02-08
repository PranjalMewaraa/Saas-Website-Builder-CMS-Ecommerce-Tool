import { getOrderByNumber } from "@acme/db-mongo";

type Props = {
  tenantId: string;
  siteId: string;
  contentWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  orderPathPrefix?: string;
  path?: string;
};

function clampBasePath(base?: string) {
  const raw = (base || "/orders").trim() || "/orders";
  if (raw === "/") return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function slugFromPath(path: string, basePath: string) {
  const base = basePath || "/orders";
  if (!path.startsWith(base)) return "";
  const rest = path.slice(base.length).replace(/^\/+/, "");
  return rest || "";
}

export default async function OrderDetailV1({
  tenantId,
  siteId,
  contentWidth = "lg",
  orderPathPrefix = "/orders",
  path: propPath,
}: Props) {
  const basePath = clampBasePath(orderPathPrefix);
  const path = propPath || "/";
  const orderNumber = slugFromPath(path, basePath || "/orders");

  if (!orderNumber) {
    return (
      <section className="py-10">
        <div className="mx-auto px-4 max-w-3xl">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <div className="text-base font-medium text-slate-700">
              Order page is missing an order number
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Use a URL like {basePath || "/orders"}/ORD-1234
            </div>
          </div>
        </div>
      </section>
    );
  }

  const order = await getOrderByNumber(tenantId, siteId, orderNumber);

  if (!order) {
    return (
      <section className="py-10">
        <div className="mx-auto px-4 max-w-3xl">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <div className="text-base font-medium text-slate-700">
              Order not found
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Check your order number and try again.
            </div>
          </div>
        </div>
      </section>
    );
  }

  const maxWidthClass =
    {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    }[contentWidth] || "max-w-6xl";

  return (
    <section className="py-10">
      <div className={`mx-auto px-4 ${maxWidthClass}`}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {order.order_number}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                Status: {order.status}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              ${(order.total_cents / 100).toFixed(2)}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5 space-y-3">
            {(order.items || []).map((item: any, idx: number) => (
              <div
                key={`${item.product_id}-${idx}`}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">Qty {item.qty}</div>
                </div>
                <div className="font-medium text-slate-900">
                  ${((item.price_cents || 0) / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
