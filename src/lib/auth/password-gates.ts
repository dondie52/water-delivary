import type { NextRequest } from "next/server";

export type GateRole = "admin" | "driver";

export const passwordGateConfig: Record<GateRole, {
  cookieName: string;
  envName: "ADMIN_PASSWORD" | "DRIVER_PASSWORD";
  loginPath: string;
  protectedPrefix: string;
}> = {
  admin: {
    cookieName: "fwm_admin",
    envName: "ADMIN_PASSWORD",
    loginPath: "/staff/login",
    protectedPrefix: "/admin"
  },
  driver: {
    cookieName: "fwm_driver",
    envName: "DRIVER_PASSWORD",
    loginPath: "/staff/login",
    protectedPrefix: "/driver"
  }
};

export function getRolePassword(role: GateRole) {
  return process.env[passwordGateConfig[role].envName];
}

export function isRoleAuthenticated(request: NextRequest, role: GateRole) {
  const configuredPassword = getRolePassword(role);

  if (!configuredPassword) {
    return true;
  }

  return request.cookies.get(passwordGateConfig[role].cookieName)?.value === configuredPassword;
}
