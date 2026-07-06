# Chạy CMI Portal local

## 1. Cài package

```bash
npm install
```

## 2. Tạo file môi trường

```bash
cp .env.example .env.local
```

Ví dụ:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APPLICATION_CODE=BO
```

## 3. Chạy development server

```bash
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:3000
```
