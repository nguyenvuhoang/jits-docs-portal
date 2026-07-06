# Bước 4: Cài đặt O24Service API

Tài liệu này hướng dẫn tạo Docker Compose cho các service API nền tảng O24 của dự án CMI.

Các service bao gồm:

- O24 WFO
- O24 LOG
- O24 CMS
- O24 CTH
- O24 CBG
- O24 NCH
- Redis
- RabbitMQ

## 1. Chuẩn bị thư mục deploy

Tạo thư mục `/app`:

```bash
sudo mkdir -p /app
sudo chown -R $USER:$USER /app
cd /app
```

Tạo thư mục log cho các service:

```bash
sudo mkdir -p /var/log/cmi/o24wfo
sudo mkdir -p /var/log/cmi/o24log
sudo mkdir -p /var/log/cmi/o24cms
sudo mkdir -p /var/log/cmi/o24cth
sudo mkdir -p /var/log/cmi/o24cbg
sudo mkdir -p /var/log/cmi/o24nch
```

Cấp quyền:

```bash
sudo chown -R $USER:$USER /var/log/cmi
```

Tạo thư mục secret và static config cho CMS/NCH:

```bash
sudo mkdir -p /home/cms/app/secret
sudo mkdir -p /home/cms/app/StaticConfig
sudo chown -R $USER:$USER /home/cms/app
```

## 2. Tạo file `.env`

Trong thư mục `/app`, tạo file `.env`:

```bash
nano .env
```

Nội dung mẫu:

```env
IMAGE_TAG=latest

API_WFO_PORT=109
GRPC_WFO_PORT=105

API_LOG_PORT=5030
GRPC_LOG_PORT=5031

API_CMS_PORT=5000
GRPC_CMS_PORT=50001

API_CTH_PORT=5070
GRPC_CTH_PORT=5071

API_CBG_PORT=5040
GRPC_CBG_PORT=5041

API_NCH_PORT=5090
GRPC_NCH_PORT=5091

RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=RabbitMQ@2026
```

Lưu file:

```txt
Ctrl + O
Enter
Ctrl + X
```

> Nếu image dùng tag khác `latest`, sửa `IMAGE_TAG` theo tag cần deploy.

## 3. Tạo file `docker-compose.yml`

Trong thư mục `/app`, tạo file:

```bash
nano docker-compose.yml
```

Dán nội dung sau:

```yaml
services:
  o24-wfo:
    image: justintimesolutions/cmi_o24wfo:${IMAGE_TAG}
    container_name: o24-wfo
    restart: always

    ports:
      - "${API_WFO_PORT}:109"
      - "${GRPC_WFO_PORT}:105"

    env_file:
      - .env

    volumes:
      - /var/log/cmi/o24wfo:/app/logs

    depends_on:
      - o24-redis
      - o24-rabbmit

    networks:
      - o24openapi-network

  o24-log:
    image: justintimesolutions/cmi_o24log:${IMAGE_TAG}
    container_name: o24-log
    restart: always

    ports:
      - "${API_LOG_PORT}:5030"
      - "${GRPC_LOG_PORT}:5031"

    env_file:
      - .env

    volumes:
      - /var/log/cmi/o24log:/app/logs

    depends_on:
      - o24-redis
      - o24-rabbmit

    networks:
      - o24openapi-network

  o24-cms:
    image: justintimesolutions/cmi_o24cms:${IMAGE_TAG}
    container_name: o24-cms
    restart: always

    ports:
      - "${API_CMS_PORT}:5000"
      - "${GRPC_CMS_PORT}:50001"

    env_file:
      - .env

    volumes:
      - /var/log/cmi/o24cms:/app/logs
      - /home/cms/app/secret:/app/secret
      - /home/cms/app/StaticConfig:/app/StaticConfig

    depends_on:
      - o24-redis
      - o24-rabbmit

    networks:
      - o24openapi-network

  o24-cth:
    image: justintimesolutions/cmi_o24cth:${IMAGE_TAG}
    container_name: o24-cth
    restart: always

    ports:
      - "${API_CTH_PORT}:5070"
      - "${GRPC_CTH_PORT}:5071"

    env_file:
      - .env

    volumes:
      - /var/log/cmi/o24cth:/app/logs

    depends_on:
      - o24-redis
      - o24-rabbmit

    networks:
      - o24openapi-network

  o24-cbg:
    image: justintimesolutions/cmi_o24cbg:${IMAGE_TAG}
    container_name: o24-cbg
    restart: always

    ports:
      - "${API_CBG_PORT}:5040"
      - "${GRPC_CBG_PORT}:5041"

    env_file:
      - .env

    volumes:
      - /var/log/cmi/o24cbg:/app/logs

    depends_on:
      - o24-redis
      - o24-rabbmit

    networks:
      - o24openapi-network

  o24-nch:
    image: justintimesolutions/cmi_o24nch:${IMAGE_TAG}
    container_name: o24-nch
    restart: always

    ports:
      - "${API_NCH_PORT}:5090"
      - "${GRPC_NCH_PORT}:5091"

    env_file:
      - .env

    volumes:
      - /var/log/cmi/o24nch:/app/logs
      - /home/cms/app/secret:/app/secret

    depends_on:
      - o24-redis
      - o24-rabbmit

    networks:
      - o24openapi-network

  o24-redis:
    image: redis:7-alpine
    container_name: o24-redis
    restart: always

    command: >
      redis-server
      --appendonly yes

    volumes:
      - o24_redis_data:/data

    networks:
      - o24openapi-network

  o24-rabbmit:
    image: rabbitmq:3-management-alpine
    container_name: o24-rabbmit
    restart: always

    ports:
      - "${RABBITMQ_PORT}:5672"
      - "${RABBITMQ_MANAGEMENT_PORT}:15672"

    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}

    volumes:
      - o24_rabbitmq_data:/var/lib/rabbitmq

    networks:
      - o24openapi-network

networks:
  o24openapi-network:

volumes:
  o24_redis_data:
  o24_rabbitmq_data:
```

Lưu file:

```txt
Ctrl + O
Enter
Ctrl + X
```

> Lưu ý: service đang dùng tên `o24-rabbmit`. Tên này đang được các service `depends_on` tham chiếu tới, nên giữ nguyên để tránh lỗi compose.

## 4. Kiểm tra file Docker Compose

Chạy:

```bash
cd /app
docker compose config
```

Nếu file đúng, Docker sẽ in ra cấu hình compose đã được resolve biến môi trường.

Nếu gặp lỗi YAML, kiểm tra tab:

```bash
grep -nP '\t' docker-compose.yml
```

Thay tab bằng space:

```bash
sed -i 's/\t/  /g' docker-compose.yml
```

Kiểm tra lại:

```bash
docker compose config
```

## 5. Pull image

```bash
cd /app
docker compose pull
```

Nếu gặp lỗi quyền truy cập image:

```txt
pull access denied
```

Cần kiểm tra:

- Đã `docker login` chưa.
- Tài khoản Docker Hub có quyền pull image chưa.
- Tên image/tag có đúng chưa.
- `IMAGE_TAG` trong `.env` có tồn tại trên Docker Hub chưa.

## 6. Chạy O24Service API

```bash
cd /app
docker compose up -d
```

Kiểm tra container:

```bash
docker ps
```

Kết quả mong muốn có các container:

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

## 7. Kiểm tra logs

Xem log từng service:

```bash
docker logs -f o24-wfo
```

```bash
docker logs -f o24-log
```

```bash
docker logs -f o24-cms
```

```bash
docker logs -f o24-cth
```

```bash
docker logs -f o24-cbg
```

```bash
docker logs -f o24-nch
```

Xem log Redis:

```bash
docker logs -f o24-redis
```

Xem log RabbitMQ:

```bash
docker logs -f o24-rabbmit
```

Thoát log:

```txt
Ctrl + C
```

## 8. Kiểm tra port đang mở

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Hoặc kiểm tra bằng `ss`:

```bash
ss -lntp
```

Các port chính:

```txt
109     O24 WFO API
105     O24 WFO gRPC
5030    O24 LOG API
5031    O24 LOG gRPC
5000    O24 CMS API
50001   O24 CMS gRPC
5070    O24 CTH API
5071    O24 CTH gRPC
5040    O24 CBG API
5041    O24 CBG gRPC
5090    O24 NCH API
5091    O24 NCH gRPC
5672    RabbitMQ
15672   RabbitMQ Management
```

## 9. Truy cập RabbitMQ Management

Mở trình duyệt:

```txt
http://<SERVER_IP>:15672
```

Thông tin đăng nhập theo file `.env`:

```txt
Username: admin
Password: RabbitMQ@2026
```

## 10. Mở firewall nếu cần

Nếu server dùng UFW, mở các port cần truy cập từ bên ngoài.

Ví dụ mở RabbitMQ Management:

```bash
sudo ufw allow 15672/tcp
```

Mở CMS API:

```bash
sudo ufw allow 5000/tcp
```

Reload UFW:

```bash
sudo ufw reload
sudo ufw status
```

Nếu server nằm trên cloud, cần mở thêm port trong Security Group hoặc firewall của cloud.

> Không nên mở toàn bộ các port API/gRPC ra internet nếu chưa có reverse proxy, VPN, Cloudflare Tunnel hoặc IP whitelist.

## 11. Restart service

Restart toàn bộ compose:

```bash
cd /app
docker compose restart
```

Restart riêng một service:

```bash
docker restart o24-cms
```

Hoặc:

```bash
cd /app
docker compose restart o24-cms
```

## 12. Stop service

Dừng toàn bộ service:

```bash
cd /app
docker compose down
```

Lệnh này xóa container và network của compose, nhưng vẫn giữ volume Redis/RabbitMQ.

Chạy lại:

```bash
docker compose up -d
```

## 13. Update version image

Sửa file `.env`:

```bash
nano /app/.env
```

Đổi:

```env
IMAGE_TAG=latest
```

thành tag mới, ví dụ:

```env
IMAGE_TAG=2026.07.06
```

Sau đó pull và chạy lại:

```bash
cd /app
docker compose pull
docker compose up -d
```

Kiểm tra:

```bash
docker ps
```

## 14. Xóa toàn bộ dữ liệu Redis/RabbitMQ nếu cần

Chỉ chạy khi chắc chắn muốn xóa dữ liệu queue/cache.

Dừng compose:

```bash
cd /app
docker compose down
```

Xóa volume:

```bash
docker volume rm app_o24_redis_data
docker volume rm app_o24_rabbitmq_data
```

Nếu volume được tạo với tên khác, kiểm tra:

```bash
docker volume ls | grep o24
```

## 15. Lỗi thường gặp

### Lỗi 1: Image không tồn tại hoặc không pull được

Lỗi:

```txt
pull access denied
repository does not exist
```

Kiểm tra:

```bash
docker login
docker compose pull
```

Kiểm tra tên image trong `docker-compose.yml`:

```txt
justintimesolutions/cmi_o24wfo
justintimesolutions/cmi_o24log
justintimesolutions/cmi_o24cms
justintimesolutions/cmi_o24cth
justintimesolutions/cmi_o24cbg
justintimesolutions/cmi_o24nch
```

Kiểm tra tag:

```bash
cat /app/.env | grep IMAGE_TAG
```

### Lỗi 2: Port đã được sử dụng

Lỗi:

```txt
Bind for 0.0.0.0:5000 failed: port is already allocated
```

Kiểm tra process/container đang dùng port:

```bash
sudo lsof -i :5000
```

Hoặc:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 5000
```

Cách xử lý:

- Đổi port trong `.env`.
- Hoặc dừng service đang dùng port đó.

Ví dụ đổi:

```env
API_CMS_PORT=5010
```

Sau đó chạy lại:

```bash
cd /app
docker compose up -d
```

### Lỗi 3: Container restart liên tục

Kiểm tra log:

```bash
docker logs --tail=200 o24-cms
```

Kiểm tra toàn bộ container:

```bash
docker ps -a
```

Nguyên nhân thường gặp:

- Thiếu biến môi trường trong `.env`.
- Không kết nối được SQL Server.
- Không kết nối được Redis/RabbitMQ.
- Thiếu file trong `/home/cms/app/secret`.
- Sai cấu hình trong `/home/cms/app/StaticConfig`.

### Lỗi 4: Service không kết nối được RabbitMQ

Kiểm tra RabbitMQ:

```bash
docker logs -f o24-rabbmit
```

Kiểm tra container RabbitMQ đang chạy:

```bash
docker ps | grep o24-rabbmit
```

Kiểm tra biến môi trường:

```bash
cat /app/.env | grep RABBITMQ
```

Trong cùng Docker Compose, hostname RabbitMQ nên dùng:

```txt
o24-rabbmit
```

Port nội bộ:

```txt
5672
```

### Lỗi 5: Service không kết nối được Redis

Kiểm tra Redis:

```bash
docker logs -f o24-redis
```

Trong cùng Docker Compose, hostname Redis nên dùng:

```txt
o24-redis
```

Port nội bộ:

```txt
6379
```

## 16. Kết luận

Sau bước này, các O24Service API đã được chạy bằng Docker Compose trong thư mục `/app`.

Thông tin chính:

```txt
Deploy folder: /app
Compose file: /app/docker-compose.yml
Env file: /app/.env
Log folder: /var/log/cmi
Secret folder: /home/cms/app/secret
Static config folder: /home/cms/app/StaticConfig
RabbitMQ Management: http://<SERVER_IP>:15672
```

Các lệnh dùng nhiều:

```bash
cd /app
docker compose up -d
docker compose pull
docker compose restart
docker compose down
docker ps
docker logs -f o24-cms
```