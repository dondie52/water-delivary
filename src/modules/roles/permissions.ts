export type Role =
  | "super_admin"
  | "operations_manager"
  | "dispatcher"
  | "driver"
  | "inventory_manager"
  | "production_manager"
  | "sales"
  | "finance"
  | "support"
  | "franchise_owner"
  | "corporate_buyer"
  | "corporate_finance"
  | "customer";

export type Permission =
  | "orders:read"
  | "orders:write"
  | "delivery:dispatch"
  | "inventory:write"
  | "production:write"
  | "crm:write"
  | "finance:write"
  | "analytics:read"
  | "admin:write";

export const rolePermissions: Record<Role, Permission[]> = {
  super_admin: ["orders:read", "orders:write", "delivery:dispatch", "inventory:write", "production:write", "crm:write", "finance:write", "analytics:read", "admin:write"],
  operations_manager: ["orders:read", "orders:write", "delivery:dispatch", "inventory:write", "production:write", "analytics:read"],
  dispatcher: ["orders:read", "delivery:dispatch"],
  driver: ["orders:read"],
  inventory_manager: ["inventory:write", "analytics:read"],
  production_manager: ["production:write", "orders:read"],
  sales: ["orders:read", "orders:write", "crm:write", "analytics:read"],
  finance: ["orders:read", "finance:write", "analytics:read"],
  support: ["orders:read", "crm:write"],
  franchise_owner: ["orders:read", "orders:write", "delivery:dispatch", "inventory:write", "analytics:read"],
  corporate_buyer: ["orders:read", "orders:write"],
  corporate_finance: ["orders:read", "finance:write"],
  customer: ["orders:read", "orders:write"]
};

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
