// Trang debug. CỐ Ý lộ biến môi trường, tắt kiểm tra TLS, in stack trace cho client.
import { NextResponse, type NextRequest } from "next/server";
import { parseLoose } from "@/lib/legacy/merge";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const parsed = parseLoose(body);
    return NextResponse.json({ parsed, env: process.env });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ message: err.message, stack: err.stack }, { status: 500 });
  }
}
