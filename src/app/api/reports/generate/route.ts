import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import * as React from "react";

import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { PDFReportTemplate } from "@/components/reports/PDFReportTemplate";
import { isMockMode } from "@/lib/env";
import { getReportData as getReportDataDb } from "@/lib/db/reports";
import { getReportData as getReportDataMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAnyPermission("reports", ["read", "generate", "export_pdf"]);
  const auth = await requireAppUser();
  const body = (await request.json()) as {
    startDate?: string;
    endDate?: string;
    division?: string;
    mode?: "download" | "email";
  };

  const filters = {
    startDate: body.startDate,
    endDate: body.endDate,
    division: body.division && body.division !== "all" ? body.division : undefined
  };
  const report = isMockMode()
    ? getReportDataMock(filters)
    : await getReportDataDb(createRouteClient(), filters);

  if (body.mode === "email") {
    return NextResponse.json({
      emailed: true,
      mockDelivered: true,
      recipient: auth.user.email
    });
  }

  const document = React.createElement(PDFReportTemplate, {
    report,
    label: `${body.startDate ?? "start"} to ${body.endDate ?? "end"}`
  }) as React.ReactElement;
  const buffer = await renderToBuffer(document);
  const pdfBytes = new Uint8Array(buffer);

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="restorative-tarbiyah-report.pdf"'
    }
  });
}
