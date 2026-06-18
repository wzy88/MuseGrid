import { verifyPassword } from "../../../../../lib/auth/password";
import { apiError, apiSuccess } from "../../../../../lib/api/response";
import { setSessionCookie } from "../../../../../lib/auth/session";
import { prisma } from "../../../../../lib/db/prisma";

type LoginRequest = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginRequest;
  try {
    body = (await request.json()) as LoginRequest;
  } catch {
    return apiError(400, "BAD_REQUEST", "请求体必须是有效的 JSON。");
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return apiError(400, "BAD_REQUEST", "请填写邮箱和密码。");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return apiError(401, "UNAUTHORIZED", "邮箱或密码不正确。");
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  await setSessionCookie(sessionUser);

  return apiSuccess({ user: sessionUser });
}
