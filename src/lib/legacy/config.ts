// Cấu hình "tạm" cho công cụ nội bộ. CỐ Ý chứa lỗi để thử máy quét bảo mật: khoá viết thẳng trong code.
export const ADMIN_PASSWORD = "Shoplite@2026";
export const JWT_SECRET = "shoplite-jwt-secret-do-not-change";
export const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
export const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
// Khoá Stripe dạng thật bị GitHub push protection chặn khi đẩy: thay bằng chuỗi giả cùng vai trò.
export const STRIPE_SECRET_KEY = "stripe-secret-key-FAKE-00000000000000000000";
export const GITHUB_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyzAB";
export const DATABASE_URL = "postgres://admin:SuperSecret123@db.shoplite.internal:5432/shoplite";
