# 🌲 WILDWOOD MONSTER TCG (ROGUELIKE DECKBUILDER)

[![Deploy to GitHub Pages](https://github.com/UIBreaker/TCG/actions/workflows/deploy.yml/badge.svg)](https://github.com/UIBreaker/TCG/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-teal.svg)](https://tailwindcss.com/)

Game thẻ bài chiến thuật sinh tồn phong cách Roguelike Deckbuilder kết hợp cảm hứng từ **Inscryption** và **Slay the Spire**. Xây dựng đội hình quái thú rừng sâu, thu phục linh thú hoang dã, kích hoạt Ngũ Hành Tương Khắc Ngôi Sao, hợp nhất thẻ bài tại Lò Rèn Sanctuary và chinh phục Chúa Tể Cổ Long ở Tầng 7!

---

## 🎮 CÁCH CHƠI NGAY LẬP TỨC

### 🌐 Cách 1: Chơi Trực Tiếp Trên Web (Không cần tải gì cả)
> Nhấn vào liên kết dưới đây để chơi ngay trên trình duyệt (PC, Laptop, iPad, Điện Thoại):  
> 👉 **[BẤM VÀO ĐÂY ĐỂ CHƠI NGAY (GitHub Pages)](https://uibreaker.github.io/TCG/)** 👈

---

### 💻 Cách 2: Tải Về Màn Hình Desktop & Nhấn Vào Chơi Ngay (Chơi Offline)
Không cần cài đặt Node.js hay bất kỳ phần mềm lập trình nào!

1. Nhấn nút xanh lá cây **`<> Code`** ở góc trên trang GitHub này $\rightarrow$ chọn **`Download ZIP`**.
2. Giải nén file ZIP vừa tải về ra màn hình **Desktop** của bạn.
3. Mở thư mục vừa giải nén và **nhấn đúp chuột vào file `CHOI_NGAY.bat`**.
4. Trò chơi sẽ tự động mở lên trong trình duyệt của bạn để chiến đấu ngay lập tức!

*(Bạn cũng có thể mở trực tiếp file `CHOI_ONLINE.html` để vào bản web bất kỳ lúc nào)*

---

## ⚔️ CÁC TÍNH NĂNG CHIẾN THUẬT NỔI BẬT

### 1. 🎴 Mulligan 2 Nhịp (Khởi Đầu Đội Hình)
- **Nhịp 1**: Rút 3 quái ngẫu nhiên, chọn 1 quái Tiên Phong (nhận kèm Cổ Vật khởi đầu).
- **Nhịp 2**: Rút tiếp 3 quái khác trong bể bài (không trùng lặp), chọn linh thú thứ 2.
- Cả 2 lá được rút lên tay để người chơi chủ động kéo-thả vào bất kỳ vị trí nào trên chiến trường.

### 2. 🗺️ Bản Đồ Cánh Rừng Khắc Gỗ 7 Tầng & Enemy Preview
- Đồ thị phân nhánh DAG với 8 loại khu vực đặc sắc:
  - ⚔️ **Quái Rừng** (Battle)
  - ☠️ **Quái Tinh Anh** (Elite - rơi Chìa Khóa & Cổ Vật)
  - 🛠️ **Lò Rèn Sanctuary** (Hợp Nhất Thẻ Bài & Luyện Hóa Cổ Vật)
  - 🗝️ **Kho Báu Rương Cổ** (Mật Thất Rương Thần Bí)
  - 🎒 **Thương Điếm Yêu Tinh** (Mua sắm trang bị, thẻ bài, dược liệu)
  - 🔥 **Khu Nghỉ Chân** (Hồi máu toàn đội & hồi sinh linh thú tử trận)
  - 🔮? **Điềm Báo Kỳ Bí** (Sự kiện định mệnh ngẫu nhiên)
  - 👑💀 **Chúa Tể Cổ Long** (Boss tối thượng Tầng 7)
- **Enemy Preview Panel**: Bấm hoặc rê chuột vào bất kỳ node nào trên bản đồ để xem trước Avatar quái đầu đàn, Bậc thẻ, Hệ nguyên tố kèm lời khuyên Ngũ Khắc (+35% sát thương), Độ khó và Lưu ý chiến thuật trước khi bước vào trận!

### 3. ⭐ Hệ Thống 8 Bậc Thẻ (Tier System) & Chỉ Số Cân Bằng Phẳng
| Bậc | Tên | Mã | Hex Color | Hệ số chỉ số |
| :---: | :--- | :---: | :---: | :---: |
| 1 | Common | C | `#9E9E9E` | x1.00 |
| 2 | Uncommon | UC | `#4CAF50` | x1.10 |
| 3 | Rare | R | `#2196F3` | x1.22 |
| 4 | Super Rare | SR | `#9C27B0` | x1.37 |
| 5 | Super Special Rare | SSR | `#FFD700` | x1.55 *(Mở Cleanse)* |
| 6 | Ultra Rare | UR | `#F44336` | x1.78 |
| 7 | Mythic | MR | `#E0115F` | x2.05 |
| 8 | Origin / Transcendent | TR | `#E5E4E2` | x2.40 |

> **Quy tắc cân bằng**: Tốc độ (Speed: 1–5) không bao giờ tăng theo Bậc thẻ để đảm bảo tính chiến thuật chiều sâu và quyền đi trước không bị lạm phát.

### 4. 🛠️ Lò Rèn Sanctuary (Card Fusion & Relic Merge)
- **Hợp Nhất Thẻ**: Gộp 2 lá cùng Tên + cùng Bậc $\rightarrow$ nâng lên Bậc kế tiếp. Đạt Bậc SSR trở lên mở khóa nội tại **Cleanse (Tẩy 1 debuff khi dùng Chiêu 2)**.
- **Luyện Hóa Cổ Vật**: Luyện 2 Cổ Vật cùng hệ thành Cổ Vật Tinh Hoa với hiệu ứng cộng hưởng tăng thêm +20%.

### 5. 🗝️ Mật Thất Rương Cổ Đại (Treasure Vault)
- **Mở bằng Chìa Khóa Cổ**: 100% an toàn, nhận 50+ Vàng và 1 Cổ Vật thần bí.
- **Phá Khóa Liều Lĩnh (Brute Force)**: Tỷ lệ 40% (dùng Bộ Dụng Cụ Phá Khóa tăng lên 60%), thất bại nhận Bẫy Nổ 2 sát thương chuẩn toàn đội, hoặc 10% tỷ lệ gặp Quái Rương Mimic bất ngờ tấn công!

### 6. 🌟 Ngũ Hành Tương Khắc Ngôi Sao
- **Hỏa 🔥** $\rightarrow$ khắc **Mộc 🌿** $\rightarrow$ khắc **Thổ 🌍** $\rightarrow$ khắc **Lôi ⚡** $\rightarrow$ khắc **Thủy 💧** $\rightarrow$ khắc **Hỏa 🔥**
- Đánh trúng hệ khắc chế: Nhận thêm **+35% sát thương** và hiệu ứng choáng nhẹ!

---

## 🛠️ DÀNH CHO LẬP TRÌNH VIÊN (DEVELOPER SETUP)

Nếu bạn muốn chỉnh sửa mã nguồn hoặc phát triển thêm tính năng:

```bash
# 1. Clone repository
git clone https://github.com/UIBreaker/TCG.git
cd TCG

# 2. Cài đặt thư viện dependencies
npm install

# 3. Khởi chạy máy chủ phát triển (Development Server)
npm run dev

# 4. Chạy toàn bộ 59 Unit Tests (Vitest)
npm test

# 5. Biên dịch bản phát hành sản phẩm (Production Build)
npm run build
```

---

## 📜 BẢN QUYỀN
Phát triển bởi **UIBreaker** • MIT License.
Chúc bạn có những giờ phút chinh phục Cánh Rừng Sâu đầy phấn khích! 🌲⚔️
