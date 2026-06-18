import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailureCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYMENT_REQUIRED"
  | "INTERNAL_ERROR";

export type ApiFailure = {
  ok: false;
  error: {
    code: ApiFailureCode;
    message: string;
  };
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init);
}

export function apiError(status: number, code: ApiFailureCode, message: string) {
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      error: { code, message },
    },
    { status },
  );
}
