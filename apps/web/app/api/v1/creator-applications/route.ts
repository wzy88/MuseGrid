import type { CapabilityDirection } from "@musegrid/core";
import { NextResponse } from "next/server";
import { getApiUser } from "../../../../lib/auth/session";
import { submitCreatorApplicationWithAvatar, type CreatorApplicationInput } from "../../../../lib/repositories/creator-applications";

type CreatorApplicationRequest = Partial<{
  capabilityDirection: CapabilityDirection;
  profileData: {
    displayName?: string;
    tagline?: string;
    styleTags?: string;
    experience?: string;
    caseDescription?: string;
  };
  workSamples: Array<{
    title?: string;
    description?: string;
  }>;
  questionnaireAnswers: {
    creativeApproach?: string;
    correctionMethod?: string;
    boundaries?: string;
  };
}>;

const validDirections: CapabilityDirection[] = ["lyrics", "composition", "arrangement", "production"];

function toTagList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeRequest(body: CreatorApplicationRequest): CreatorApplicationRequest {
  return {
    capabilityDirection: body.capabilityDirection,
    profileData: {
      displayName: body.profileData?.displayName?.trim() ?? "",
      tagline: body.profileData?.tagline?.trim() ?? "",
      styleTags: body.profileData?.styleTags?.trim() ?? "",
      experience: body.profileData?.experience?.trim() ?? "",
      caseDescription: body.profileData?.caseDescription?.trim() ?? "",
    },
    workSamples: Array.isArray(body.workSamples)
      ? body.workSamples.map((sample) => ({
          title: sample.title?.trim() ?? "",
          description: sample.description?.trim() ?? "",
        }))
      : [],
    questionnaireAnswers: {
      creativeApproach: body.questionnaireAnswers?.creativeApproach?.trim() ?? "",
      correctionMethod: body.questionnaireAnswers?.correctionMethod?.trim() ?? "",
      boundaries: body.questionnaireAnswers?.boundaries?.trim() ?? "",
    },
  };
}

function validateRequest(body: CreatorApplicationRequest) {
  if (!body.capabilityDirection || !validDirections.includes(body.capabilityDirection)) {
    return "请先选择你的创作方向。";
  }

  if (
    !body.profileData?.displayName ||
    !body.profileData.tagline ||
    !body.profileData.styleTags ||
    !body.profileData.experience ||
    !body.profileData.caseDescription
  ) {
    return "请补全创作人档案信息。";
  }

  if (
    !body.questionnaireAnswers?.creativeApproach ||
    !body.questionnaireAnswers.correctionMethod ||
    !body.questionnaireAnswers.boundaries
  ) {
    return "请完成分身校准问题。";
  }

  if (!body.workSamples || body.workSamples.length === 0 || !body.workSamples[0]?.description) {
    return "请至少填写一个案例描述。";
  }

  return null;
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后再提交创作人申请。" }, { status: 401 });
  }

  let body: CreatorApplicationRequest;
  try {
    body = normalizeRequest((await request.json()) as CreatorApplicationRequest);
  } catch {
    return NextResponse.json({ error: "请求内容不是有效的 JSON。" }, { status: 400 });
  }

  const validationError = validateRequest(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const direction = body.capabilityDirection as CapabilityDirection;
  const creatorInput: CreatorApplicationInput = {
    capabilityDirection: direction,
    profileData: body.profileData ?? {},
    workSamples: body.workSamples ?? [],
    questionnaireAnswers: body.questionnaireAnswers ?? {},
  };

  const result = await submitCreatorApplicationWithAvatar(user.id, creatorInput, {
    avatarName: body.profileData?.displayName ?? "待命名创作人分身",
    capabilityDirection: direction,
    intro: body.profileData?.tagline ?? "等待进一步校准。",
    styleTags: toTagList(body.profileData?.styleTags),
    sampleOutputs: (body.workSamples ?? []).map((sample) => ({
      title: sample.title || "初始案例",
      excerpt: sample.description || "",
    })),
  });

  return NextResponse.json({
    applicationId: result.application.id,
    avatarId: result.avatar.id,
    dashboardUrl: "/avatar-dashboard",
  });
}
