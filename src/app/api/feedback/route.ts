import { supabaseServerClient } from "@/lib/supabase/serverClient";
import { NextResponse } from "next/server";

const CATEGORY_VALUES = new Set(["bug", "ux", "improvement", "other"]);
const SEVERITY_VALUES = new Set(["blocker", "major", "minor", "suggestion"]);

function invalid(message: string) {
  return NextResponse.json(
    { error: { code: "INVALID_PAYLOAD", message } },
    { status: 400 }
  );
}

function serverError(message = "피드백을 저장하지 못했습니다.") {
  return NextResponse.json(
    { error: { code: "SERVER_ERROR", message } },
    { status: 500 }
  );
}

type FeedbackPayload = {
  category?: string;
  severity?: string;
  summary?: string;
  description?: string;
  reproductionSteps?: string | null;
  contactEmail?: string | null;
  allowFollowUp?: boolean;
  deviceInfo?: Record<string, unknown> | null;
  route?: string | null;
  appVersion?: string | null;
  isGuest?: boolean;
  userContext?: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  if (!supabaseServerClient) {
    return serverError("Supabase 구성이 완료되지 않았습니다.");
  }

  const payload = (await request
    .json()
    .catch(() => null)) as FeedbackPayload | null;

  if (!payload) {
    return invalid("JSON 본문이 필요합니다.");
  }

  const { category, severity, summary, description } = payload;

  if (!category || !CATEGORY_VALUES.has(category)) {
    return invalid("지원하지 않는 피드백 유형입니다.");
  }

  if (!severity || !SEVERITY_VALUES.has(severity)) {
    return invalid("지원하지 않는 영향도입니다.");
  }

  const trimmedSummary = summary?.trim();
  if (!trimmedSummary) {
    return invalid("제목을 입력해주세요.");
  }

  if (trimmedSummary.length > 200) {
    return invalid("제목은 200자 이하여야 합니다.");
  }

  const trimmedDescription = description?.trim();

  if (trimmedDescription && trimmedDescription.length > 5000) {
    return invalid("상세 내용은 5000자 이하여야 합니다.");
  }

  const contactEmail = payload.contactEmail?.trim() || null;
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return invalid("올바른 이메일 형식이 아닙니다.");
  }

  const userId = request.headers.get("x-user-id");

  const record = {
    user_id: userId ?? null,
    is_guest: Boolean(payload.isGuest),
    category,
    severity,
    summary: trimmedSummary,
    description: trimmedDescription,
    reproduction_steps: payload.reproductionSteps?.trim() || null,
    contact_email: contactEmail,
    allow_follow_up: Boolean(payload.allowFollowUp),
    device_info: payload.deviceInfo ?? {},
    route: payload.route ?? null,
    app_version: payload.appVersion ?? "demo",
    user_agent: request.headers.get("user-agent") ?? null,
    user_context: payload.userContext ?? null,
    status: "new",
  };

  try {
    const { data, error } = await supabaseServerClient
      .from("feedback_reports")
      .insert(record)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to store feedback", error);
      return serverError();
    }

    return NextResponse.json({ data: { id: data?.id } });
  } catch (error) {
    console.error("Unexpected feedback insert error", error);
    return serverError();
  }
}
