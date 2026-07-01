import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/login";
  
  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
