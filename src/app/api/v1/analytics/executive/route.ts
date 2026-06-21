import { NextResponse } from "next/server";
import { commandQueues, executiveKpis, operatingModules } from "@/config/operating-system";

export async function GET() {
  const modules = operatingModules.map((module) => ({
    name: module.name,
    metric: module.metric,
    signal: module.signal,
    status: module.status
  }));

  return NextResponse.json({
    data: {
      executiveKpis,
      commandQueues,
      modules
    }
  });
}
