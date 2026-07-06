# Bước 4: Cài đặt JITS KeyVault

Tài liệu này hướng dẫn clone source JITS KeyVault, cấu hình file `.env` và chạy bằng Docker Compose.

JITS KeyVault dùng để quản lý/cấu hình key, secret hoặc các thông tin cấu hình cần dùng cho hệ thống.

## 1. Điều kiện trước khi cài

Server cần đã hoàn thành các bước trước:

- Đã cài Docker.
- Đã cài Docker Compose plugin.
- Đã cài SQL Server container nếu KeyVault cần kết nối database.
- User deploy có quyền clone GitLab repository.

Kiểm tra Docker:

```bash
docker --version
docker compose version
docker ps
```

## 2. Chuẩn bị thư mục source

Nên đặt source trong `/opt` hoặc `/app`.

Ví dụ dùng `/opt`:

```bash
cd /opt
```

Nếu user hiện tại chưa có quyền ghi vào `/opt`, cấp quyền hoặc tạo thư mục riêng:

```bash
sudo mkdir -p /opt/jits
sudo chown -R $USER:$USER /opt/jits
cd /opt/jits
```

## 3. Clone source JITS KeyVault

Clone repository:

```bash
git clone https://delivery-gitlab.jits.com.vn/delivery/jits/jits-keyvault.git
```

Sau đó vào thư mục source:

```bash
cd jits-keyvault
```

Nếu gặp lỗi permission khi clone vào `/opt`:

```txt
fatal: could not create work tree dir 'jits-keyvault': Permission denied
```

Xử lý:

```bash
sudo mkdir -p /opt/jits
sudo chown -R $USER:$USER /opt/jits
cd /opt/jits
git clone https://delivery-gitlab.jits.com.vn/delivery/jits/jits-keyvault.git
cd jits-keyvault
```

Nếu repository yêu cầu đăng nhập GitLab, dùng tài khoản GitLab hoặc Personal Access Token theo quyền được cấp.

## 4. Tạo file cấu hình `.env`

Trong thư mục `jits-keyvault`, copy file mẫu:

```bash
cp .env.example .env
```

## 5. Kiểm tra Docker Compose

Kiểm tra trong thư mục source có file compose:

```bash
ls -la
```

Tìm các file liên quan:

```bash
ls -la | grep -Ei "compose|docker|env"
```

Nếu file tên là `docker-compose.yml`, kiểm tra cấu hình:

```bash
docker compose config
```

Nếu file tên khác, ví dụ `docker-compose.prod.yml`, kiểm tra bằng:

```bash
docker compose -f docker-compose.prod.yml config
```

Nếu gặp lỗi YAML do tab:

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

## 6. Build và chạy JITS KeyVault

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Kiểm tra container:

```bash
docker ps
```

Xem log:

```bash
docker compose logs -f
```

Hoặc nếu biết tên container:

```bash
docker logs -f <container_name>
```

Thoát log:

```txt
Ctrl + C
```

## 7. Kiểm tra port đang chạy

Kiểm tra container và port:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Kiểm tra port trên host:

```bash
ss -lntp
```

Nếu KeyVault publish port ra ngoài, kết quả sẽ có dạng:

```txt
0.0.0.0:<PORT>-><CONTAINER_PORT>/tcp
```

## 8. Mở firewall nếu cần

Nếu server bật UFW, mở port KeyVault đang dùng.

Ví dụ nếu KeyVault dùng port `8080`:

```bash
sudo ufw allow 8080/tcp
sudo ufw reload
sudo ufw status
```

Nếu server nằm trên cloud, cần mở port tương ứng trong Security Group hoặc firewall cloud.

## 9. Truy cập màn hình cấu hình KeyVault

Mở trình duyệt và truy cập IP server:

```txt
http://52.74.180.169
```

Nếu KeyVault chạy ở port riêng, truy cập theo dạng:

```txt
http://52.74.180.169:<PORT>
```

Ví dụ:

```txt
http://52.74.180.169:8080
```

Sau khi vào được giao diện, tiến hành cấu hình KeyVault theo thông tin dự án.

## 10. Các lệnh quản trị thường dùng

Vào thư mục source:

```bash
cd /opt/jits/jits-keyvault
```

Xem container:

```bash
docker ps
```

Xem log:

```bash
docker compose logs -f
```

Restart:

```bash
docker compose restart
```

Dừng:

```bash
docker compose down
```

Chạy lại:

```bash
docker compose up -d
```

Pull/build lại:

```bash
docker compose up -d --build
```

## 11. Update source sau này

Vào thư mục source:

```bash
cd /opt/jits/jits-keyvault
```

Pull code mới:

```bash
git pull
```

Build và chạy lại:

```bash
docker compose up -d --build
```

Kiểm tra:

```bash
docker ps
docker compose logs -f
```

## 12. Lỗi thường gặp

### Lỗi 1: Không clone được repository

Lỗi thường gặp:

```txt
Authentication failed
```

Hoặc:

```txt
Repository not found
```

Kiểm tra:

- User GitLab đã có quyền vào repository chưa.
- URL repository có đúng chưa.
- Nếu dùng HTTPS, cần username/password hoặc access token.
- Server có kết nối được đến `delivery-gitlab.jits.com.vn` không.

Kiểm tra kết nối:

```bash
ping delivery-gitlab.jits.com.vn
```

Hoặc:

```bash
curl -I https://delivery-gitlab.jits.com.vn
```

### Lỗi 2: Không có file `.env.example`

Kiểm tra danh sách file:

```bash
ls -la
```

Nếu không có `.env.example`, kiểm tra README của repository hoặc hỏi người quản lý source để lấy file cấu hình mẫu.

### Lỗi 3: Docker Compose báo thiếu biến môi trường

Lỗi có dạng:

```txt
The "XXX" variable is not set
```

Mở `.env` và bổ sung biến còn thiếu:

```bash
nano .env
```

Kiểm tra lại:

```bash
docker compose config
```

### Lỗi 4: Port đã được sử dụng

Lỗi:

```txt
Bind for 0.0.0.0:<PORT> failed: port is already allocated
```

Kiểm tra port:

```bash
sudo lsof -i :<PORT>
```

Hoặc:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep <PORT>
```

Cách xử lý:

- Đổi port trong `.env` hoặc `docker-compose.yml`.
- Hoặc dừng service đang chiếm port.

### Lỗi 5: Container restart liên tục

Kiểm tra log:

```bash
docker compose logs --tail=200
```

Nguyên nhân thường gặp:

- Sai cấu hình `.env`.
- Không kết nối được database.
- Thiếu secret/key.
- Port bị trùng.
- Image build lỗi.

## 13. Kết luận

Sau bước này, JITS KeyVault đã được clone, cấu hình `.env` và chạy bằng Docker Compose.

Thông tin chính:

```txt
Source: /opt/jits/jits-keyvault
Repository: delivery-gitlab.jits.com.vn/delivery/jits/jits-keyvault.git
Config file: .env
Run command: docker compose up -d --build
Access IP: http://52.74.180.169
```

Các lệnh dùng nhiều:

```bash
cd /opt/jits/jits-keyvault
docker compose up -d --build
docker compose logs -f
docker compose restart
docker compose down
docker ps
```