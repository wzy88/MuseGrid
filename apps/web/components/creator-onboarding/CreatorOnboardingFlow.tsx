"use client";

import type { CapabilityDirection } from "@musegrid/core";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarPreviewStep } from "./AvatarPreviewStep";
import { CalibrationStep } from "./CalibrationStep";
import { CreatorDirectionStep } from "./CreatorDirectionStep";
import { CreatorProfileStep } from "./CreatorProfileStep";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { ProgressTrack } from "../ui/ProgressTrack";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type CreatorOnboardingState = {
  capabilityDirection: CapabilityDirection | "";
  profile: {
    displayName: string;
    tagline: string;
    styleTags: string;
    experience: string;
    caseDescription: string;
  };
  calibration: {
    creativeApproach: string;
    correctionMethod: string;
    boundaries: string;
  };
};

const initialState: CreatorOnboardingState = {
  capabilityDirection: "",
  profile: {
    displayName: "",
    tagline: "",
    styleTags: "",
    experience: "",
    caseDescription: "",
  },
  calibration: {
    creativeApproach: "",
    correctionMethod: "",
    boundaries: "",
  },
};

const steps = [
  { key: "direction", label: "选择方向" },
  { key: "profile", label: "填写档案" },
  { key: "calibration", label: "回答校准" },
  { key: "preview", label: "预览分身" },
] as const;

const directionLabelMap: Record<CapabilityDirection, string> = {
  lyrics: "作词",
  composition: "作曲",
  arrangement: "编曲",
  voice: "选声",
  production: "制作",
};

export function CreatorOnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [formState, setFormState] = useState<CreatorOnboardingState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const directionLabel = formState.capabilityDirection
    ? directionLabelMap[formState.capabilityDirection]
    : "待选择";

  const isCurrentStepValid = useMemo(() => {
    if (stepIndex === 0) {
      return formState.capabilityDirection !== "";
    }

    if (stepIndex === 1) {
      return (
        formState.profile.displayName.trim() !== "" &&
        formState.profile.tagline.trim() !== "" &&
        formState.profile.styleTags.trim() !== "" &&
        formState.profile.experience.trim() !== "" &&
        formState.profile.caseDescription.trim() !== ""
      );
    }

    if (stepIndex === 2) {
      return (
        formState.calibration.creativeApproach.trim() !== "" &&
        formState.calibration.correctionMethod.trim() !== "" &&
        formState.calibration.boundaries.trim() !== ""
      );
    }

    return true;
  }, [formState, stepIndex]);

  function updateProfile(field: keyof CreatorOnboardingState["profile"], value: string) {
    setFormState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      },
    }));
  }

  function updateCalibration(field: keyof CreatorOnboardingState["calibration"], value: string) {
    setFormState((current) => ({
      ...current,
      calibration: {
        ...current.calibration,
        [field]: value,
      },
    }));
  }

  function goNext() {
    if (!isCurrentStepValid) {
      setError("请先补全当前步骤，再继续。");
      return;
    }

    setError("");
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setError("");
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function submitApplication() {
    if (!isCurrentStepValid || !formState.capabilityDirection) {
      setError("请先完成前面的步骤。");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/creator-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilityDirection: formState.capabilityDirection,
          profileData: formState.profile,
          workSamples: [
            {
              title: "初始案例",
              description: formState.profile.caseDescription,
            },
          ],
          questionnaireAnswers: formState.calibration,
        }),
      });

      const payload = await parseCreatorOnboardingResponse(response);

      if (!response.ok || !("ok" in payload) || !payload.ok || !payload.data.dashboardUrl) {
        setError(getApiErrorMessage(payload, "申请提交失败，请稍后再试。"));
        setIsSubmitting(false);
        return;
      }

      router.push(payload.data.dashboardUrl);
      router.refresh();
    } catch {
      setError("申请提交失败，请检查网络后重试。");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="creatorOnboardingPage">
      <Panel className="creatorOnboardingHero" tone="hero">
        <div>
          <p className="eyebrow">Creator Avatar</p>
          <h2>把你的方法论变成可持续成长的创作人分身</h2>
          <p>先完成首轮建档，系统会创建一个待审核的 Level 1 创作人分身，后续再通过作品样本、校准问题和协作反馈不断进化。</p>
        </div>
      </Panel>

      <Panel className="creatorOnboardingPanel" aria-labelledby="creator-onboarding-title">
        <div className="creatorOnboardingHeader">
          <div>
            <h3 id="creator-onboarding-title">成为创作人</h3>
            <p>当前方向：{directionLabel}</p>
          </div>
          <span className="creatorProgressText">
            {stepIndex + 1} / {steps.length}
          </span>
        </div>

        <ProgressTrack
          ariaLabel="创建分身进度"
          steps={steps.map((step, index) => ({
            id: step.key,
            label: step.label,
            statusLabel: index === stepIndex ? "当前" : index < stepIndex ? "已完成" : "待开始",
            state: index === stepIndex ? "active" : index < stepIndex ? "complete" : "upcoming",
          }))}
        />

        <form className="creatorOnboardingForm" onSubmit={(event) => event.preventDefault()}>
          {stepIndex === 0 ? (
            <CreatorDirectionStep
              value={formState.capabilityDirection}
              onChange={(value) => setFormState((current) => ({ ...current, capabilityDirection: value }))}
            />
          ) : null}

          {stepIndex === 1 ? <CreatorProfileStep onChange={updateProfile} value={formState.profile} /> : null}

          {stepIndex === 2 ? (
            <CalibrationStep onChange={updateCalibration} value={formState.calibration} />
          ) : null}

          {stepIndex === 3 ? (
            <AvatarPreviewStep
              value={{
                displayName: formState.profile.displayName,
                tagline: formState.profile.tagline,
                styleTags: formState.profile.styleTags,
                caseDescription: formState.profile.caseDescription,
                directionLabel,
              }}
            />
          ) : null}

          {error ? <p className="formError">{error}</p> : null}

          <div className="creatorFormActions">
            <Button onClick={goBack} type="button" variant="secondary">
              上一步
            </Button>
            {stepIndex < steps.length - 1 ? (
              <Button className="primary" onClick={goNext} type="button">
                下一步
              </Button>
            ) : (
              <Button
                className="primary"
                onClick={() => {
                  void submitApplication();
                }}
                type="button"
                loading={isSubmitting}
              >
                {isSubmitting ? "提交中..." : "提交申请"}
              </Button>
            )}
          </div>
        </form>
      </Panel>
    </main>
  );
}

function getApiErrorMessage(payload: ApiSuccess<unknown> | ApiFailure | { error: string }, fallback: string) {
  if ("ok" in payload && payload.ok === false) {
    return payload.error.message;
  }
  if ("error" in payload) {
    return payload.error;
  }
  return fallback;
}

async function parseCreatorOnboardingResponse(
  response: Response,
): Promise<ApiSuccess<{ dashboardUrl?: string }> | ApiFailure | { error: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      error:
        response.status === 401
          ? "登录状态已失效，请重新登录后再提交申请。"
          : "申请提交失败，服务返回了无法识别的响应。",
    };
  }

  try {
    return (await response.json()) as ApiSuccess<{ dashboardUrl?: string }> | ApiFailure;
  } catch {
    return { error: "申请提交失败，服务响应无法解析。" };
  }
}
