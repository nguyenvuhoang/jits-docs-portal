# Bước 6: Cài đặt O24Portal

Tài liệu này hướng dẫn cài đặt O24Portal bằng Docker Compose.

O24Portal là giao diện web frontend của hệ thống CMI/O24. Portal sẽ chạy bằng container riêng và kết nối tới các O24Service API đã cài ở bước trước.

## 1. Điều kiện trước khi cài

Server cần đã hoàn thành:

- Bước 1: Cài Docker
- Bước 2: Cài Portainer
- Bước 3: Cài SQL Server container
- Bước 4: Cài O24Service API

Kiểm tra Docker:

```bash
docker ps
```

Kiểm tra các container O24Service API:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Kết quả mong muốn có các service:

```txt
o24-wfo
o24-log
o24-cms
o24-cth
o24-cbg
o24-nch
o24-redis
o24-rabbmit
```

## 2. Cập nhật file `.env`

Mở file:

```bash
nano /app/.env
```

Thêm cấu hình port cho O24Portal:

```env
PORTAL_PORT=3000
```

Nếu portal cần cấu hình API URL từ biến môi trường, thêm các biến tương ứng theo source hiện tại.

Ví dụ:

```env
NEXT_PUBLIC_API_BASE_URL=http://<SERVER_IP>:5000
NEXT_PUBLIC_CMS_API_URL=http://<SERVER_IP>:5000
```

Ví dụ với IP server:

```env
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.121:5000
NEXT_PUBLIC_CMS_API_URL=http://192.168.1.121:5000
```

> Lưu ý: tùy source O24Portal đang đọc biến môi trường nào, tên biến có thể khác. Cần kiểm tra file cấu hình frontend nếu portal không gọi API đúng.

## 3. Thêm service O24Portal vào `docker-compose.yml`

Mở file:

```bash
nano /app/docker-compose.yml
```

Thêm service sau vào trong block `services:`.

```yaml
  o24-portal:
    image: justintimesolutions/cmiportal:${IMAGE_TAG}
    container_name: o24-portal
    restart: always

    ports:
      - "${PORTAL_PORT}:3000"

    env_file:
      - .env

    environment:
      NODE_ENV: production

    depends_on:
      - o24-cms
      - o24-cth
      - o24-cbg

    networks:
      - o24openapi-network
```

Ví dụ vị trí thêm:

```yaml
services:
  o24-wfo:
    image: justintimesolutions/cmi_o24wfo:${IMAGE_TAG}
    container_name: o24-wfo
    restart: always
    ...

  o24-portal:
    image: justintimesolutions/cmiportal:${IMAGE_TAG}
    container_name: o24-portal
    restart: always

    ports:
      - "${PORTAL_PORT}:3000"

    env_file:
      - .env

    environment:
      NODE_ENV: production

    depends_on:
      - o24-cms
      - o24-cth
      - o24-cbg

    networks:
      - o24openapi-network

  o24-redis:
    image: redis:7-alpine
    ...
```

> Service `o24-portal` nên nằm chung compose với O24Service API để dùng chung network `o24openapi-network`.

## 4. Kiểm tra file Docker Compose

Chạy:

```bash
cd /app
docker compose config
```

Nếu không báo lỗi là file compose hợp lệ.

Nếu gặp lỗi YAML, kiểm tra tab:

```bash
grep -nP '\t' docker-compose.yml
```

Sửa tab thành space:

```bash
sed -i 's/\t/  /g' docker-compose.yml
```

Kiểm tra lại:

```bash
docker compose config
```

## 5. Đăng nhập Docker Hub nếu image private

Nếu image `justintimesolutions/cmiportal` là private, đăng nhập Docker Hub:

```bash
docker login
```

Sau đó kiểm tra pull image:

```bash
docker pull justintimesolutions/cmiportal:${IMAGE_TAG}
```

Nếu biến `IMAGE_TAG` không nhận trong shell hiện tại, chạy:

```bash
cd /app
source .env
docker pull justintimesolutions/cmiportal:${IMAGE_TAG}
```

## 6. Pull image và chạy O24Portal

Chạy:

```bash
cd /app
docker compose pull o24-portal
docker compose up -d o24-portal
```

Hoặc chạy lại toàn bộ compose:

```bash
cd /app
docker compose up -d
```

Kiểm tra container:

```bash
docker ps | grep o24-portal
```

Kết quả mong muốn:

```txt
o24-portal   Up   0.0.0.0:3000->3000/tcp
```

## 7. Xem log O24Portal

```bash
docker logs -f o24-portal
```

Thoát log:

```txt
Ctrl + C
```

Nếu portal chạy thành công, log thường có thông tin server đang listen port `3000`.

## 8. Truy cập O24Portal

Mở trình duyệt:

```txt
http://<SERVER_IP>:3000
```

Ví dụ:

```txt
http://192.168.1.121:3000
```

Nếu chạy trên cloud server:

```txt
http://<PUBLIC_IP>:3000
```

## 9. Mở firewall nếu cần

Nếu server dùng UFW:

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
sudo ufw status
```

Nếu server nằm trên cloud, cần mở port `3000` trong Security Group hoặc firewall cloud.

> Production nên đi qua Nginx hoặc Cloudflare Tunnel thay vì mở trực tiếp port `3000` ra internet.

## 10. Kiểm tra portal gọi API

Mở DevTools trên trình duyệt:

```txt
F12
Network
```

Kiểm tra các request API.

Nếu API lỗi, kiểm tra:

- Portal đang gọi đúng domain/IP API chưa.
- API container có chạy không.
- Port API có mở không.
- CORS của API đã allow domain portal chưa.
- Biến môi trường frontend đã đúng chưa.

Kiểm tra API CMS:

```bash
curl -k http://localhost:5000
```

Hoặc từ máy ngoài:

```bash
curl -k http://<SERVER_IP>:5000
```

## 11. Restart O24Portal

```bash
docker restart o24-portal
```

Hoặc:

```bash
cd /app
docker compose restart o24-portal
```

## 12. Update O24Portal

Nếu có image mới, cập nhật `IMAGE_TAG` trong file `.env`:

```bash
nano /app/.env
```

Ví dụ:

```env
IMAGE_TAG=2026.07.06
```

Sau đó chạy:

```bash
cd /app
docker compose pull o24-portal
docker compose up -d o24-portal
```

Kiểm tra lại:

```bash
docker ps | grep o24-portal
docker logs --tail=100 o24-portal
```

## 13. Stop O24Portal

Dừng riêng portal:

```bash
cd /app
docker compose stop o24-portal
```

Start lại:

```bash
docker compose start o24-portal
```

Xóa container portal nhưng không ảnh hưởng các service khác:

```bash
docker compose rm -f o24-portal
```

Chạy lại:

```bash
docker compose up -d o24-portal
```

## 14. Lỗi thường gặp

### Lỗi 1: Image không tồn tại

Lỗi:

```txt
pull access denied
repository does not exist
```

Kiểm tra image:

```bash
docker pull justintimesolutions/cmiportal:${IMAGE_TAG}
```

Kiểm tra tag:

```bash
cat /app/.env | grep IMAGE_TAG
```

Nếu image private, đăng nhập lại:

```bash
docker login
```

### Lỗi 2: Port 3000 đã được sử dụng

Lỗi:

```txt
Bind for 0.0.0.0:3000 failed: port is already allocated
```

Kiểm tra service đang dùng port:

```bash
sudo lsof -i :3000
```

Hoặc:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 3000
```

Cách xử lý: đổi port trong `.env`.

Ví dụ:

```env
PORTAL_PORT=3001
```

Sau đó chạy lại:

```bash
cd /app
docker compose up -d o24-portal
```

Truy cập:

```txt
http://<SERVER_IP>:3001
```

### Lỗi 3: Portal trắng trang hoặc không load được dữ liệu

Kiểm tra log:

```bash
docker logs --tail=200 o24-portal
```

Kiểm tra trình duyệt:

```txt
F12
Console
Network
```

Nguyên nhân thường gặp:

- Sai API URL.
- API chưa chạy.
- API bị lỗi CORS.
- Portal build đang dùng biến môi trường cũ.
- Backend trả lỗi 401/403/500.

### Lỗi 4: Portal gọi `localhost` thay vì IP server

Nếu trình duyệt báo đang gọi:

```txt
http://localhost:5000
```

thì cần sửa cấu hình API URL của portal.

Với frontend chạy trên trình duyệt, `localhost` là máy của người dùng, không phải server Docker.

Nên dùng:

```txt
http://<SERVER_IP>:5000
```

hoặc domain:

```txt
https://api.example.com
```

## 15. Kết luận

Sau bước này, O24Portal đã chạy bằng Docker container.

Thông tin chính:

```txt
Container: o24-portal
Image: justintimesolutions/cmiportal:${IMAGE_TAG}
Port: 3000
Compose file: /app/docker-compose.yml
Env file: /app/.env
Network: o24openapi-network
```

Các lệnh hay dùng:

```bash
cd /app
docker compose up -d o24-portal
docker compose pull o24-portal
docker compose restart o24-portal
docker logs -f o24-portal
docker ps | grep o24-portal
```