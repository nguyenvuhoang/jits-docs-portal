# Build và push Docker image

## 1. Build image

```powershell
docker build -t justintimesolutions/cmiportal:latest .
```

## 2. Kiểm tra image local

```powershell
docker images
```

## 3. Push image

```powershell
docker push justintimesolutions/cmiportal:latest
```

Lưu ý dùng dấu `:` cho tag image, không dùng `@latest`.
