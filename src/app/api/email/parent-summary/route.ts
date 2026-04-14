import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { sendParentComm as sendParentCommDb } from "@/lib/db/students";
import { sendParentComm as sendParentCommMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

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

  const input = {
    session_id: body.session_id,
    student_id: body.student_id,
    parent_email: body.parent_email,
    subject: body.subject,
    body: body.body,
    sent_by: auth.user.id
  };

  const comm = isMockMode()
    ? sendParentCommMock(input)
    : await sendParentCommDb(createRouteClient(), input);

  return NextResponse.json({ comm, mockDelivered: isMockMode() });
}

