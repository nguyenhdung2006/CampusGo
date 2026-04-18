# 🚀 CampusGo

Nền tảng dịch vụ nội bộ dành cho sinh viên trong campus (đặt đồ ăn, giao hàng, mua bán đồ cũ).

---

## 🧠 Tổng quan

CampusGo giải quyết vấn đề:

* Di chuyển xa trong campus
* Thời gian nghỉ ngắn
* Ngại đi lại (nắng, mưa, tầng cao KTX)

👉 Giải pháp:

* Giao đồ ăn nội bộ
* Giao nhận & mua bán đồ giữa sinh viên

---

## 🧩 Tech Stack

### Backend

* Spring Boot
* Spring Data JPA (Hibernate)
* PostgreSQL

### Frontend (đang làm)

* React (Vite)
* Axios

---

## 🌐 API Base URL

```
http://localhost:8080
```

---

## 📦 Database Schema

### Tables hiện tại:

* **users**
* **stores**
* **products**
* **orders**
* **order_items**
* **deliveries**
* **marketplace_items**

---

## 🧱 Entity Relationships

* User (1) → (N) Order
* Order (1) → (N) OrderItem
* Order (1) → (1) Delivery
* Product (N) → (1) Store
* Delivery (N) → (1) User (shipper)

---

## ⚙️ Backend Features

### ✅ Đã hoàn thành

#### User

* Tạo user
* Tìm theo email (`findByEmail`)

#### Store

* CRUD store

#### Product

* CRUD product
* Lấy theo store

#### Order (CORE)

* POST `/orders` → tạo đơn
* GET `/orders` → list
* GET `/orders/{id}`
* GET `/orders/user/{userId}`
* PUT `/orders/{id}/status`
* PUT `/orders/{id}/cancel`
* DELETE `/orders/{id}`

👉 Logic đã xử lý:

* Validate user tồn tại
* Validate product tồn tại
* Tính `totalPrice`
* Auto tạo `delivery`
* Cascade save order_items

---

### 📦 Delivery

* Gán shipper
* Update status

---

## 🧪 Test API (Postman)

### 🔥 Tạo Order

POST `/orders`

```json
{
  "user": { "id": 9 },
  "deliveryAddress": "KTX A",
  "items": [
    {
      "product": { "id": 1 },
      "quantity": 2
    }
  ]
}
```

👉 Kết quả:

* Order được tạo
* totalPrice tự tính
* delivery auto tạo (PENDING)

---

## 👤 Sample Data (QUAN TRỌNG)

### User

* id: **9**
* email: [student@campusgo.vn](mailto:student@campusgo.vn)

### Product

* id: **1**
* name: (ví dụ)

👉 ⚠️ đang test bằng hardcode id

---

## 🔐 Authentication (TRẠNG THÁI HIỆN TẠI)

### ❌ Chưa có:

* JWT
* Spring Security

### ✔ Hiện tại:

* Login tạm bằng email (tạo user nếu chưa có)

### 🎯 Mục tiêu tiếp theo:

* `/auth/login`
* JWT token
* Filter authenticate request

---

## 🧭 Frontend Flow (đang build)

1. Login
2. Home (list products)
3. Order (tạo đơn)
4. My Orders

---

## 📁 Project Structure

### Backend

```
com.campusgo.backend
├── controller/
├── service/
├── service/impl/
├── repository/
├── entity/
└── BackendApplication.java
```

### Frontend

```
src/
├── api/
├── pages/
├── components/
├── App.jsx
└── main.jsx
```

---

## 🚀 Run Project

### Backend

```bash
cd backend
mvn spring-boot:run
```

---

## 🐞 Known Issues

* Chưa có authentication (JWT)
* Password đang lưu plaintext
* Chưa có phân quyền (role chưa dùng thực tế)

---

## 📌 TODO (Next Steps)

### Backend

* [ ] JWT Authentication
* [ ] Password hashing (BCrypt)
* [ ] Role (USER / SHIPPER / ADMIN)

### Frontend

* [ ] Login UI
* [ ] Home UI
* [ ] Order UI
* [ ] My Orders UI

---

## 💡 Business Model

* Phí giao hàng: 10k – 20k
* Hoa hồng quán ăn: 5% – 10%
* Phí đăng bán (optional)

---

## 🎯 Current Status

👉 Backend: **RUNNING OK**
👉 Order flow: **WORKING**
👉 DB: **STABLE**
👉 Auth: **NOT IMPLEMENTED YET**
👉 Frontend: **STARTING**

---

## 👨‍💻 Author

Nguyễn Huy Dũng
