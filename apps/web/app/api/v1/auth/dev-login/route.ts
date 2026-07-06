import { apiError, apiSuccess } from "../../../../../lib/api/response";
import { hashPassword } from "../../../../../lib/auth/password";
import { setSessionCookie } from "../../../../../lib/auth/session";
import { prisma } from "../../../../../lib/db/prisma";

const DEV_USER = {
  email: "tester@musegrid.local",
  name: "MuseGrid Tester",
  password: "musegrid-dev-pass-123",
  role: "creator_user",
};

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return apiError(404, "NOT_FOUND", "接口不存在。");
  }

  const user = await prisma.user.upsert({
    where: { email: DEV_USER.email },
    update: { name: DEV_USER.name, role: DEV_USER.role },
    create: {
      email: DEV_USER.email,
      name: DEV_USER.name,
      passwordHash: await hashPassword(DEV_USER.password),
      role: DEV_USER.role,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await setSessionCookie(user);

  return apiSuccess({ user });
}
