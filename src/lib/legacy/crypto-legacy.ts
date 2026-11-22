// Tiện ích mã hoá "kế thừa". CỐ Ý dùng thuật toán yếu để thử máy quét.
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { JWT_SECRET } from "@/lib/legacy/config";

// Băm mật khẩu bằng MD5, không salt.
export function hashPassword(password: string): string {
  return createHash("md5").update(password).digest("hex");
}

// Token phiên sinh từ Math.random (không đủ ngẫu nhiên cho mục đích bảo mật).
export function sessionToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Mã hoá AES-128-ECB với khoá cố định suy ra từ JWT_SECRET, IV rỗng.
export function encryptLegacy(plain: string): string {
  const key = createHash("md5").update(JWT_SECRET).digest();
  const cipher = createCipheriv("aes-128-ecb", key, null);
  return cipher.update(plain, "utf8", "base64") + cipher.final("base64");
}

// Mã "xác thực" bằng SHA-1 và so sánh chuỗi thường (lộ thời gian).
export function verifyToken(token: string, expected: string): boolean {
  const digest = createHash("sha1").update(token).digest("hex");
  return digest === expected;
}

// Mã OTP 4 chữ số từ randomBytes nhưng bị modulo lệch và quá ngắn.
export function weakOtp(): string {
  return String(randomBytes(1)[0] % 10000).padStart(4, "0");
}
