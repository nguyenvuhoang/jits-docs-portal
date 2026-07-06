# Cài đặt Docker trên Ubuntu 26.04

Tài liệu này hướng dẫn cài đặt Docker Engine trên Ubuntu 26.04 LTS dùng Docker APT repository chính thức.

## 1. Kiểm tra hệ điều hành

Chạy lệnh sau để kiểm tra phiên bản Ubuntu:

```bash
lsb_release -a
```

Hoặc:

```bash
cat /etc/os-release
```

Kết quả mong muốn là Ubuntu 26.04.

## 2. Gỡ các gói Docker cũ nếu có

Trước khi cài Docker bản chính thức, nên gỡ các package cũ hoặc package không chính thức để tránh xung đột.

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove -y $pkg
done
```

Nếu hệ thống báo package không tồn tại thì có thể bỏ qua.

## 3. Cập nhật hệ thống và cài gói phụ thuộc

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

## 4. Thêm Docker GPG key

Tạo thư mục chứa key:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

Tải Docker GPG key:

```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

Cấp quyền đọc cho key:

```bash
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

## 5. Thêm Docker APT repository

```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Sau đó cập nhật lại package index:

```bash
sudo apt update
```

## 6. Cài Docker Engine

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 7. Kiểm tra trạng thái Docker

```bash
sudo systemctl status docker
```

Nếu Docker chưa chạy, start bằng lệnh:

```bash
sudo systemctl start docker
```

Enable Docker tự khởi động cùng hệ thống:

```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

## 8. Kiểm tra Docker hoạt động

Chạy container test:

```bash
sudo docker run hello-world
```

Nếu cài đặt thành công, Docker sẽ tải image `hello-world`, chạy container và hiển thị thông báo xác nhận.

## 9. Cho phép user hiện tại chạy Docker không cần sudo

Thêm user hiện tại vào group `docker`:

```bash
sudo usermod -aG docker $USER
```

Áp dụng group mới:

```bash
newgrp docker
```

Kiểm tra lại:

```bash
docker run hello-world
```

Nếu lệnh chạy được mà không cần `sudo`, cấu hình đã thành công.

> Lưu ý bảo mật: user thuộc group `docker` có quyền rất cao trên máy chủ, gần tương đương root. Chỉ thêm các user đáng tin cậy vào group này.

## 10. Kiểm tra phiên bản Docker và Docker Compose

```bash
docker --version
docker compose version
```

Ví dụ kết quả:

```txt
Docker version xx.x.x
Docker Compose version vx.x.x
```

## 11. Một số lệnh Docker cơ bản

Xem danh sách container đang chạy:

```bash
docker ps
```

Xem tất cả container:

```bash
docker ps -a
```

Xem danh sách image:

```bash
docker images
```

Tải image:

```bash
docker pull nginx:latest
```

Chạy thử Nginx container:

```bash
docker run -d --name nginx-test -p 8080:80 nginx:latest
```

Kiểm tra container:

```bash
docker ps
```

Truy cập thử:

```txt
http://<SERVER_IP>:8080
```

Xóa container test:

```bash
docker rm -f nginx-test
```

## 12. Cấu hình log rotation cho Docker

Docker mặc định có thể ghi log container lớn dần theo thời gian. Nên cấu hình giới hạn log để tránh đầy disk.

Tạo hoặc sửa file:

```bash
sudo nano /etc/docker/daemon.json
```

Thêm nội dung:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "5"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

Kiểm tra Docker sau khi restart:

```bash
docker ps
```

## 13. Lưu ý khi dùng UFW với Docker

Nếu server dùng UFW, cần lưu ý rằng khi Docker publish port bằng `-p`, traffic vào container có thể không đi theo rule UFW thông thường.

Ví dụ:

```bash
docker run -d -p 8080:80 nginx
```

Port `8080` có thể được mở bởi Docker dù UFW chưa allow rõ ràng. Khi vận hành production cần kiểm tra kỹ rule firewall, security group hoặc reverse proxy phía trước.

## 14. Gỡ Docker khi cần

Gỡ package Docker:

```bash
sudo apt purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
```

Nếu muốn xóa toàn bộ dữ liệu Docker gồm image, container, volume:

```bash
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

Xóa Docker repository và key:

```bash
sudo rm -f /etc/apt/sources.list.d/docker.sources
sudo rm -f /etc/apt/keyrings/docker.asc
```

## 15. Kết luận

Sau bước này, server Ubuntu 26.04 đã có Docker Engine, Docker CLI, Buildx và Docker Compose plugin.

Các bước tiếp theo thường là:

1. Cài Portainer để quản lý Docker bằng giao diện web.
2. Tạo Docker network dùng chung cho các service.
3. Cài SQL Server, Redis, RabbitMQ hoặc các service cần thiết bằng Docker Compose.
