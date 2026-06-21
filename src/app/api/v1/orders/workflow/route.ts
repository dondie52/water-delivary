import { NextResponse } from "next/server";
import { orderWorkflow } from "@/modules/orders/workflow";

export async function GET() {
  return NextResponse.json({
    data: orderWorkflow
  });
}
