# Hướng dẫn sử dụng API bằng Postwoman

Tài liệu này hướng dẫn cách kết nối Postwoman Desktop vào instance nội bộ của JITS, đăng nhập và sử dụng workspace `CMI` để gọi thử API.

## 1. Mục tiêu

Sau khi hoàn thành bước này, người dùng có thể:

- Kết nối Postwoman Desktop tới server Postwoman nội bộ.
- Đăng nhập bằng device login.
- Chọn workspace `CMI`.
- Sử dụng sẵn collection API đã được cấu hình.
- Gọi thử API trong 2 nhóm chính:
  - `CMICOREAPI DEV`
  - `CMIPORTAL`

## 2. Mở Postwoman Desktop

Mở ứng dụng Postwoman Desktop trên máy tính.

Nếu chưa cài, tải bản Windows tại đây:

[⬇️ Download Postwoman Windows](https://github.com/hoppscotch/releases/releases/latest/download/Hoppscotch_win_x64.msi)

Sau khi mở app, nhìn góc trên bên trái sẽ thấy menu:

```txt
HOPPSCOTCH
```

Click vào menu này để mở phần chọn instance.

## 3. Add self-hosted instance

Trong menu `HOPPSCOTCH`, chọn:

```txt
Add an instance
```

Sau đó nhập instance nội bộ của JITS:

```txt
https://postwoman.jits.com.vn:5555/desktop-app-server/api/v1/key
```

Sau khi thêm xong, trong danh sách `Self-hosted instances` sẽ thấy instance:

```txt
HTTPS://POSTWOMAN.JITS.COM.VN:5555/DESKTOP-APP-SERVER/API/V1/KEY
```

Chọn instance này để kết nối.

## 4. Đăng nhập Postwoman

Sau khi chọn instance, bấm nút đăng nhập.

Trình duyệt sẽ mở link đăng nhập dạng:

```txt
https://postwoman.jits.com.vn:5555/device-login?redirect_uri=http%3A%2F%2Flocalhost%3A15001%2Fdevice-token
```

Thực hiện login theo tài khoản được cấp.

Sau khi login thành công, quay lại ứng dụng Postwoman/Hoppscotch Desktop.

## 5. Chọn workspace CMI

Ở góc trên bên phải, chọn workspace:

```txt
CMI
```

Nếu login đúng tài khoản và đã được phân quyền, workspace `CMI` sẽ hiển thị sẵn.

Trong workspace này đã có sẵn các folder/collection API phục vụ test.

## 6. Các folder API có sẵn

Sau khi chọn workspace `CMI`, ở sidebar bên phải sẽ thấy các folder chính:

```txt
CMICOREAPI DEV
CMIPORTAL
```

Trong đó:

| Folder | Mục đích |
|---|---|
| `CMICOREAPI DEV` | Chứa các API Core/Workflow của CMI |
| `CMIPORTAL` | Chứa các API Gateway/Portal của CMI |

## 7. Chọn Environment

Ở thanh trên cùng, chọn environment tương ứng.

Ví dụ:

```txt
DEV
```

Hoặc environment được team cấu hình sẵn cho workspace `CMI`.

Nếu không chọn đúng environment, các biến như endpoint/token/session có thể bị rỗng, dẫn đến gọi API lỗi.

## 8. Kiểm tra biến môi trường

Các biến thường dùng gồm:

```txt
URL_CMS
URL_CMS_STATIC_TOKEN
URL_CMS_REFRESH_STATIC_TOKEN
PORTAL_API_URL
CMS_TOKEN
CMS_REFRESH_TOKEN
UID_TOKEN
UID_REFRESH_TOKEN
SESSIONID
PORTAL_TOKEN
```

Trong đó:

| Biến | Ý nghĩa |
|---|---|
| `URL_CMS` | Endpoint execute COREAPI |
| `URL_CMS_STATIC_TOKEN` | Endpoint tạo static token |
| `URL_CMS_REFRESH_STATIC_TOKEN` | Endpoint refresh static token |
| `PORTAL_API_URL` | Endpoint gateway của CMI Portal |
| `CMS_TOKEN` | Token dùng cho Authorization Bearer |
| `UID_TOKEN` | Token user/session dùng trong header `uid` |
| `SESSIONID` | Session dùng cho các workflow giao dịch FO |

## 9. Thứ tự gọi API khuyến nghị

Khi test API Core, nên gọi theo thứ tự:

```txt
1. CREATE_STATIC_TOKEN
2. UMG_LOGIN
3. Gọi API nghiệp vụ
```

Trong đó:

- `CREATE_STATIC_TOKEN` dùng để lấy `CMS_TOKEN`.
- `UMG_LOGIN` dùng để lấy `UID_TOKEN`, `UID_REFRESH_TOKEN`, `SESSIONID`.
- Các API nghiệp vụ dùng `CMS_TOKEN`, `UID_TOKEN`, `SESSIONID`.

## 10. Gọi CREATE_STATIC_TOKEN

Vào folder:

```txt
CMICOREAPI DEV
  → CMIOPENAPI
  → CREATE_STATIC_TOKEN
```

Bấm:

```txt
Send
```

Sau khi gọi thành công, script trong request sẽ tự lưu:

```txt
CMS_TOKEN
CMS_REFRESH_TOKEN
```

## 11. Gọi UMG_LOGIN

Vào request:

```txt
CMICOREAPI DEV
  → CMIOPENAPI
  → UMG_LOGIN
```

Bấm:

```txt
Send
```

Sau khi gọi thành công, script trong request sẽ tự lưu:

```txt
UID_TOKEN
UID_REFRESH_TOKEN
SESSIONID
```

## 12. Gọi API nghiệp vụ

Ví dụ gọi API lấy thông tin khách hàng:

```txt
CMICOREAPI DEV
  → CMIOPENAPI
  → FUNC_CUSTOMER_GET
```

Request thường dùng:

```txt
Method: POST
Endpoint: <<URL_CMS>>
Authorization: Bearer <<CMS_TOKEN>>
Header uid: <<UID_TOKEN>>
```

Body mẫu:

```json
{
  "workflow_id": "COREAPI_GET_INFO",
  "data": {
    "transaction_code": "FUNC_CUSTOMER_GET",
    "end_to_end": "a1b2c3d4-0000-0000-0000-111111111111",
    "fields": {
      "CUSTOMERCD": "0001000042"
    }
  }
}
```

## 13. Cấu trúc request COREAPI_GET_INFO

Dùng cho các API lấy thông tin.

```json
{
  "workflow_id": "COREAPI_GET_INFO",
  "data": {
    "transaction_code": "FUNC_CUSTOMER_GET",
    "end_to_end": "a1b2c3d4-0000-0000-0000-111111111111",
    "fields": {}
  }
}
```

## 14. Cấu trúc request COREAPI_FO

Dùng cho các workflow giao dịch.

```json
{
  "workflow_id": "COREAPI_FO",
  "data": {
    "transaction_code": "LMS_DPT01",
    "session_id": "<<SESSIONID>>",
    "end_to_end": "0000019e-f769-67d8-0000-019ef76967e1",
    "fields": {}
  }
}
```

## 15. Các API mẫu trong CMICOREAPI DEV

Một số request thường dùng:

| Request | Mục đích |
|---|---|
| `UMG_LOGIN` | Đăng nhập lấy user token/session |
| `CREATE_STATIC_TOKEN` | Tạo CMS static token |
| `REFRESH_STATIC_TOKEN` | Refresh CMS static token |
| `FUNC_CUSTOMER_GET` | Lấy thông tin khách hàng |
| `LMS_CTM01` | Tạo khách hàng |
| `LMS_CTM02` | Cập nhật/chuyển thông tin khách hàng |
| `LMS_DPT01` | Mở tài khoản tiền gửi |
| `LMS_DPT02` | Cập nhật thông tin tiền gửi |
| `LMS_DPT03` | Giao dịch tiền gửi |
| `FUNC_DEPOSIT_GET` | Lấy thông tin tài khoản tiền gửi |
| `FUNC_DEPOSIT_GET_BALANCE` | Lấy số dư tiền gửi |
| `LMS_CRD01` | Mở khoản vay |
| `FUNC_LOAN_GET_BALANCE` | Lấy thông tin/số dư khoản vay |
| `FUNC_LOAN_GET_SCHEDULE` | Lấy lịch trả nợ |
| `FUNC_LOAN_CALC_CLOSING_OS` | Tính toán tất toán khoản vay |

## 16. Sử dụng folder CMIPORTAL

Folder:

```txt
CMIPORTAL
```

dùng để test các API phía Portal/Gateway.

Các request trong folder này thường gọi endpoint:

```txt
<<PORTAL_API_URL>>
```

Khi test Portal API, kiểm tra các biến:

```txt
PORTAL_API_URL
PORTAL_TOKEN
```

## 17. Lỗi thường gặp

### Không thấy workspace CMI

Nguyên nhân:

- Login sai tài khoản.
- Tài khoản chưa được add vào workspace `CMI`.
- Chưa chọn đúng self-hosted instance.

Cách xử lý:

```txt
1. Kiểm tra instance đang chọn là postwoman.jits.com.vn:5555
2. Logout/login lại
3. Liên hệ admin để add tài khoản vào workspace CMI
```

### Không thấy folder CMICOREAPI DEV hoặc CMIPORTAL

Nguyên nhân:

- Đang đứng sai workspace.
- Collection chưa được share vào workspace.
- Tài khoản chưa có quyền xem collection.

Cách xử lý:

```txt
1. Chọn lại workspace CMI
2. Refresh app
3. Kiểm tra quyền workspace
```

### Gọi API bị 401 Unauthorized

Nguyên nhân:

- Chưa chọn environment.
- `CMS_TOKEN` rỗng hoặc hết hạn.
- Chưa gọi `CREATE_STATIC_TOKEN`.
- Authorization chưa dùng đúng `Bearer <<CMS_TOKEN>>`.

Cách xử lý:

```txt
1. Chọn đúng Environment DEV
2. Gọi CREATE_STATIC_TOKEN
3. Gọi lại API nghiệp vụ
```

### Header uid rỗng

Nguyên nhân:

- Chưa gọi `UMG_LOGIN`.
- `UID_TOKEN` chưa được set.

Cách xử lý:

```txt
1. Gọi UMG_LOGIN
2. Kiểm tra biến UID_TOKEN
3. Gọi lại request nghiệp vụ
```

### Endpoint không đúng

Kiểm tra các biến:

```txt
URL_CMS
PORTAL_API_URL
```

Nếu endpoint sai môi trường, sửa lại environment hoặc chọn đúng environment.

## 18. Ghi chú bảo mật

Không chia sẻ token, refresh token, session hoặc client secret ra ngoài.

Nếu cần gửi file environment cho đối tác, nên tạo bản sample và xóa các giá trị nhạy cảm:

```txt
CMS_TOKEN
CMS_REFRESH_TOKEN
UID_TOKEN
UID_REFRESH_TOKEN
SESSIONID
PORTAL_TOKEN
clientSecret
```

## 19. Kết luận

Sau khi hoàn thành, người dùng chỉ cần:

```txt
1. Mở Postwoman Desktop
2. Chọn instance JITS
3. Login
4. Chọn workspace CMI
5. Chọn collection CMICOREAPI DEV hoặc CMIPORTAL
6. Chọn Environment DEV
7. Gửi request
```