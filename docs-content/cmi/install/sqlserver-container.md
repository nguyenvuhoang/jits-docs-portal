# Bước 4: Cài đặt SQL Server container

Tài liệu này hướng dẫn cài đặt Microsoft SQL Server bằng Docker Compose trên Ubuntu 26.04.

Sau bước này, server sẽ có một SQL Server container chạy port `1433`.

## 1. Điều kiện trước khi cài

Server cần đã cài Docker và Docker Compose plugin.

Kiểm tra:

```bash
docker --version
docker compose version
```

Kiểm tra Docker đang chạy:

```bash
docker ps
```

Nếu chưa có Docker network dùng chung, tạo network trước:

```bash
docker network create o24-network
```

Nếu network đã tồn tại, lệnh trên có thể báo lỗi. Có thể kiểm tra bằng:

```bash
docker network ls
```

## 2. Tạo thư mục cài đặt SQL Server

```bash
sudo mkdir -p /opt/sqlserver
sudo chown -R $USER:$USER /opt/sqlserver
cd /opt/sqlserver
```

## 3. Tạo file `.env`

Tạo file:

```bash
nano .env
```

Nội dung mẫu:

```env
MSSQL_SA_PASSWORD=Cmi@Password2026
MSSQL_PID=Express
```

Trong đó:

- `MSSQL_SA_PASSWORD` là mật khẩu user `sa`.
- `MSSQL_PID=Express` dùng bản Express cho môi trường UAT.
- Production cần kiểm tra license phù hợp trước khi dùng.

Mật khẩu `sa` nên đủ mạnh:

```txt
Tối thiểu 8 ký tự, có ít nhất 3 trong 4 nhóm:
- Chữ hoa
- Chữ thường
- Số
- Ký tự đặc biệt
```

Ví dụ mật khẩu hợp lệ:

```txt
SqlServer@2026
```

Không dùng mật khẩu yếu kiểu:

```txt
123456
password
Password123
```

## 4. Tạo file Docker Compose

Tạo file:

```bash
nano docker-compose.yml
```

Nội dung:

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sqlserver
    hostname: sqlserver
    restart: always
    env_file:
      - .env
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_PID: "${MSSQL_PID}"
      MSSQL_SA_PASSWORD: "${MSSQL_SA_PASSWORD}"
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql
    networks:
      - o24-network

volumes:
  mssql_data:
    name: mssql_data

networks:
  o24-network:
    external: true
```

Giải thích nhanh:

- `image`: dùng SQL Server 2022 image chính thức từ Microsoft.
- `container_name`: tên container là `sqlserver`.
- `hostname`: hostname nội bộ trong Docker network.
- `1433:1433`: publish SQL Server ra port 1433 của host.
- `mssql_data:/var/opt/mssql`: lưu dữ liệu SQL Server vào Docker volume.
- `o24-network`: network dùng chung cho các service khác kết nối vào SQL Server.

## 5. Kiểm tra file compose

Chạy:

```bash
docker compose config
```

Nếu không có lỗi YAML thì tiếp tục.

Nếu gặp lỗi tab YAML, kiểm tra:

```bash
grep -nP '\t' docker-compose.yml
```

Thay tab bằng space:

```bash
sed -i 's/\t/  /g' docker-compose.yml
```

## 6. Khởi chạy SQL Server

Trong thư mục `/opt/sqlserver`, chạy:

```bash
docker compose up -d
```

Kiểm tra container:

```bash
docker ps
```

Kết quả mong muốn:

```txt
CONTAINER ID   IMAGE                                      STATUS         PORTS                    NAMES
xxxxxxxxxxxx   mcr.microsoft.com/mssql/server:2022-latest Up             0.0.0.0:1433->1433/tcp   sqlserver
```

## 7. Xem log SQL Server

SQL Server có thể cần vài chục giây để khởi động.

Xem log:

```bash
docker logs -f sqlserver
```

Hoặc kiểm tra dòng báo sẵn sàng:

```bash
docker exec -t sqlserver cat /var/opt/mssql/log/errorlog | grep connection
```

Khi thấy nội dung tương tự sau là SQL Server đã sẵn sàng:

```txt
SQL Server is now ready for client connections
```

Thoát log bằng:

```txt
Ctrl + C
```

## 8. Kiểm tra kết nối bằng sqlcmd trong container

Vào shell container:

```bash
docker exec -it sqlserver bash
```

Kết nối SQL Server:

```bash
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C
```

Nếu thành công sẽ vào prompt:

```txt
1>
```

Chạy thử:

```sql
SELECT @@VERSION;
GO
```

Thoát sqlcmd:

```sql
QUIT
```

Thoát container:

```bash
exit
```

## 9. Chạy query nhanh từ ngoài container

Không cần vào shell container, có thể chạy trực tiếp:

```bash
docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "$MSSQL_SA_PASSWORD" \
  -C \
  -Q "SELECT @@VERSION;"
```

Nếu biến `$MSSQL_SA_PASSWORD` không có ở shell host, dùng cách này:

```bash
source .env

docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "$MSSQL_SA_PASSWORD" \
  -C \
  -Q "SELECT @@VERSION;"
```

## 10. Mở firewall nếu cần

Nếu chỉ dùng nội bộ Docker network, không cần mở firewall ra ngoài.

Nếu cần kết nối từ LAN, nên allow theo subnet cụ thể thay vì mở toàn bộ internet.

Ví dụ allow LAN `192.168.1.0/24`:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 1433 proto tcp
sudo ufw reload
sudo ufw status
```

Nếu đang dùng cloud server như AWS, Azure, Oracle Cloud, cũng cần mở port `1433` trong Security Group hoặc firewall của cloud.

Không khuyến nghị mở public như sau nếu không có VPN/WARP/IP whitelist:

```bash
sudo ufw allow 1433/tcp
```

## 11. Kiểm tra port 1433 trên host

Trên server:

```bash
ss -lntp | grep 1433
```

Hoặc:

```bash
docker port sqlserver
```

Kết quả mong muốn:

```txt
1433/tcp -> 0.0.0.0:1433
```

Từ máy client trong LAN:

```bash
telnet <SERVER_IP> 1433
```

Hoặc dùng PowerShell trên Windows:

```powershell
Test-NetConnection <SERVER_IP> -Port 1433
```

## 12. Backup database

Tạo thư mục backup trong container:

```bash
docker exec -it sqlserver mkdir -p /var/opt/mssql/backup
```

Backup database `AppDB`:

```bash
source .env

docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "$MSSQL_SA_PASSWORD" \
  -C \
  -Q "BACKUP DATABASE AppDB TO DISK = N'/var/opt/mssql/backup/AppDB.bak' WITH INIT;"
```

Copy file backup ra host:

```bash
docker cp sqlserver:/var/opt/mssql/backup/AppDB.bak /opt/sqlserver/AppDB.bak
```

Kiểm tra file:

```bash
ls -lh /opt/sqlserver/AppDB.bak
```

## 13. Restore database từ file `.bak`

Copy file backup vào container:

```bash
docker cp /opt/sqlserver/AppDB.bak sqlserver:/var/opt/mssql/backup/AppDB.bak
```

Kiểm tra logical file name:

```bash
source .env

docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "$MSSQL_SA_PASSWORD" \
  -C \
  -Q "RESTORE FILELISTONLY FROM DISK = N'/var/opt/mssql/backup/AppDB.bak';"
```

Restore database:

```bash
source .env

docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "$MSSQL_SA_PASSWORD" \
  -C \
  -Q "
RESTORE DATABASE AppDB_Restore
FROM DISK = N'/var/opt/mssql/backup/AppDB.bak'
WITH
  MOVE 'AppDB' TO '/var/opt/mssql/data/AppDB_Restore.mdf',
  MOVE 'AppDB_log' TO '/var/opt/mssql/data/AppDB_Restore_log.ldf',
  REPLACE;
"
```

> Lưu ý: `MOVE 'AppDB'` và `MOVE 'AppDB_log'` phải đúng theo logical name lấy từ lệnh `RESTORE FILELISTONLY`.

## 14. Restart SQL Server container

```bash
docker restart sqlserver
```

Hoặc:

```bash
cd /opt/sqlserver
docker compose restart
```

## 15. Stop SQL Server

```bash
cd /opt/sqlserver
docker compose down
```

Lệnh này xóa container nhưng giữ volume `mssql_data`, nên dữ liệu database vẫn còn.

Start lại:

```bash
docker compose up -d
```

## 16. Xóa hoàn toàn SQL Server và dữ liệu

Chỉ chạy khi chắc chắn muốn xóa toàn bộ database.

```bash
cd /opt/sqlserver
docker compose down
docker volume rm mssql_data
```

Kiểm tra lại:

```bash
docker volume ls | grep mssql
```

## 17. Các lỗi thường gặp

### Lỗi 1: Container tự thoát ngay sau khi chạy

Kiểm tra log:

```bash
docker logs sqlserver
```

Nguyên nhân thường gặp:

- Chưa accept EULA.
- Sai biến môi trường `MSSQL_SA_PASSWORD`.
- Mật khẩu `sa` quá yếu.
- Host thiếu RAM.
- Port `1433` đã bị service khác dùng.

Kiểm tra port:

```bash
sudo lsof -i :1433
```

### Lỗi 2: Login failed for user sa

Nguyên nhân thường gặp:

- Nhập sai password.
- SQL Server chưa khởi động xong.
- Password trong `.env` khác password đã khởi tạo ban đầu.

Kiểm tra log:

```bash
docker logs -f sqlserver
```

Nếu đã tạo volume rồi, sau đó đổi `MSSQL_SA_PASSWORD` trong `.env`, password `sa` cũ trong database không tự đổi theo.

Muốn đổi password `sa`, dùng lệnh:

```bash
source .env

docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "$MSSQL_SA_PASSWORD" \
  -C \
  -Q "ALTER LOGIN sa WITH PASSWORD = 'NewStrong@Password2026';"
```

### Lỗi 3: Không kết nối được từ máy khác

Kiểm tra container:

```bash
docker ps
```

Kiểm tra port:

```bash
ss -lntp | grep 1433
```

Kiểm tra firewall:

```bash
sudo ufw status
```

Kiểm tra cloud security group nếu server nằm trên cloud.

### Lỗi 4: Application container không kết nối được SQL Server

Nếu application chạy cùng Docker network, connection string nên dùng hostname container:

```txt
Server=sqlserver,1433;Database=AppDB;User Id=app_user;Password=AppUser@2026;TrustServerCertificate=True;Encrypt=True;
```

Không nên dùng:

```txt
Server=localhost,1433
```

Vì `localhost` bên trong container app là chính container app, không phải SQL Server container.

## 18. Kết luận

Sau bước này, SQL Server đã chạy bằng Docker Compose với dữ liệu lưu trong volume `mssql_data`.

Thông tin chính:

```txt
Container: sqlserver
Image: mcr.microsoft.com/mssql/server:2022-latest
Port: 1433
Volume: mssql_data
Network: o24-network
Default admin user: sa
```

Các bước tiếp theo:

1. Cài Redis container.
2. Cài RabbitMQ container.
3. Cấu hình connection string cho ứng dụng.
4. Backup/restore database thật nếu cần migrate dữ liệu.