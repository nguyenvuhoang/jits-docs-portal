# Bước 2: Cài đặt Portainer trên Ubuntu 26.04

Tài liệu này hướng dẫn cài đặt Portainer CE để quản lý Docker bằng giao diện web.

Portainer sẽ giúp quản lý:

- Containers
- Images
- Volumes
- Networks
- Docker Compose stacks
- Logs container
- Restart/stop/start container

## 1. Điều kiện trước khi cài

Server cần hoàn thành bước trước:

```bash
docker --version
docker compose version
```

Kiểm tra Docker đang chạy:

```bash
sudo systemctl status docker
```

Hoặc:

```bash
docker ps
```

Nếu lệnh `docker ps` chạy được thì có thể tiếp tục cài Portainer.

## 2. Tạo thư mục cài đặt Portainer

```bash
sudo mkdir -p /opt/portainer
sudo chown -R $USER:$USER /opt/portainer
cd /opt/portainer
```

## 3. Tạo file Docker Compose

Tạo file:

```bash
nano docker-compose.yml
```

Nội dung:

```yaml
services:
  portainer:
    image: portainer/portainer-ce:lts
    container_name: portainer
    restart: always
    ports:
      - "9443:9443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data

volumes:
  portainer_data:
    name: portainer_data
```

Trong cấu hình trên:

- `9443` là port truy cập giao diện Portainer qua HTTPS.
- `/var/run/docker.sock` cho phép Portainer quản lý Docker Engine trên server.
- `portainer_data` dùng để lưu database và cấu hình của Portainer.

> Không mở port `8000` nếu chưa dùng Edge Agent.

## 4. Khởi chạy Portainer

Trong thư mục `/opt/portainer`, chạy:

```bash
docker compose up -d
```

Kiểm tra container:

```bash
docker ps
```

Kết quả mong muốn có container tên `portainer` đang chạy:

```txt
CONTAINER ID   IMAGE                           STATUS         PORTS                    NAMES
xxxxxxxxxxxx   portainer/portainer-ce:lts      Up             0.0.0.0:9443->9443/tcp   portainer
```

## 5. Mở firewall nếu dùng UFW

Nếu server đang bật UFW, mở port `9443`:

```bash
sudo ufw allow 9443/tcp
sudo ufw reload
sudo ufw status
```

Nếu server nằm sau cloud firewall hoặc security group, cần mở thêm port `9443` ở tầng đó.

## 6. Truy cập giao diện Portainer

Mở trình duyệt:

```txt
https://<SERVER_IP>:9443
```

Ví dụ:

```txt
https://52.74.180.169:9443
```

Portainer dùng HTTPS. Nếu trình duyệt cảnh báo certificate không tin cậy thì chọn tiếp tục truy cập.

## 7. Tạo tài khoản admin lần đầu

Ở màn hình đầu tiên, tạo tài khoản quản trị:

```txt
Username: admin
Password: <mật khẩu mạnh>
```

Nên dùng mật khẩu mạnh, tối thiểu:

- 12 ký tự trở lên
- Có chữ hoa
- Có chữ thường
- Có số
- Có ký tự đặc biệt

Sau khi tạo tài khoản, chọn môi trường Docker local để bắt đầu quản lý container trên server.

## 8. Kiểm tra Portainer quản lý được Docker

Trong giao diện Portainer:

```txt
Home
  → local
  → Containers
```

Nếu thấy danh sách container đang chạy như `portainer`, nghĩa là Portainer đã kết nối được Docker local.

## 9. Một số lệnh quản trị Portainer

Xem log:

```bash
docker logs -f portainer
```

Restart Portainer:

```bash
docker restart portainer
```

Stop Portainer:

```bash
docker stop portainer
```

Start lại Portainer:

```bash
docker start portainer
```

Kiểm tra volume dữ liệu:

```bash
docker volume ls | grep portainer
```

## 10. Cập nhật Portainer sau này

Vào thư mục cài đặt:

```bash
cd /opt/portainer
```

Pull image mới:

```bash
docker compose pull
```

Recreate container:

```bash
docker compose up -d
```

Kiểm tra lại:

```bash
docker ps
```

## 11. Gỡ Portainer nếu cần

Dừng và xóa container:

```bash
cd /opt/portainer
docker compose down
```

Lệnh trên chỉ xóa container và network, chưa xóa dữ liệu.

Nếu muốn xóa luôn dữ liệu Portainer:

```bash
docker volume rm portainer_data
```

> Chỉ xóa volume khi chắc chắn không cần giữ cấu hình, user, stack và dữ liệu Portainer cũ.

## 12. Kết luận

Sau bước này, server đã có Portainer để quản lý Docker bằng giao diện web.

Các bước tiếp theo:

1. Tạo Docker network dùng chung cho hệ thống.
2. Cài SQL Server container.
3. Cài Redis container.
4. Cài RabbitMQ container.
5. Deploy ứng dụng bằng Docker Compose.