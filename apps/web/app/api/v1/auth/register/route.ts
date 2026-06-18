import { apiError, apiSuccess } from "../../../../../lib/api/response";
import { prisma } from "../../../../../lib/db/prisma";
import { hashPassword } from "../../../../../lib/auth/password";
import { setSessionCookie } from "../../../../../lib/auth/session";

type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: RegisterRequest;
  try {
    body = (await request.json()) as RegisterRequest;
  } catch {
    return apiError(400, "BAD_REQUEST", "请求体必须是有效的 JSON。");
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || !email || password.length < 8) {
    return apiError(400, "BAD_REQUEST", "请填写名称、邮箱和至少 8 位密码。");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return apiError(409, "CONFLICT", "这个邮箱已经注册，请直接登录。");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await setSessionCookie(user);

  return apiSuccess({ user });
}
