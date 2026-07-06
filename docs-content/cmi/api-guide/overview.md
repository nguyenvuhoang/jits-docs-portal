# Tổng quan API CMI COREAPI

Tài liệu này giới thiệu tổng quan cách sử dụng CMI COREAPI, bao gồm endpoint, token, format request, thứ tự gọi API và cách test bằng Hoppscotch/Postwoman.

## 1. CMI COREAPI là gì?

CMI COREAPI là lớp API trung gian dùng để gọi các workflow nghiệp vụ của hệ thống CMI/O24.

Các nhóm API chính gồm:

- Đăng nhập và lấy session.
- Tạo static token cho CMS/Core API.
- Refresh static token.
- Gọi workflow lấy thông tin.
- Gọi workflow giao dịch FO.
- Gọi các API nghiệp vụ khách hàng, tiền gửi, khoản vay.

## 2. Công cụ test API

Hệ thống đang dùng Hoppscotch/Postwoman để test API trực tiếp.

Mở playground tại:

[🚀 Mở API Playground](/user-guide/cmi/playground)

Nếu muốn dùng app desktop:

[⬇️ Download Postwoman cho Windows](https://github.com/hoppscotch/releases/releases/latest/download/Hoppscotch_win_x64.msi)

## 3. File import API

Để test nhanh, cần import 2 file:

[⬇️ Download ENV DEV.json](/api/user-guide/cmi/assets/api-guide/assets/env-dev.json)

[⬇️ Download CMICOREAPI.json](/api/user-guide/cmi/assets/api-guide/assets/cmicoreapi-dev.json)

Trong đó:

| File | Mục đích |
|---|---|
| `ENV DEV.json` | Chứa biến môi trường DEV như token, session, endpoint |
| `CMICOREAPI.json` | Chứa collection request mẫu để gọi COREAPI |

Hướng dẫn chi tiết cách import:

[📘 Xem hướng dẫn import Postwoman](/user-guide/cmi/api-guide/postwoman-import)

## 4. Các endpoint chính

Các endpoint được cấu hình trong Environment DEV:

| Biến | Mục đích |
|---|---|
| `URL_CMS` | Endpoint execute workflow COREAPI |
| `URL_CMS_STATIC_TOKEN` | Endpoint tạo static token |
| `URL_CMS_REFRESH_STATIC_TOKEN` | Endpoint refresh static token |
| `PORTAL_API_URL` | Endpoint gateway của CMI Portal |

Ví dụ endpoint execute:

```txt
<<URL_CMS>>
```

Khi chạy trong Hoppscotch, biến `<<URL_CMS>>` sẽ được thay bằng giá trị trong environment đang chọn.

## 5. Các token/session chính

| Biến | Mục đích |
|---|---|
| `CMS_TOKEN` | Bearer token dùng để gọi CMS/Core API |
| `CMS_REFRESH_TOKEN` | Refresh token dùng để làm mới CMS token |
| `UID_TOKEN` | Token user/session dùng trong header `uid` |
| `UID_REFRESH_TOKEN` | Refresh token của user |
| `SESSIONID` | Session id dùng cho các workflow giao dịch FO |
| `PORTAL_TOKEN` | Token dùng cho gateway portal nếu cần |

## 6. Thứ tự gọi API khuyến nghị

Thứ tự chuẩn khi test API:

```txt
1. Chọn Environment DEV
2. Gọi CREATE_STATIC_TOKEN
3. Gọi UMG_LOGIN
4. Gọi API nghiệp vụ
```

Trong đó:

- `CREATE_STATIC_TOKEN` sẽ lấy `CMS_TOKEN` và `CMS_REFRESH_TOKEN`.
- `UMG_LOGIN` sẽ lấy `UID_TOKEN`, `UID_REFRESH_TOKEN` và `SESSIONID`.
- API nghiệp vụ sẽ dùng `CMS_TOKEN`, `UID_TOKEN` và có thể cần `SESSIONID`.

## 7. Request lấy static token

Request:

```txt
CREATE_STATIC_TOKEN
```

Endpoint:

```txt
<<URL_CMS_STATIC_TOKEN>>
```

Body mẫu:

```json
{
  "clientId": "api-cmi",
  "clientSecret": "********",
  "scopes": [
    "GET_INFO",
    "FO",
    "FUNC"
  ]
}
```

Sau khi gọi thành công, Post-request script sẽ lưu:

```txt
CMS_TOKEN
CMS_REFRESH_TOKEN
```

## 8. Request đăng nhập lấy session

Request:

```txt
UMG_LOGIN
```

Endpoint:

```txt
<<URL_CMS>>
```

Body mẫu:

```json
{
  "workflow_id": "COREAPI_LOGIN",
  "data": {
    "login_name": "api01",
    "password": "********"
  }
}
```

Sau khi gọi thành công, Post-request script sẽ lưu:

```txt
UID_TOKEN
UID_REFRESH_TOKEN
SESSIONID
```

## 9. Format request COREAPI_GET_INFO

Dùng cho các API lấy thông tin.

Format chung:

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

Ví dụ lấy thông tin khách hàng:

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

## 10. Format request COREAPI_FO

Dùng cho các workflow giao dịch.

Format chung:

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

Ví dụ workflow mở tài khoản tiền gửi:

```json
{
  "workflow_id": "COREAPI_FO",
  "data": {
    "transaction_code": "LMS_DPT01",
    "session_id": "<<SESSIONID>>",
    "end_to_end": "0000019e-f769-67d8-0000-019ef76967e1",
    "fields": {
      "CUSTOMERCD": "0001067182",
      "CTMTYPE": "C",
      "CATCD": "F036M007",
      "depositType": "fd",
      "accountType": "single",
      "ACNAME": "Somchit Vongsay",
      "DPTGRP": "I",
      "DESCS": "Opening for salary deposit",
      "FEE": 0,
      "AMOUNT": 0,
      "PAYMETHOD": "BCEL_SD",
      "currency": "LAK",
      "TRANSACTIONREF": "LMS_DPT01-20260701-003"
    }
  }
}
```

## 11. Header thường dùng

Các request nghiệp vụ thường dùng:

```txt
Authorization: Bearer <<CMS_TOKEN>>
uid: <<UID_TOKEN>>
lang: en
```

Trong đó:

- `Authorization` lấy từ `CMS_TOKEN`.
- `uid` lấy từ `UID_TOKEN`.
- `lang` có thể để `en`.

## 12. Nhóm API mẫu trong collection

Collection hiện có các nhóm request mẫu như:

| Request | Mục đích |
|---|---|
| `UMG_LOGIN` | Đăng nhập lấy user token/session |
| `CREATE_STATIC_TOKEN` | Tạo static token |
| `REFRESH_STATIC_TOKEN` | Refresh static token |
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

## 13. Lỗi thường gặp

### 401 Unauthorized

Nguyên nhân:

- Chưa chọn Environment DEV.
- `CMS_TOKEN` rỗng hoặc hết hạn.
- Chưa gọi `CREATE_STATIC_TOKEN`.
- Authorization chưa dùng đúng `Bearer <<CMS_TOKEN>>`.

Cách xử lý:

```txt
1. Chọn Environment DEV
2. Gọi CREATE_STATIC_TOKEN
3. Gọi lại request nghiệp vụ
```

### Header uid rỗng

Nguyên nhân:

- Chưa gọi `UMG_LOGIN`.
- `UID_TOKEN` chưa được set vào environment.

Cách xử lý:

```txt
1. Gọi UMG_LOGIN
2. Kiểm tra biến UID_TOKEN
3. Gọi lại request nghiệp vụ
```

### Thiếu session_id

Các workflow FO thường cần:

```txt
session_id: <<SESSIONID>>
```

Nếu `SESSIONID` rỗng, gọi lại:

```txt
UMG_LOGIN
```

### Sai endpoint

Kiểm tra biến:

```txt
URL_CMS
URL_CMS_STATIC_TOKEN
URL_CMS_REFRESH_STATIC_TOKEN
```

Nếu đang test trên môi trường khác, cần sửa lại Environment tương ứng.

## 14. Ghi chú bảo mật

Không chia sẻ file environment có token thật ra ngoài.

Nếu cần gửi cho đối tác, tạo file sample và xóa các giá trị:

```txt
CMS_TOKEN
CMS_REFRESH_TOKEN
UID_TOKEN
UID_REFRESH_TOKEN
SESSIONID
PORTAL_TOKEN
clientSecret
```

## 15. Kết luận

Trang này là tổng quan cách gọi CMI COREAPI. Để thao tác thực tế, mở Playground và import Environment/Collection trước khi gửi request.