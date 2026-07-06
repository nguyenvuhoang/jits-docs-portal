# Cài đặt Docker cho EMI

Tài liệu này dùng cho server Linux chạy các container của hệ thống EMI.

## 1. Kiểm tra Docker

```bash
docker version
docker compose version
```

Nếu Docker chưa được cài, hãy cài Docker Engine theo tiêu chuẩn nội bộ của server.

## 2. Kiểm tra network

```bash
docker network ls
docker network create o24openapi-network
```

Nếu network đã tồn tại thì không cần tạo lại.

## 3. Kiểm tra container đang chạy

```bash
docker ps
```

Các service thường gặp:

| Service | Port | Ghi chú |
| --- | ---: | --- |
| CMS API | 5000 | Backend CMS |
| Logger | 5030 | Log service |
| WFO | 109 | Workflow service |

## 4. Lệnh vận hành nhanh

```bash
# Xem log
docker logs -f <container_name>

# Restart container
docker restart <container_name>

# Xem image local
docker images
```

> Ghi chú: Không xóa volume khi chưa backup dữ liệu.
