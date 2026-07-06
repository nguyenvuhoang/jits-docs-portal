# Publish CMS bằng Docker

## 1. Build image

```bash
docker build -t your-dockerhub/emi-cms:latest .
```

## 2. Push image

```bash
docker push your-dockerhub/emi-cms:latest
```

## 3. Cập nhật server

```bash
docker pull your-dockerhub/emi-cms:latest
docker compose up -d cms
```

## 4. Kiểm tra sau deploy

```bash
docker ps
docker logs -f cms
curl -k https://your-domain/health
```

Checklist:

- Image đúng tag.
- Container đã restart.
- API healthcheck trả success.
- Nginx không báo lỗi upstream.
