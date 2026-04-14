import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import * as React from "react";

import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { PDFReportTemplate } from "@/components/reports/PDFReportTemplate";
import { getReportData } from "@/lib/mock/store";

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

  const report = getReportData({
    startDate: body.startDate,
    endDate: body.endDate,
    division: body.division && body.division !== "all" ? body.division : undefined
  });

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
