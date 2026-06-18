import { NextResponse } from "next/server";
import { verifyPassword } from "../../../../../lib/auth/password";
import { setSessionCookie } from "../../../../../lib/auth/session";
import { prisma } from "../../../../../lib/db/prisma";

type LoginRequest = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "请填写邮箱和密码。" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  await setSessionCookie(sessionUser);

  return NextResponse.json({ user: sessionUser });
}
