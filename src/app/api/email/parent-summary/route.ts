import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { sendParentComm } from "@/lib/mock/store";

export async function POST(request: Request) {
  const auth = await requireAppUser();
  const body = (await request.json()) as {
    session_id?: string;
    student_id?: string;
    parent_email?: string;
    subject?: string;
    body?: string;
  };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can send parent communication." }, { status: 403 });
  }

  if (!body.session_id || !body.student_id || !body.parent_email || !body.subject || !body.body) {
    return NextResponse.json({ error: "Missing required communication fields." }, { status: 400 });
  }

  const comm = sendParentComm({
    session_id: body.session_id,
    student_id: body.student_id,
    parent_email: body.parent_email,
    subject: body.subject,
    body: body.body,
    sent_by: auth.user.id
  });

  return NextResponse.json({ comm, mockDelivered: true });
}

