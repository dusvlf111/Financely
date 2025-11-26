import { loadFinancialEducatorPrompt } from "@/lib/ai/promptLoader";
import { consumeRateLimit } from "@/lib/ai/rateLimiter";
import { NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 400;
const MODEL_NAME = "gpt-5-nano";
const OPENAI_ENDPOINT =
  process.env.GPT5_NANO_API_URL ?? "https://api.openai.com/v1/responses";

type AssistantRequestPayload = {
  message?: string;
  previousResponseId?: string;
};

type ResponseContentBlock = {
  type?: string;
  text?: string;
};

type OpenAIResponsesPayload = {
  id?: string;
  output?: Array<{
    type?: string;
    role?: string;
    content?: ResponseContentBlock[];
  }>;
};

function unauthorizedResponse() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "로그인이 필요한 기능입니다." } },
    { status: 401 }
  );
}

function invalidPayloadResponse(message: string) {
  return NextResponse.json(
    { error: { code: "INVALID_PAYLOAD", message } },
    { status: 400 }
  );
}

function rateLimitedResponse(retryAfterMs: number) {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message:
          "1시간 내 최대 10개의 질문만 가능합니다. 잠시 후 다시 시도해주세요.",
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  );
}

function serverErrorResponse(message = "AI 응답을 생성하지 못했습니다.") {
  return NextResponse.json(
    { error: { code: "AI_REQUEST_FAILED", message } },
    { status: 502 }
  );
}

async function readPayload(
  request: Request
): Promise<AssistantRequestPayload | null> {
  try {
    return (await request.json()) as AssistantRequestPayload;
  } catch {
    return null;
  }
}

function extractResponseText(payload: OpenAIResponsesPayload) {
  const messageBlock = payload.output?.find(
    (block) => block.type === "message" && block.role === "assistant"
  );

  if (!messageBlock) {
    return null;
  }

  const text = messageBlock.content
    ?.map((block) => block.text ?? "")
    .join("")
    .trim();

  return text ?? null;
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return unauthorizedResponse();
  }

  const payload = await readPayload(request);
  if (!payload || typeof payload.message !== "string") {
    return invalidPayloadResponse(
      "message 필드를 포함한 JSON 본문이 필요합니다."
    );
  }

  let previousResponseId: string | undefined;
  if (payload.previousResponseId !== undefined) {
    if (typeof payload.previousResponseId !== "string") {
      return invalidPayloadResponse(
        "previousResponseId 필드가 올바르지 않습니다."
      );
    }
    const trimmedId = payload.previousResponseId.trim();
    if (!trimmedId) {
      return invalidPayloadResponse(
        "previousResponseId 필드를 비울 수 없습니다."
      );
    }
    previousResponseId = trimmedId;
  }

  const trimmedMessage = payload.message.trim();
  if (!trimmedMessage) {
    return invalidPayloadResponse("메시지를 입력해주세요.");
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return invalidPayloadResponse("메시지는 400자 이하여야 합니다.");
  }

  const rateResult = consumeRateLimit(userId);
  if (!rateResult.allowed) {
    return rateLimitedResponse(rateResult.retryAfterMs ?? 60 * 60);
  }

  const apiKey = process.env.GPT5_NANO_API_KEY;
  if (!apiKey) {
    console.error("Missing GPT5_NANO_API_KEY environment variable");
    return serverErrorResponse("AI 구성이 완료되지 않았습니다.");
  }

  try {
    const prompt = await loadFinancialEducatorPrompt();

    const openAiResponse = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        input: trimmedMessage,
        instructions: prompt,
        previous_response_id: previousResponseId,
        max_output_tokens: 2048,
        reasoning: {
          effort: "minimal",
        },
        text: {
          verbosity: "low",
        },
      }),
    });

    if (!openAiResponse.ok) {
      console.error("OpenAI request failed", await openAiResponse.text());
      return serverErrorResponse("AI 응답 요청이 실패했습니다.");
    }

    const completion = (await openAiResponse.json()) as OpenAIResponsesPayload;
    const reply = extractResponseText(completion);

    if (!reply) {
      return serverErrorResponse();
    }

    const truncatedReply = reply.slice(0, MAX_MESSAGE_LENGTH);
    const responseId = completion.id ?? null;

    return NextResponse.json({
      data: { reply: truncatedReply, responseId },
    });
  } catch (error) {
    console.error("Failed to load AI response", error);
    return serverErrorResponse();
  }
}
