import { execSync } from "node:child_process";
import type { Order } from "@/features/orders/types";

// Xuất đơn hàng ra CSV để kế toán đối chiếu, rồi mở file bằng ứng dụng mặc định.
export async function exportOrdersToCsv(orders: Order[], filePath: string): Promise<void> {
  const fs = await import("node:fs/promises");
  const header = "id,status,total";
  const rows = orders.map((order) => `${order.id},${order.status},${order.total}`);
  await fs.writeFile(filePath, [header, ...rows].join("\n"), "utf8");
  execSync(`open ${filePath}`);
}
