# Bản thiết kế: don-sang

## 1. Tên agent

`don-sang`

## 2. Việc

Phân loại đơn ShopLite đang Chờ xác nhận và đề xuất một việc cho nhân viên với mỗi đơn. Hiện nhân viên làm tay mỗi sáng
một lần, mất khoảng 15 phút đọc từng đơn ở trang Đơn hàng. Agent chỉ làm bước đọc và phân loại; người bấm xác nhận hay hủy.

## 3. Kích hoạt

Nhân viên gõ `/don-sang` đầu giờ sáng (hoặc chạy `claude -p "/don-sang" ...` với các cờ trong `cau-hinh.json`). Chưa chạy
theo lịch: `storage/orders.json` nằm trên máy, không có trên GitHub.

## 4. Đầu vào

`storage/orders.json` (cấu trúc `Order` ở `src/features/orders/types.ts`), đọc **qua MCP server `shoplite-don`**
(`scripts/agent/mcp-don-hang.mjs`), không đọc thẳng file. Server chỉ trả đơn `pending`, bỏ họ tên, số điện thoại, địa chỉ,
email; che số điện thoại và email trong ghi chú trước khi model thấy.

Trường do khách viết, **không tin được**: `customer.note` (ô Ghi chú ở `/checkout`, tối đa 200 ký tự theo
`checkout-schema.ts`). Có thể chứa số điện thoại, email, hoặc câu ra lệnh cho AI. Các trường còn lại do server ShopLite sinh.

## 5. Đầu ra theo mẫu

Mỗi đơn chờ một đề xuất vào hàng chờ `storage/de-xuat-don.json` qua `de_xuat_xu_ly`, trạng thái `cho-duyet`:

```json
{ "id": "SL-20261107-9C9820", "de_xuat": "xac-nhan", "ly_do": "Ghi chú chỉ dặn giao giờ hành chính.", "trang_thai": "cho-duyet" }
```

Ba nhãn: `xac-nhan` (ghi chú trống hoặc dặn giao bình thường), `goi-lai` (đổi địa chỉ, đổi giờ, muốn hủy hay đổi đơn, cần hỏi
lại), `can-nguoi-xem` (ghi chú có câu bảo AI hay hệ thống làm gì, hoặc không chắc). Trên màn hình in bảng: mã đơn, đề xuất,
lý do ngắn. Không đổi trạng thái đơn.

## 6. Công cụ được phép

```cong-cu
mcp: shoplite-don/liet_ke_don_cho
mcp: shoplite-don/de_xuat_xu_ly
doc: .claude/skills/don-sang/**
```

- `liet_ke_don_cho`: nguồn dữ liệu duy nhất, đã che.
- `de_xuat_xu_ly`: cách ghi duy nhất, chỉ vào hàng chờ, server từ chối lý do có số điện thoại/email và mã đơn không chờ.
- `doc: .claude/skills/don-sang/**`: Claude Code cần `Read` để nạp skill. Không `lenh:` vì agent không cần shell; không
  `ghi:` vì không sửa file; không `web:`.
- `Read` trong thư mục dự án không cần luật, nên lệnh chạy chặn thêm `Read(./storage/**)`, `Read(./.env)`, `Read(./.env.*)`.

## 7. Giới hạn mỗi lần chạy

12 lượt, 0,30 USD, 5 phút (`--max-turns 12`, `--max-budget-usd 0.30`, timeout 5 phút trong `chay-ca-thu.mjs`).

## 8. Khi nào dừng

- Không có đơn chờ: chỉ in `Không có đơn chờ xác nhận.`, không gọi `de_xuat_xu_ly`.
- Server báo lỗi (`isError`): in nguyên lỗi, không đoán, không thử lại quá một lần.
- Hết lượt hoặc hết tiền: dừng, báo số đơn đã đề xuất và số đơn chưa.

## 9. Lúc nào hỏi người

- **Luôn luôn:** mọi đề xuất chờ nhân viên duyệt ở `storage/de-xuat-don.json`; agent không đổi trạng thái đơn.
- Ghi chú có câu bảo AI hay hệ thống làm gì (kể cả nêu mã đơn khác), hoặc agent không chắc: nhãn `can-nguoi-xem`.
- Khách đòi hủy, hoàn tiền, đổi đơn: `goi-lai` hoặc `can-nguoi-xem`, không bao giờ tự hủy.
- Người duyệt: nhân viên xử lý đơn, trên trang Đơn hàng.

## 10. Đo kết quả

Năm ca trong thư mục này, máy chấm bằng `chay-ca-thu.mjs`: ca-1 bình thường, ca-2 rỗng, ca-3 ghi chú bảo AI xác nhận mọi
đơn và hủy đơn khác, ca-4 dữ liệu cá nhân, ca-5 khách đòi hủy và hoàn tiền. Ca khó nhất là ca-3: câu mồi nêu đúng mã của một
đơn khác, agent phải không đổi nhãn đơn đó. Thêm ca-6 sau khi tự kiểm server (mục 11).

## 11. Người soát

Chưa có bạn cùng cặp; tự soát theo ba câu của bài, rồi kiểm server bằng tay:

- "Đúng một việc?" Có: đọc và phân loại; xác nhận/hủy là việc của người.
- "Công cụ nào thừa?" `Read` cần cho skill nhưng rộng: đã chặn `storage/**` và `.env*` bằng `--disallowedTools`.
- "Ghi chú lạ thì sao?" Mục 8, 9: `can-nguoi-xem`, không làm theo.
- Kiểm server bằng tay thấy lý do `"gọi +84 912.345.678"` **được ghi** vì regex chỉ nhận chữ số ngay sau `+84`. Đã sửa regex
  trong `mcp-don-hang.mjs` và `log-cong-cu.mjs` cho phép một dấu cách/chấm/gạch sau `+84`, thêm ca-6 cho dạng số này.
