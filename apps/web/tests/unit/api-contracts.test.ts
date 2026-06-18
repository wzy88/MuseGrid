import { beforeEach, describe, expect, it, vi } from "vitest";

const authSessionMock = vi.hoisted(() => ({
  clearSessionCookie: vi.fn(),
  getApiUser: vi.fn(),
  setSessionCookie: vi.fn(),
}));

const passwordMock = vi.hoisted(() => ({
  hashPassword: vi.fn(async (password: string) => `hashed:${password}`),
  verifyPassword: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  prisma: {
    generationJob: {
      update: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const projectRepoMock = vi.hoisted(() => ({
  createProject: vi.fn(),
  getProject: vi.fn(),
  listProjectGenerations: vi.fn(),
  listProjects: vi.fn(),
  selectProjectStepAvatar: vi.fn(),
}));

const stepGeneratorMock = vi.hoisted(() => ({
  buildMiniMaxInputForProject: vi.fn(),
  confirmStepOutput: vi.fn(),
  generateStepOutput: vi.fn(),
}));

const minimaxClientMock = vi.hoisted(() => ({
  generateMusicDemo: vi.fn(),
}));

const minimaxStorageMock = vi.hoisted(() => ({
  getSampleAudioAsset: vi.fn(),
  persistHexAudioAsMp3: vi.fn(),
}));

const creatorApplicationsMock = vi.hoisted(() => ({
  submitCreatorApplicationWithAvatar: vi.fn(),
}));

vi.mock("../../lib/auth/session", () => authSessionMock);
vi.mock("../../lib/auth/password", () => passwordMock);
vi.mock("../../lib/db/prisma", () => prismaMock);
vi.mock("../../lib/repositories/projects", () => projectRepoMock);
vi.mock("../../lib/server/step-generator", () => stepGeneratorMock);
vi.mock("../../lib/minimax/client", () => minimaxClientMock);
vi.mock("../../lib/minimax/audio-storage", () => minimaxStorageMock);
vi.mock("../../lib/repositories/creator-applications", () => creatorApplicationsMock);

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

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

function expectSuccessEnvelope<T>(payload: ApiSuccess<T>) {
  expect(payload.ok).toBe(true);
  expect(payload).toHaveProperty("data");
}

function expectFailureEnvelope(payload: ApiFailure) {
  expect(payload.ok).toBe(false);
  expect(payload.error).toEqual({
    code: expect.any(String),
    message: expect.any(String),
  });
}

describe("/api/v1 contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the stable envelope for auth routes", async () => {
    const loginRoute = await import("../../app/api/v1/auth/login/route");
    const registerRoute = await import("../../app/api/v1/auth/register/route");
    const logoutRoute = await import("../../app/api/v1/auth/logout/route");

    const missingLogin = await loginRoute.POST(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "", password: "" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(missingLogin.status).toBe(400);
    expectFailureEnvelope(await readJson<ApiFailure>(missingLogin));

    passwordMock.verifyPassword.mockResolvedValue(true);
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "creator@musegrid.local",
      name: "Creator",
      role: "creator",
      passwordHash: "stored-hash",
    });
    const validLogin = await loginRoute.POST(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "creator@musegrid.local", password: "pass-123456" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(validLogin.status).toBe(200);
    const loginPayload = await readJson<ApiSuccess<{ user: { id: string } }>>(validLogin);
    expectSuccessEnvelope(loginPayload);
    expect(loginPayload.data.user.id).toBe("user-1");

    const invalidRegister = await registerRoute.POST(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: "", email: "", password: "short" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(invalidRegister.status).toBe(400);
    expectFailureEnvelope(await readJson<ApiFailure>(invalidRegister));

    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.prisma.user.create.mockResolvedValueOnce({
      id: "user-2",
      email: "new@musegrid.local",
      name: "New Creator",
      role: "creator",
    });
    const validRegister = await registerRoute.POST(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "New Creator",
          email: "new@musegrid.local",
          password: "pass-123456",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(validRegister.status).toBe(200);
    const registerPayload = await readJson<ApiSuccess<{ user: { id: string } }>>(validRegister);
    expectSuccessEnvelope(registerPayload);
    expect(registerPayload.data.user.id).toBe("user-2");

    const logout = await logoutRoute.POST();
    expect(logout.status).toBe(200);
    const logoutPayload = await readJson<ApiSuccess<Record<string, never>>>(logout);
    expectSuccessEnvelope(logoutPayload);
    expect(logoutPayload.data).toEqual({});
  });

  it("uses the stable envelope for project list, creation, and detail routes", async () => {
    const projectsRoute = await import("../../app/api/v1/projects/route");
    const projectDetailRoute = await import("../../app/api/v1/projects/[projectId]/route");

    authSessionMock.getApiUser.mockResolvedValueOnce(null);
    const unauthenticatedList = await projectsRoute.GET();
    expect(unauthenticatedList.status).toBe(401);
    expectFailureEnvelope(await readJson<ApiFailure>(unauthenticatedList));

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    projectRepoMock.listProjects.mockResolvedValueOnce([
      { id: "project-1", title: "夜航", status: "draft" },
    ]);
    const listResponse = await projectsRoute.GET();
    expect(listResponse.status).toBe(200);
    const listPayload = await readJson<ApiSuccess<{ projects: Array<{ id: string }> }>>(listResponse);
    expectSuccessEnvelope(listPayload);
    expect(listPayload.data.projects).toHaveLength(1);

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    const invalidCreate = await projectsRoute.POST(
      new Request("http://localhost/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({ title: "" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(invalidCreate.status).toBe(400);
    expectFailureEnvelope(await readJson<ApiFailure>(invalidCreate));

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    projectRepoMock.createProject.mockResolvedValueOnce({
      id: "project-2",
      title: "晨光列车",
      status: "draft",
    });
    const validCreate = await projectsRoute.POST(
      new Request("http://localhost/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          title: "晨光列车",
          initialIdea: "一首关于清晨出发的歌",
          language: "中文",
          genre: "City Pop",
          mood: "明亮",
          intendedUse: "Demo",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(validCreate.status).toBe(200);
    const createPayload = await readJson<ApiSuccess<{ project: { id: string } }>>(validCreate);
    expectSuccessEnvelope(createPayload);
    expect(createPayload.data.project.id).toBe("project-2");

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    projectRepoMock.getProject.mockResolvedValueOnce({
      id: "project-2",
      title: "晨光列车",
      status: "ready",
    });
    projectRepoMock.listProjectGenerations.mockResolvedValueOnce([
      {
        id: "generation-1",
        provider: "sample",
        status: "completed",
        model: "music-2.6-free",
        createdAt: new Date("2026-06-18T10:00:00.000Z"),
        audioAsset: { storageUrl: "https://cdn.musegrid.local/demo.mp3" },
      },
    ]);
    const detailResponse = await projectDetailRoute.GET(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-2" }),
    });
    expect(detailResponse.status).toBe(200);
    const detailPayload = await readJson<
      ApiSuccess<{ project: { id: string }; generations: Array<{ id: string }> }>
    >(detailResponse);
    expectSuccessEnvelope(detailPayload);
    expect(detailPayload.data.project.id).toBe("project-2");
    expect(detailPayload.data.generations[0]?.id).toBe("generation-1");
  });

  it("uses the stable envelope for step avatar, generate, and confirm routes", async () => {
    const avatarRoute = await import("../../app/api/v1/projects/[projectId]/steps/[stepType]/avatar/route");
    const generateRoute = await import("../../app/api/v1/projects/[projectId]/steps/[stepType]/generate/route");
    const confirmRoute = await import("../../app/api/v1/projects/[projectId]/steps/[stepType]/confirm/route");

    authSessionMock.getApiUser.mockResolvedValueOnce(null);
    const unauthenticatedGenerate = await generateRoute.POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-1", stepType: "lyrics" }),
    });
    expect(unauthenticatedGenerate.status).toBe(401);
    expectFailureEnvelope(await readJson<ApiFailure>(unauthenticatedGenerate));

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    const invalidAvatar = await avatarRoute.POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ selectedAvatarId: "" }),
        headers: { "Content-Type": "application/json" },
      }),
      {
        params: Promise.resolve({ projectId: "project-1", stepType: "lyrics" }),
      },
    );
    expect(invalidAvatar.status).toBe(400);
    expectFailureEnvelope(await readJson<ApiFailure>(invalidAvatar));

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    projectRepoMock.selectProjectStepAvatar.mockResolvedValueOnce({
      ok: true,
      step: { id: "step-1", stepType: "lyrics", status: "draft" },
    });
    const avatarResponse = await avatarRoute.POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ selectedAvatarId: "avatar-1" }),
        headers: { "Content-Type": "application/json" },
      }),
      {
        params: Promise.resolve({ projectId: "project-1", stepType: "lyrics" }),
      },
    );
    expect(avatarResponse.status).toBe(200);
    const avatarPayload = await readJson<ApiSuccess<{ step: { id: string } }>>(avatarResponse);
    expectSuccessEnvelope(avatarPayload);
    expect(avatarPayload.data.step.id).toBe("step-1");

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    stepGeneratorMock.generateStepOutput.mockResolvedValueOnce({
      ok: true,
      step: { id: "step-1", stepType: "lyrics", status: "ready" },
    });
    const generateResponse = await generateRoute.POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-1", stepType: "lyrics" }),
    });
    expect(generateResponse.status).toBe(200);
    const generatePayload = await readJson<ApiSuccess<{ step: { status: string } }>>(generateResponse);
    expectSuccessEnvelope(generatePayload);
    expect(generatePayload.data.step.status).toBe("ready");

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    stepGeneratorMock.confirmStepOutput.mockResolvedValueOnce({
      ok: true,
      step: { id: "step-1", stepType: "lyrics", status: "completed" },
      contribution: { id: "contribution-1", stepType: "lyrics" },
    });
    const confirmResponse = await confirmRoute.POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-1", stepType: "lyrics" }),
    });
    expect(confirmResponse.status).toBe(200);
    const confirmPayload = await readJson<
      ApiSuccess<{ step: { status: string }; contribution: { id: string } }>
    >(confirmResponse);
    expectSuccessEnvelope(confirmPayload);
    expect(confirmPayload.data.contribution.id).toBe("contribution-1");
  });

  it("uses the stable envelope for demo generation and creator application routes", async () => {
    const generateDemoRoute = await import("../../app/api/v1/projects/[projectId]/generate-demo/route");
    const creatorApplicationsRoute = await import("../../app/api/v1/creator-applications/route");

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    prismaMock.prisma.project.findFirst.mockResolvedValueOnce(null);
    const missingProject = await generateDemoRoute.POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-404" }),
    });
    expect(missingProject.status).toBe(404);
    expectFailureEnvelope(await readJson<ApiFailure>(missingProject));

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    prismaMock.prisma.project.findFirst.mockResolvedValueOnce({
      id: "project-1",
      userId: "user-1",
      steps: [{ stepType: "production", status: "completed" }],
    });
    stepGeneratorMock.buildMiniMaxInputForProject.mockResolvedValueOnce({
      lyrics: "[Verse]\nhello",
      prompt: "future city pop demo",
    });
    prismaMock.prisma.$transaction
      .mockResolvedValueOnce({ job: { id: "generation-1", provider: "sample", model: "music-2.6-free" } })
      .mockResolvedValueOnce({
        audioAsset: {
          id: "audio-1",
          storageUrl: "https://cdn.musegrid.local/demo.mp3",
          duration: 61000,
          format: "mp3",
        },
        job: {
          id: "generation-1",
          status: "completed",
          provider: "sample",
          model: "music-2.6-free",
          createdAt: new Date("2026-06-18T10:00:00.000Z"),
        },
      });
    minimaxClientMock.generateMusicDemo.mockResolvedValueOnce({
      audioUrl: "https://provider.example/demo.mp3",
      durationMs: 61000,
      providerTraceId: "sample-fallback",
    });
    minimaxStorageMock.getSampleAudioAsset.mockReturnValueOnce({
      storageUrl: "https://cdn.musegrid.local/demo.mp3",
      format: "mp3",
    });
    const demoResponse = await generateDemoRoute.POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });
    expect(demoResponse.status).toBe(200);
    const demoPayload = await readJson<
      ApiSuccess<{ generation: { id: string }; audioAsset: { id: string } }>
    >(demoResponse);
    expectSuccessEnvelope(demoPayload);
    expect(demoPayload.data.generation.id).toBe("generation-1");
    expect(demoPayload.data.audioAsset.id).toBe("audio-1");

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    const invalidApplication = await creatorApplicationsRoute.POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ capabilityDirection: "lyrics" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(invalidApplication.status).toBe(400);
    expectFailureEnvelope(await readJson<ApiFailure>(invalidApplication));

    authSessionMock.getApiUser.mockResolvedValueOnce({ id: "user-1" });
    creatorApplicationsMock.submitCreatorApplicationWithAvatar.mockResolvedValueOnce({
      application: { id: "application-1" },
      avatar: { id: "avatar-1" },
    });
    const validApplication = await creatorApplicationsRoute.POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          capabilityDirection: "lyrics",
          profileData: {
            displayName: "夜航作词人",
            tagline: "城市夜色叙事",
            styleTags: "R&B, City Pop",
            experience: "10 年作词经历",
            caseDescription: "擅长都市感中文歌词。",
          },
          workSamples: [{ title: "样例作品", description: "都市感中文歌词。" }],
          questionnaireAnswers: {
            creativeApproach: "先定情绪与画面",
            correctionMethod: "逐段纠偏",
            boundaries: "不模仿具体歌手",
          },
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(validApplication.status).toBe(200);
    const applicationPayload = await readJson<
      ApiSuccess<{ applicationId: string; avatarId: string; dashboardUrl: string }>
    >(validApplication);
    expectSuccessEnvelope(applicationPayload);
    expect(applicationPayload.data.dashboardUrl).toBe("/avatar-dashboard");
  });
});
