import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db/prisma";
import { hashPassword } from "../../../../../lib/auth/password";
import { setSessionCookie } from "../../../../../lib/auth/session";

type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequest;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || !email || password.length < 8) {
    return NextResponse.json({ error: "请填写名称、邮箱和至少 8 位密码。" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "这个邮箱已经注册，请直接登录。" }, { status: 409 });
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

  return NextResponse.json({ user });
}
