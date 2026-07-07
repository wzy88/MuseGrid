import { expect, test } from "@playwright/test";

test("project API returns JSON 401 for unauthenticated requests", async ({ request }) => {
  const getResponse = await request.get("/api/v1/projects");
  await expect(getResponse).not.toBeOK();
  expect(getResponse.status()).toBe(401);
  expect(getResponse.headers()["content-type"]).toContain("application/json");
  await expect(getResponse.json()).resolves.toMatchObject({
    ok: false,
    error: { code: expect.any(String), message: expect.any(String) },
  });

  const postResponse = await request.post("/api/v1/projects", {
    data: {
      title: "未登录项目",
      initialIdea: "一首未登录时不能创建的歌",
      language: "中文",
      genre: "Pop",
      mood: "安静",
      intendedUse: "测试",
    },
  });
  await expect(postResponse).not.toBeOK();
  expect(postResponse.status()).toBe(401);
  expect(postResponse.headers()["content-type"]).toContain("application/json");
  await expect(postResponse.json()).resolves.toMatchObject({
    ok: false,
    error: { code: expect.any(String), message: expect.any(String) },
  });
});

test("registered user creates a song project from studio home", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("MuseGrid Creator");
  await page.getByLabel("邮箱").fill(`creator-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByLabel("项目名称").fill("霓虹夜航");
  await page.getByLabel("歌曲灵感").fill("想写一首适合深夜开车听的中文 R&B，带一点未来感和释怀");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("R&B");
  await page.getByLabel("情绪").fill("释怀");
  await page.getByLabel("用途").fill("个人发行");
  await page.getByRole("button", { name: "开始制作" }).click();

  await expect(page).toHaveURL(/\/studio\/projects\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "霓虹夜航" })).toBeVisible();
});

test("registered user can quick-generate a song and land on the work result page", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("Quick Mode Creator");
  await page.getByLabel("邮箱").fill(`quick-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByRole("radio", { name: /极速模式/ }).click();
  await page.getByLabel("项目名称").fill("一键夜航");
  await page.getByLabel("歌曲灵感").fill("做一首适合夜间通勤播放的中文 Future R&B，情绪松弛但副歌要抓耳");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("Future Pop");
  await page.locator('input[name="mood"]').fill("松弛");
  await page.getByLabel("用途").fill("个人 Demo");
  await page.getByRole("button", { name: "极速生成" }).click();

  await expect(page.getByRole("status", { name: "极速生成状态" })).toBeVisible();
  await expect(page).toHaveURL(/\/works\/[^/]+$/, { timeout: 20000 });
  await expect(page.getByRole("heading", { name: "一键夜航" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "作品主播放器" })).toBeVisible();
  await expect(page.getByRole("link", { name: "下载 MP3" })).toBeVisible();
});
