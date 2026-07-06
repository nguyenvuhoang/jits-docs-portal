# O24 User Guide Portal

Dự án Next.js độc lập chuyên dùng làm cổng tài liệu hướng dẫn cho nhiều dự án như EMI, CMI, IPS...

## Chức năng chính

- Trang chọn dự án tài liệu.
- Mỗi dự án có access key riêng.
- Unlock bằng cookie httpOnly có chữ ký HMAC.
- Tài liệu lưu ngoài `public`, trong thư mục `docs-content`.
- Hỗ trợ Markdown và HTML.
- Markdown render bằng `react-markdown`, `remark-gfm`, `rehype-sanitize`.
- HTML render qua `sanitize-html` trước khi hiển thị.
- Có API server-side để đọc manifest và document content.

## Cấu trúc thư mục

```text
docs-content/
  emi/
    manifest.json
    install/
      docker.md
      nginx.html
    deployment/
      publish-cms.md
    troubleshooting/
      500-error.html
  cmi/
    manifest.json
    install/
      local-run.md
    deployment/
      docker-push.md
```

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở:

```text
http://localhost:3000/user-guide
```

Access key mặc định:

```text
EMI: emi@2026
CMI: cmi@2026
```

## Cấu hình key

Có thể cấu hình theo từng biến môi trường:

```env
GUIDE_AUTH_SECRET=change-this-to-a-long-random-secret
GUIDE_KEY_EMI=emi@2026
GUIDE_KEY_CMI=cmi@2026
GUIDE_UNLOCK_HOURS=8
```

Hoặc dùng JSON:

```env
GUIDE_KEYS_JSON={"emi":"emi@2026","cmi":"cmi@2026","ips":"ips@2026"}
```

## Thêm dự án tài liệu mới

Ví dụ thêm IPS:

```text
docs-content/ips/manifest.json
docs-content/ips/install/server.md
```

Tạo `manifest.json`:

```json
{
  "projectCode": "ips",
  "projectName": "IPS User Guide",
  "description": "Tài liệu cài đặt và vận hành IPS.",
  "icon": "BookOpen",
  "status": "active",
  "folders": [
    {
      "folderCode": "install",
      "title": "Cài đặt môi trường",
      "description": "Chuẩn bị server và các service nền.",
      "icon": "Server",
      "documents": [
        {
          "slug": "server",
          "title": "Chuẩn bị server",
          "summary": "Các bước cấu hình server ban đầu.",
          "file": "install/server.md",
          "type": "markdown"
        }
      ]
    }
  ]
}
```

Sau đó thêm key:

```env
GUIDE_KEYS_JSON={"emi":"emi@2026","cmi":"cmi@2026","ips":"ips@2026"}
```

## API có sẵn

```text
GET  /api/user-guide/projects
POST /api/user-guide/validate-key
GET  /api/user-guide/:projectCode/tree
GET  /api/user-guide/:projectCode/document/:folderCode/:slug
```

## Ghi chú bảo mật

- Không đặt file tài liệu trong `public` nếu tài liệu cần bảo vệ bằng key.
- Đổi `GUIDE_AUTH_SECRET` khi deploy production.
- Access key hiện là mô hình đơn giản. Nếu cần audit người xem tài liệu, nên nâng cấp sang login hoặc database access key.


## Chạy bằng Docker

```bash
docker compose up -d --build
```

Mở:

```text
http://localhost:3009/user-guide
```
