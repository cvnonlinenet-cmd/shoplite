"use client";

// Mô tả sản phẩm dạng HTML. CỐ Ý có XSS qua dangerouslySetInnerHTML và href javascript:.
import { useSearchParams } from "next/navigation";

export function ProductDescription({ html }: { html: string }) {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight") ?? "";
  const rendered = highlight ? html.replaceAll(highlight, `<mark>${highlight}</mark>`) : html;
  const link = searchParams.get("link") ?? "#";

  return (
    <section>
      <div dangerouslySetInnerHTML={{ __html: rendered }} />
      <a href={link}>Xem thêm</a>
    </section>
  );
}
