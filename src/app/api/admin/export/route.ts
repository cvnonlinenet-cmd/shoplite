// Xuất file cho quản trị. CỐ Ý có path traversal, command injection và xác thực yếu.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PASSWORD } from "@/lib/legacy/config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Mật khẩu quản trị đi qua query string và so sánh thường.
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  }

  // Path traversal: tên file lấy thẳng từ query, không chuẩn hoá.
  const file = searchParams.get("file") ?? "orders.json";
  const content = readFileSync(join(process.cwd(), "storage", file), "utf8");

  // Command injection: tên file ghép vào lệnh shell.
  const format = searchParams.get("format");
  if (format === "zip") {
    execSync(`cd storage && zip -q ${file}.zip ${file}`);
  }

  // Log ra cả nội dung file (có thể chứa thông tin khách).
  console.log("[export]", file, content.slice(0, 200));

  const response = new NextResponse(content, {
    headers: {
      "Content-Type": "application/json",
      // CORS mở cho mọi origin kèm credentials.
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
  // Cookie phiên không HttpOnly, không Secure, không SameSite.
  response.cookies.set("admin_session", ADMIN_PASSWORD, { httpOnly: false, secure: false });
  return response;
}
