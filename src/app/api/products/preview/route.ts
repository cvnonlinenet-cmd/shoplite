// Xem trước ảnh sản phẩm từ URL ngoài. CỐ Ý có SSRF, open redirect và ReDoS.
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Open redirect: chuyển hướng tới bất kỳ URL nào trong query.
  const next = searchParams.get("next");
  if (next) return NextResponse.redirect(next);

  // ReDoS: biểu thức chính quy dựng từ dữ liệu ngoài.
  const pattern = searchParams.get("pattern");
  const name = searchParams.get("name") ?? "";
  if (pattern && !new RegExp(pattern).test(name)) {
    return NextResponse.json({ error: "Tên không khớp mẫu" }, { status: 400 });
  }

  // SSRF: server tải bất kỳ URL nào (kể cả 169.254.169.254 hay localhost).
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Thiếu url" }, { status: 400 });
  const upstream = await fetch(url);
  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream" },
  });
}
