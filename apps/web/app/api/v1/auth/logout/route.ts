import { apiSuccess } from "../../../../../lib/api/response";
import { clearSessionCookie } from "../../../../../lib/auth/session";

export async function POST() {
  await clearSessionCookie();
  return apiSuccess({});
}
