// ========================================================
// HỆ THỐNG MÀN HÌNH CHỜ (SPLASH SCREEN CAO CẤP)
// ========================================================
window.addEventListener('load', function() {
    const manHinhCho = document.getElementById('manHinhCho');
    
    if (manHinhCho) {
        // Cài đặt 3 giây để người dùng kịp xem hết chuyển động
        setTimeout(function() {
            manHinhCho.classList.add('an-splash');
            
            // Đợi thêm 800ms cho hiệu ứng mờ hẳn rồi xóa thẻ HTML
            setTimeout(function() {
                manHinhCho.remove();
            }, 800); 
            
        }, 3000); 
    }
});

// ========================================================
// HỆ THỐNG GIỎ HÀNG THÔNG MINH (LƯU TRỮ VĨNH VIỄN)
// ========================================================

// 1. Khởi tạo giỏ hàng từ bộ nhớ trình duyệt (nếu chưa có thì tạo mảng rỗng)
let gioHang = JSON.parse(localStorage.getItem('gioHangVovinam')) || [];

// 2. Hàm cập nhật số lượng nhỏ hiển thị trên nút Giỏ hàng ở Cửa hàng
function capNhatSoLuongGioHang() {
    const hienThiSoLuong = document.querySelector('.cart-count'); 
    if (hienThiSoLuong) {
        let tongSoLg = 0;
        gioHang.forEach(sp => tongSoLg += sp.soLuong);
        hienThiSoLuong.innerText = tongSoLg;
    }
}

// 3. Hàm Thêm sản phẩm vào giỏ (Dùng chung cho mọi nơi)
function themVaoGio(idSanPham, size = "Mặc định", soLuong = 1) {
    if (!window.KHO_SAN_PHAM_TOAN_CUC) {
        // Nếu ở trang chủ chưa tải kho, xài tạm kho cứng
        if (typeof khoSanPham !== 'undefined' && khoSanPham[idSanPham]) {
            xuLyThemVaoGio(idSanPham, khoSanPham[idSanPham].ten, khoSanPham[idSanPham].gia, khoSanPham[idSanPham].anh, size, soLuong);
        } else {
            alert("⏳ Dữ liệu cửa hàng đang tải, vui lòng đợi vài giây rồi thử lại!");
        }
        return;
    }

    const sanPham = window.KHO_SAN_PHAM_TOAN_CUC.find(sp => sp.id === idSanPham);
    if (!sanPham) {
        alert("❌ Lỗi: Không tìm thấy sản phẩm này trong kho!");
        return;
    }
    xuLyThemVaoGio(sanPham.id, sanPham.tenSanPham, sanPham.gia, sanPham.linkAnh, size, soLuong);
}

function xuLyThemVaoGio(id, ten, gia, anh, size, soLuong) {
    const index = gioHang.findIndex(item => item.id === id && item.size === size);
    
    if (index > -1) {
        gioHang[index].soLuong += parseInt(soLuong);
    } else {
        gioHang.push({ id: id, ten: ten, gia: gia, anh: anh, size: size, soLuong: parseInt(soLuong) });
    }
    
    localStorage.setItem('gioHangVovinam', JSON.stringify(gioHang));
    capNhatSoLuongGioHang();
    
    // Nếu ở trang chi tiết hoặc cửa hàng, hỏi xem có muốn sang giỏ hàng ko
    if(window.location.pathname.includes("chitiet.html") || window.location.pathname.includes("cuahang.html")) {
        const xacNhan = confirm(`✅ Đã thêm thành công: [ ${ten} - ${size} ] vào giỏ hàng!\n\nBạn có muốn chuyển đến Giỏ hàng để thanh toán luôn không?`);
        if (xacNhan) window.location.href = "giohang.html";
    } else {
        alert("🛒 Đã thêm thành công:\n" + ten + " (Size: " + size + ") vào giỏ hàng!");
    }
}

// 4. Hàm vẽ giao diện Giỏ hàng ra trang giohang.html
function hienThiTrangGioHang() {
    // ĐÃ SỬA: Cập nhật lại ID cho khớp chính xác với file giohang.html
    const khungDanhSach = document.getElementById('danhSachGioHang'); 
    const txtTongTienGoc = document.getElementById('tamTinhTien');
    const txtTongTienThanhToan = document.getElementById('tongCongTien');
    
    // Nếu không tìm thấy khung chứa, ngừng chạy hàm để tránh lỗi
    if (!khungDanhSach) return; 

    // Xử lý khi giỏ hàng trống
    if (gioHang.length === 0) {
        khungDanhSach.innerHTML = `<p style="text-align:center; padding: 40px; color:#64748b; font-size: 18px; font-weight:bold;">Giỏ hàng của bạn đang trống.</p>`;
        if (txtTongTienGoc) txtTongTienGoc.innerText = "0 VNĐ";
        if (txtTongTienThanhToan) txtTongTienThanhToan.innerText = "0 VNĐ";
        return;
    }

    let html = "";
    let tongTien = 0;

    // Vòng lặp in từng sản phẩm ra giao diện
    gioHang.forEach((item, index) => {
        let giaSo = parseInt(String(item.gia).toString().replace(/\./g, '').replace(' VNĐ', ''));
        tongTien += giaSo * item.soLuong;

        html += `
            <div class="cart-item">
                <img src="${item.anh || item.linkAnh}" alt="${item.ten}">
                <div class="item-details">
                    <h3>${item.ten}</h3>
                    <p>Size: ${item.size}</p>
                    <span class="item-price">${Number(giaSo).toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div class="item-actions">
                    <input type="number" value="${item.soLuong}" min="1" class="cart-qty" onchange="doiSoLuongTrongGio(${index}, this.value)">
                    <button class="btn-remove" onclick="xoaKhoiGio(${index})">🗑️ Xóa bỏ</button>
                </div>
            </div>
        `;
    });

    khungDanhSach.innerHTML = html;
    
    // Xử lý tính toán giảm giá
    let tienDuocGiam = tongTien * (phanTramGiamGia / 100);
    let tienCanThanhToan = tongTien - tienDuocGiam;

    if (txtTongTienGoc) txtTongTienGoc.innerText = tongTien.toLocaleString('vi-VN') + " VNĐ";
    
    const dongGiamGia = document.getElementById('dongGiamGia');
    const txtSoTienGiam = document.getElementById('soTienGiam');

    if (phanTramGiamGia > 0 && dongGiamGia) {
        dongGiamGia.style.display = "flex"; 
        txtSoTienGiam.innerText = "- " + tienDuocGiam.toLocaleString('vi-VN') + " VNĐ";
    } else if (dongGiamGia) {
        dongGiamGia.style.display = "none"; 
    }

    if (txtTongTienThanhToan) txtTongTienThanhToan.innerText = tienCanThanhToan.toLocaleString('vi-VN') + " VNĐ";

    // Lưu lại tổng tiền để chuẩn bị cho bước thanh toán gửi qua Google Sheets
    window.tongTienCuoiCungSo = tienCanThanhToan;
    window.tongTienCuoiCungChuoi = tienCanThanhToan.toLocaleString('vi-VN') + " VNĐ";
}

// 5. Hàm đổi số lượng khi người dùng gõ số khác
function doiSoLuongTrongGio(index, soLuongMoi) {
    if (soLuongMoi < 1) soLuongMoi = 1;
    gioHang[index].soLuong = parseInt(soLuongMoi);
    localStorage.setItem('gioHangVovinam', JSON.stringify(gioHang));
    capNhatSoLuongGioHang();
    hienThiTrangGioHang(); 
}

// 6. Hàm xóa 1 món khỏi giỏ
function xoaKhoiGio(index) {
    gioHang.splice(index, 1);
    localStorage.setItem('gioHangVovinam', JSON.stringify(gioHang));
    capNhatSoLuongGioHang();
    hienThiTrangGioHang();
}

// ==========================================
// XỬ LÝ ĐỊA CHỈ & MÃ GIẢM GIÁ (TRANG GIỎ HÀNG)
// ==========================================

let phanTramGiamGia = 0; 
window.MA_VOUCHER_DANG_DUNG = ""; 

function thayDoiHinhThucNhan() {
    const hinhThuc = document.getElementById('dhHinhThuc').value;
    const label = document.getElementById('labelDiaChi');
    const input = document.getElementById('dhDiaChi');

    if (hinhThuc === "TaiCLB") {
        label.innerText = "Chọn CLB bạn đang theo tập:";
        input.placeholder = "VD: CLB Nguyễn Huệ, CLB Y Ngông...";
    } else {
        label.innerText = "Nhập địa chỉ nhà riêng của bạn:";
        input.placeholder = "VD: Số 123, đường ABC, xã XYZ...";
    }
}

function apDungGiamGia() {
    const maNhap = document.getElementById('maGiamGiaInput').value.trim().toUpperCase();
    const thongBao = document.getElementById('thongBaoGiamGia');

    const danhSachMa = {
        "VOVINAM10": 10,  
        "EAMDROH20": 20,  
        "CHUNGDZ": 50     
    };

    if (maNhap === "") {
        thongBao.innerText = "Vui lòng nhập mã giảm giá!";
        thongBao.style.color = "#e53e3e";
        phanTramGiamGia = 0;
        window.MA_VOUCHER_DANG_DUNG = "";
    } else if (danhSachMa[maNhap]) {
        phanTramGiamGia = danhSachMa[maNhap];
        window.MA_VOUCHER_DANG_DUNG = maNhap;
        thongBao.innerText = `✅ Áp dụng thành công! Bạn được giảm ${phanTramGiamGia}%`;
        thongBao.style.color = "#10b981";
    } else {
        thongBao.innerText = "❌ Mã giảm giá không hợp lệ hoặc đã hết hạn!";
        thongBao.style.color = "#e53e3e";
        phanTramGiamGia = 0;
        window.MA_VOUCHER_DANG_DUNG = "";
    }
    
    hienThiTrangGioHang(); 
}

// 7. Khởi chạy các tính năng khi trang web vừa tải xong
window.addEventListener('DOMContentLoaded', function() {
    capNhatSoLuongGioHang(); 
    hienThiTrangGioHang();   

    const nutThemChiTiet = document.querySelector('.btn-add-cart-large');
    if (nutThemChiTiet && window.location.pathname.includes("chitiet.html")) {
        nutThemChiTiet.addEventListener('click', function() {
            const idSanPham = new URLSearchParams(window.location.search).get('id');
            const sizeSelect = document.getElementById('size-select');
            const size = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex].text : "Mặc định";
            const qtyInput = document.querySelector('.qty-input');
            const soLuong = qtyInput ? qtyInput.value : 1;

            themVaoGio(idSanPham, size, soLuong);
        });
    }
});


// 3. TÍNH NĂNG LỌC SẢN PHẨM
function locSanPham(loaiSanPham, nutDuocBam) {
    const danhSachSanPham = document.querySelectorAll('.product-card');
    if (danhSachSanPham.length > 0) {
        danhSachSanPham.forEach(sanPham => {
            const nhanSanPham = sanPham.getAttribute('data-category');
            if (loaiSanPham === 'tat-ca' || nhanSanPham === loaiSanPham) {
                sanPham.style.display = 'block';
            } else {
                sanPham.style.display = 'none';
            }
        });
    } else if (window.KHO_SAN_PHAM_TOAN_CUC) {
        // Lọc theo mảng Google Sheets nếu đang ở cuahang.html
        let danhSachLoc = window.KHO_SAN_PHAM_TOAN_CUC;
        if (loaiSanPham !== 'tat-ca') {
            danhSachLoc = window.KHO_SAN_PHAM_TOAN_CUC.filter(sp => sp.loai === loaiSanPham);
        }
        hienThiSanPham(danhSachLoc);
    }

    const cacNut = document.querySelectorAll('.categories button, .categories-modern button');
    cacNut.forEach(nut => nut.classList.remove('active'));
    if(nutDuocBam) nutDuocBam.classList.add('active');
}

// 4. TÍNH NĂNG TÌM KIẾM
function timKiemSanPham() {
    let tuKhoa = document.getElementById('oTimKiem').value.toLowerCase();
    let danhSachSanPham = document.querySelectorAll('.product-card');
    
    danhSachSanPham.forEach(sanPham => {
        let tenSanPham = sanPham.querySelector('h3').innerText.toLowerCase();
        if (tenSanPham.includes(tuKhoa)) {
            sanPham.style.display = "block";
        } else {
            sanPham.style.display = "none";
        }
    });
}

// ========================================================
// XỬ LÝ ĐĂNG KÝ VÀ ĐĂNG NHẬP VỚI GOOGLE SHEETS
// ========================================================

const MANG_LUOI_GOOGLE = 'https://script.google.com/macros/s/AKfycbzR2qq52Umui1UC0FeunIbkhuDNBde8tdOM4Q5AmKnXKWvLtcJeelNvcNfBRV5a1PhWfw/exec';

// ========================================================
// 1. XỬ LÝ FORM ĐĂNG KÝ
// ========================================================
const formDangKy = document.getElementById('formDangKyMoi');
if (formDangKy) {
    formDangKy.addEventListener('submit', function(e) {
        e.preventDefault();

        const hoTen = document.getElementById('dkHoTen').value.trim();
        const namSinh = document.getElementById('dkNamSinh').value.trim(); // Bắt dữ liệu Năm sinh
        const soDienThoai = document.getElementById('dkSoDienThoai').value.trim();
        const taiKhoan = document.getElementById('dkTaiKhoan').value.trim();
        const matKhau = document.getElementById('dkMatKhau').value;
        const nhapLaiMatKhau = document.getElementById('dkNhapLaiMatKhau').value;
        const cauLacBo = document.getElementById('dkCauLacBo').value;

        if (!cauLacBo) {
            alert("❌ Vui lòng chọn Câu lạc bộ của bạn!");
            return;
        }

        if (matKhau !== nhapLaiMatKhau) {
            alert("❌ Hai mật khẩu không khớp nhau!");
            return;
        }

        const nutBam = formDangKy.querySelector('.btn-auth');
        nutBam.innerText = "Đang tạo tài khoản...";
        nutBam.disabled = true;

        const data = new URLSearchParams();
        data.append('action', 'register');
        data.append('hoTen', hoTen);
        data.append('namSinh', namSinh); // Gói Năm sinh vào dữ liệu gửi đi
        data.append('soDienThoai', soDienThoai);
        data.append('taiKhoan', taiKhoan);
        data.append('matKhau', matKhau);
        data.append('clb', cauLacBo);

        fetch(MANG_LUOI_GOOGLE, { method: 'POST', body: data })
        .then(res => res.text())
        .then(ketQua => {
            if (ketQua === "TaiKhoanTonTai") {
                alert("⚠️ Tên tài khoản này đã có người sử dụng. Vui lòng chọn tên khác!");
            } else if (ketQua === "DangKyThanhCong") {
                alert("✅ Đăng ký thành công! Hãy đăng nhập để sử dụng.");
                window.location.href = 'dangnhap.html'; 
            }
        })
        .catch(err => alert("Lỗi mạng! Không thể kết nối tới máy chủ."))
        .finally(() => {
            nutBam.innerText = "HOÀN TẤT ĐĂNG KÝ";
            nutBam.disabled = false;
        });
    });
}

// 2. XỬ LÝ FORM ĐĂNG NHẬP
const formDangNhap = document.getElementById('formDangNhap');
if (formDangNhap) {
    formDangNhap.addEventListener('submit', function(e) {
        e.preventDefault();

        const taiKhoan = document.getElementById('dnTaiKhoan').value.trim();
        const matKhau = document.getElementById('dnMatKhau').value;

        const nutBam = formDangNhap.querySelector('.btn-auth');
        nutBam.innerText = "Đang kiểm tra...";
        nutBam.disabled = true;

        const data = new URLSearchParams();
        data.append('action', 'login');
        data.append('taiKhoan', taiKhoan);
        data.append('matKhau', matKhau);

        fetch(MANG_LUOI_GOOGLE, { method: 'POST', body: data })
        .then(res => res.text())
        .then(ketQua => {
            if (ketQua === "SaiThongTin") {
                alert("❌ Sai tài khoản hoặc mật khẩu!");
            } else if (ketQua.includes("DangNhapThanhCong")) {
                const phanTach = ketQua.split("|");
                const tenNguoiDung = phanTach[1];
                const avatar = phanTach[2];
                const clbCuaNguoiDung = phanTach[3]; 
                const vaiTroNguoiDung = phanTach[4]; 

                alert(`✅ Đăng nhập thành công!\n👤 Tên: ${tenNguoiDung}\n🥋 CLB: ${clbCuaNguoiDung}\n👑 Vai trò: ${vaiTroNguoiDung}`);
                
                localStorage.setItem("daDangNhap", "true");
                localStorage.setItem("tenDangNhap", tenNguoiDung);
                localStorage.setItem("taiKhoanDangNhap", taiKhoan);
                localStorage.setItem("avatarDangNhap", avatar);
                localStorage.setItem("clbDangNhap", clbCuaNguoiDung); 
                localStorage.setItem("vaiTroDangNhap", vaiTroNguoiDung); 
                
                window.location.href = 'index.html'; 
            }
        })
        .catch(err => alert("Lỗi mạng! Không thể kết nối tới máy chủ."))
        .finally(() => {
            nutBam.innerText = "ĐĂNG NHẬP NGAY";
            nutBam.disabled = false;
        });
    });
}

// ========================================================
// SỰ KIỆN TỰ ĐỔI THÔNG TIN SẢN PHẨM THEO ID (TRANG CHI TIẾT)
// ========================================================

const khoSanPham = {
    "vo-phuc": {
        ten: "Võ Phục Vovinam Chuẩn Form",
        gia: "180.000 VNĐ",
        loai: "Võ phục",
        anh: "vo-phuc.jpg", 
        moTa: "Võ phục Vovinam chất liệu vải Kaki bền bỉ, thấm hút mồ hôi cực tốt..."
    },
    "dai-vang": {
        ten: "Đai Vàng Vovinam Các Cấp",
        gia: "140.000 VNĐ",
        loai: "Phụ kiện",
        anh: "dai-vang.jpg",
        moTa: "Đai vàng dành cho võ sinh Vovinam đã qua kỳ thi thăng cấp đai chuẩn..."
    },
    "lam-dai": {
        ten: "Lam Đai Vovinam (Đai Xanh)",
        gia: "40.000 VNĐ",
        loai: "Phụ kiện",
        anh: "lam-dai.jpg",
        moTa: "Lam đai nhập khẩu, màu xanh dương chuẩn theo quy định võ phục..."
    },
    "kiem-nhom": {
        ten: "Kiếm Nhôm Vovinam Tập Luyện",
        gia: "420.000 VNĐ",
        loai: "Binh Khí",
        anh: "kiem-nhom.jpg",
        moTa: "Binh khí kiếm nhôm mô phỏng dành riêng cho các bài quyền Vovinam..."
    }
};

window.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes("chitiet.html") && !document.getElementById("chiTietSanPhamBox")) {
        const urlParams = new URLSearchParams(window.location.search);
        const sanPhamId = urlParams.get('id');

        if (sanPhamId && typeof khoSanPham !== 'undefined' && khoSanPham[sanPhamId]) {
            const sp = khoSanPham[sanPhamId]; 
            const anh = document.getElementById('anhChiTiet');
            const ten = document.getElementById('tenChiTiet');
            const gia = document.getElementById('giaChiTiet');
            const loai = document.getElementById('loaiChiTiet');
            const moTa = document.getElementById('moTaChiTiet');

            if (anh) { anh.src = sp.anh; anh.alt = sp.ten; }
            if (ten) ten.innerText = sp.ten;
            if (gia) gia.innerText = sp.gia;
            if (loai) loai.innerText = sp.loai;
            if (moTa) moTa.innerText = sp.moTa;
        } 
    }
});

// ========================================================
// CÁ NHÂN HÓA TRANG CHỦ THEO CÂU LẠC BỘ VÀ VAI TRÒ
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    const daDangNhap = localStorage.getItem("daDangNhap");
    const clbCuaToi = localStorage.getItem("clbDangNhap");
    
    let vaiTro = localStorage.getItem("vaiTroDangNhap");
    if (vaiTro) vaiTro = vaiTro.trim(); 

    const danhSachTheCLB = document.querySelectorAll('.clb-card');
    const tieuDeCLB = document.getElementById('tieuDeCLB');

    if (danhSachTheCLB.length > 0) {
        if (daDangNhap === "true" && vaiTro === "Admin") {
            if(tieuDeCLB) {
                tieuDeCLB.innerText = "QUẢN LÝ CÁC CÂU LẠC BỘ (QUYỀN ADMIN)";
                tieuDeCLB.style.color = "#e53e3e"; 
            }
            danhSachTheCLB.forEach(the => {
                the.style.display = 'block';
                the.style.transform = 'none';
                the.style.border = '2px solid #e53e3e'; 
            });
        } 
        else if (daDangNhap === "true" && clbCuaToi && clbCuaToi !== "") {
            if(tieuDeCLB) {
                tieuDeCLB.innerText = "CÂU LẠC BỘ BẠN ĐANG THAM GIA";
                tieuDeCLB.style.color = "#0056b3"; 
            }
            danhSachTheCLB.forEach(the => {
                if (the.getAttribute('data-name') === clbCuaToi) {
                    the.style.display = 'block';
                    the.style.transform = 'scale(1.05)';
                    the.style.border = '2px solid #0056b3';
                } else {
                    the.style.display = 'none'; 
                }
            });
        } 
        else {
            if(tieuDeCLB) {
                tieuDeCLB.innerText = "CÁC CÂU LẠC BỘ TRỰC THUỘC";
                tieuDeCLB.style.color = "#0056b3";
            }
            danhSachTheCLB.forEach(the => {
                the.style.display = 'block';
                the.style.transform = 'none';
                the.style.border = 'none';
            });
        }
    }
});

// ========================================================
// HỆ THỐNG QUẢN TRỊ ADMIN
// ========================================================

function kiemTraAdmin() {
    const matKhauNhap = document.getElementById('adminPassword').value;
    const matKhauDung = "vovinam2026"; 

    if (matKhauNhap === matKhauDung) {
        document.getElementById('adminLoginBox').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        hienThiBangSanPham();
    } else {
        document.getElementById('adminError').style.display = 'block';
    }
}

function dangXuatAdmin() {
    window.location.reload();
}

function hienThiBangSanPham() {
    const bang = document.getElementById('bangSanPham');
    if(!bang) return;
    let noiDungBang = "";

    for (let id in khoSanPham) {
        const sp = khoSanPham[id];
        noiDungBang += `
            <tr>
                <td><img src="${sp.anh}" alt="${sp.ten}"></td>
                <td><strong>${id}</strong></td>
                <td style="color:#0056b3; font-weight:bold;">${sp.ten}</td>
                <td style="color:#e53e3e; font-weight:bold;">${sp.gia}</td>
                <td>
                    <button class="btn-edit" onclick="suaSanPham('${id}')">✏️ Sửa đổi</button>
                </td>
            </tr>
        `;
    }
    bang.innerHTML = noiDungBang;
}

function suaSanPham(id) {
    alert("Chức năng sửa thông tin cho sản phẩm: " + khoSanPham[id].ten + " sẽ được cập nhật ở phiên bản tiếp theo!");
}

// ========================================================
// HIỂN THỊ VÀ ĐỔI ẢNH ĐẠI DIỆN TRÊN THANH MENU
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    const daDangNhap = localStorage.getItem("daDangNhap");
    const tenDangNhap = localStorage.getItem("tenDangNhap");
    const taiKhoan = localStorage.getItem("taiKhoanDangNhap");
    let avatarDangNhap = localStorage.getItem("avatarDangNhap");
    
    if (!avatarDangNhap || avatarDangNhap.trim() === "") {
        avatarDangNhap = `https://ui-avatars.com/api/?name=${tenDangNhap}&background=0056b3&color=fff&rounded=true&bold=true`;
    }

    const khuVucNutMenu = document.querySelector('.auth-buttons');

    if (daDangNhap === "true" && khuVucNutMenu) {
        let vaiTroCheck = localStorage.getItem("vaiTroDangNhap");
        if (vaiTroCheck) vaiTroCheck = vaiTroCheck.trim();
        
        let nutQuanLyAdmin = "";
        if (vaiTroCheck === "Admin") {
            nutQuanLyAdmin = `
                <a href="quanlymonsinh.html" style="color: #e53e3e; font-weight: bold;">👥 Quản lý môn sinh</a>
                <a href="tinnhan.html" style="color: #10b981; font-weight: bold;">💬 Quản lý tin nhắn</a>
                <a href="#" onclick="moLaiPopupThongBao()">📢 Thông báo Pop-up</a>
            `;
        }

        khuVucNutMenu.innerHTML = `
            <div class="user-profile-dropdown">
                <div class="user-profile-toggle">
                    <label for="avatarUpload" style="cursor: pointer;" title="Nhấn để đổi ảnh đại diện">
                        <img src="${avatarDangNhap}" alt="Avatar" class="user-avatar" id="hienThiAvatar">
                    </label>
                    <input type="file" id="avatarUpload" accept="image/jpeg, image/png, application/pdf" style="display: none;" onchange="capNhatAvatar(this)">
                    
                    <span style="color: #001f3f; font-weight: 800; font-size: 15px; cursor: pointer;">
                        Chào, <span style="color: #e53e3e;">${tenDangNhap}</span> ▾
                    </span>
                </div>
                
                <div class="user-dropdown-content">
                    ${nutQuanLyAdmin}
                    <a href="hocphi.html">💳 Quản lý học phí</a>
                    <a href="doimatkhau.html">🔐 Đổi mật khẩu</a>
                    <button class="logout-btn" onclick="dangXuatTaiKhoan()">🚪 Đăng xuất</button>
                </div>
            </div>
        `;
    }
});

function capNhatAvatar(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        // 1. Chỉ nhận định dạng ảnh
        const cacDinhDangChoPhep = ['image/jpeg', 'image/png'];
        if (!cacDinhDangChoPhep.includes(file.type)) {
            alert("⚠️ Lỗi: Hệ thống chỉ hỗ trợ file ảnh định dạng JPG hoặc PNG!");
            input.value = ""; 
            return;
        }

        // Báo hiệu đang xử lý để người dùng biết hệ thống không bị đơ
        hienThiThongBao("⏳ Đang tối ưu hóa ảnh sắc nét, vui lòng chờ...", "thanh-cong");

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = function() {
                // 2. Thu nhỏ ảnh về chuẩn HD (800px) để không bị sập trình duyệt, mà vẫn cực nét
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Thay vì 120px mờ nhòe, chúng ta dùng 800px
                let scaleSize = 1;
                
                if (img.width > MAX_WIDTH) {
                    scaleSize = MAX_WIDTH / img.width;
                }
                
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 3. Xuất ảnh với chất lượng 85%
                const base64Avatar = canvas.toDataURL('image/jpeg', 0.85); 

                const taiKhoan = localStorage.getItem('taiKhoanDangNhap');
                if (!taiKhoan) {
                    alert("⚠️ Hãy ĐĂNG XUẤT tài khoản ra và ĐĂNG NHẬP lại để kích hoạt!");
                    return;
                }

                // Cập nhật ngay lên giao diện
                document.getElementById('hienThiAvatar').src = base64Avatar;
                
                try {
                    localStorage.setItem('avatarDangNhap', base64Avatar); 
                } catch(loiBoNho) {
                    console.log("Ảnh vẫn hơi nặng so với LocalStorage, nhưng không sao, vẫn up lên server!");
                }

                hienThiThongBao("🚀 Đang đẩy ảnh lên Google Drive...", "thanh-cong");

                const goi_du_lieu = { action: 'updateAvatar', taiKhoan: taiKhoan, avatar: base64Avatar };

                // 4. Gửi ảnh lên máy chủ
                fetch(MANG_LUOI_GOOGLE, { 
                    method: 'POST', 
                    body: JSON.stringify(goi_du_lieu) 
                })
                .then(res => res.text())
                .then(ketQua => {
                    if(ketQua === "LuuAnhThanhCong") {
                        hienThiThongBao("🎉 Ảnh đại diện đã lưu thành công!");
                    } else {
                        hienThiThongBao("Máy chủ báo lỗi: " + ketQua, "loi");
                    }
                })
                .catch(err => hienThiThongBao("Lỗi kết nối mạng!", "loi"));
            }
        }
        reader.readAsDataURL(file);
    }
}

function dangXuatTaiKhoan() {
    // 1. Chỉ xóa các thông tin định danh của phiên đăng nhập hiện tại
    localStorage.removeItem("daDangNhap");
    localStorage.removeItem("tenDangNhap");
    localStorage.removeItem("taiKhoanDangNhap");
    localStorage.removeItem("avatarDangNhap");
    localStorage.removeItem("clbDangNhap");
    localStorage.removeItem("vaiTroDangNhap");
    
    // 2. KHÔNG XÓA 'vovinamThongBao' và 'gioHangVovinam' 
    // Trình duyệt sẽ tiếp tục lưu trữ trạng thái đã đọc thông báo và các món đồ trong giỏ.
    
    // 3. Đẩy người dùng về trang chủ
    window.location.href = 'index.html';
}

// ========================================================
// XỬ LÝ ĐỔI MẬT KHẨU TỰ ĐỘNG NHẬN DIỆN TÀI KHOẢN
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    const txtThongBaoTaikhoan = document.getElementById('txtTenTaiKhoanHienTai');
    const formDoiMK = document.getElementById('formDoiMatKhau');
    
    if (formDoiMK) {
        const daDangNhap = localStorage.getItem("daDangNhap");
        const taiKhoanHienTai = localStorage.getItem("taiKhoanDangNhap");

        if (daDangNhap !== "true" || !taiKhoanHienTai) {
            alert("⚠️ Bạn cần đăng nhập tài khoản trước khi thực hiện đổi mật khẩu!");
            window.location.href = 'dangnhap.html';
            return;
        }

        if(txtThongBaoTaikhoan) txtThongBaoTaikhoan.innerText = `Tài khoản đang thao tác: ${taiKhoanHienTai}`;

        formDoiMK.addEventListener('submit', function(e) {
            e.preventDefault();
            const mkMoi = document.getElementById('mkMoi').value;
            const mkMoiNhapLai = document.getElementById('mkMoiNhapLai').value;

            if (mkMoi !== mkMoiNhapLai) {
                alert("❌ Hai mật khẩu mới nhập không khớp nhau!");
                return;
            }

            const nutBam = formDoiMK.querySelector('.btn-auth');
            nutBam.innerText = "⏳ Đang cập nhật...";
            nutBam.disabled = true;

            const goiDuLieu = { action: 'changePassword', taiKhoan: taiKhoanHienTai, matKhauMoi: mkMoi };

            fetch(MANG_LUOI_GOOGLE, { method: 'POST', body: JSON.stringify(goiDuLieu) })
            .then(res => res.text())
            .then(ketQua => {
                if (ketQua === "DoiMatKhauThanhCong") {
                    alert("🎉 Đổi mật khẩu thành công! Hệ thống sẽ đăng xuất để bạn đăng nhập lại.");
                    dangXuatTaiKhoan(); 
                } else {
                    alert("Có lỗi xảy ra: " + ketQua);
                }
            })
            .catch(err => alert("Lỗi kết nối mạng!"))
            .finally(() => {
                nutBam.innerText = "CẬP NHẬT MẬT KHẨU";
                nutBam.disabled = false;
            });
        });
    }
});

// ========================================================
// HỆ THỐNG ĐIỀU KHIỂN TRANG QUẢN LÝ MÔN SINH (ADMIN ONLY)
// ========================================================
const dangNhapCheck = localStorage.getItem("daDangNhap");
let vaiTroCheck = localStorage.getItem("vaiTroDangNhap");
if (vaiTroCheck) vaiTroCheck = vaiTroCheck.trim();

if (window.location.pathname.includes("quanlymonsinh.html")) {
    if (dangNhapCheck !== "true" || vaiTroCheck !== "Admin") {
        alert("⛔ Quyền truy cập bị từ chối! Khu vực này chỉ dành cho Ban Chủ Nhiệm.");
        window.location.href = "index.html";
    }
}

function taiDanhSachMonSinh() {
    const bang = document.getElementById("bodyDanhSachMonSinh");
    if (!bang) return;

    bang.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: #64748b; font-weight: bold;">⏳ Đang đồng bộ danh sách từ Google Sheets...</td></tr>`;

    fetch(MANG_LUOI_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ action: "getUsers" })
    })
    .then(res => res.json())
    .then(danhSach => {
        window.khoLuuTruMonSinh = danhSach; 
        hienThiMonSinhRaBang(danhSach);
    })
    .catch(err => {
        bang.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: #e53e3e; font-weight: bold;">❌ Lỗi kết nối mạng, không thể tải danh sách!</td></tr>`;
    });
}

function hienThiMonSinhRaBang(danhSach) {
    const bang = document.getElementById("bodyDanhSachMonSinh");
    if (!bang) return;

    if (danhSach.length === 0) {
        bang.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: #64748b;">Nơi này hiện tại trống trải...</td></tr>`;
        return;
    }

    let html = "";
    const taiKhoanAdminDangDung = localStorage.getItem("taiKhoanDangNhap");

    danhSach.forEach((ms, index) => {
        let hanhDongNut = `<button onclick="guiLenhXoaMonSinh('${ms.taiKhoan}', '${ms.hoTen}')" style="background: #e53e3e; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;">❌ Xóa</button>`;
        if (ms.taiKhoan === taiKhoanAdminDangDung) {
            hanhDongNut = `<span style="color: #10b981; font-weight: bold; font-style: italic;">Bạn đang dùng</span>`;
        }

        const cacCapDai = ["Tự vệ", "Lam đai", "Lam đai I", "Lam đai II", "Lam đai III", "Hoàng đai", "Hoàng đai I", "Hoàng đai II", "Hoàng đai III"];
        let optionHtml = "";
        cacCapDai.forEach(dai => {
            let selected = (ms.capDai === dai) ? "selected" : "";
            optionHtml += `<option value="${dai}" ${selected}>🥋 ${dai}</option>`;
        });

        html += `
            <tr style="border-bottom: 1px solid #e2ebf4;">
                <td style="padding: 15px; text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
                <td style="padding: 15px; color: #001f3f;"><strong>${ms.hoTen}</strong></td>
                <td style="padding: 15px; color: #475569;">${ms.soDienThoai}</td>
                <td style="padding: 15px; text-align: center;"><span style="background: #e2ebf4; color: #0056b3; padding: 5px 10px; border-radius: 6px; font-size: 13px; font-weight: 800;">${ms.clb}</span></td>
                <td style="padding: 15px; text-align: center;">
                    <select onchange="HLV_DoiCapDai('${ms.taiKhoan}', this.value, '${ms.hoTen}')" style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #0056b3; cursor: pointer; outline: none;">
                        ${optionHtml}
                    </select>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <select onchange="HLV_DoiVaiTro('${ms.taiKhoan}', this.value, '${ms.hoTen}')" style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: ${ms.vaiTro === 'Admin' ? '#e53e3e' : (ms.vaiTro === 'Lớp trưởng' ? '#10b981' : '#64748b')}; cursor: pointer; outline: none;">
                        <option value="User" ${ms.vaiTro === 'User' ? 'selected' : ''}>👤 User</option>
                        <option value="Lớp trưởng" ${ms.vaiTro === 'Lớp trưởng' ? 'selected' : ''}>⭐ Lớp trưởng</option>
                        <option value="Admin" ${ms.vaiTro === 'Admin' ? 'selected' : ''}>👑 Admin</option>
                    </select>
                </td>
            </tr>
        `;
    });
    bang.innerHTML = html;
}

function guiLenhXoaMonSinh(taiKhoanXoa, tenXoa) {
    const xacNhan = confirm(`⚠️ CẢNH BÁO TỐI CAO:\nBạn có chắc chắn muốn xóa vĩnh viễn tài khoản của môn sinh [ ${tenXoa} ] khỏi hệ thống không?`);
    
    if (xacNhan) {
        fetch(MANG_LUOI_GOOGLE, {
            method: "POST",
            body: JSON.stringify({ action: "deleteUser", taiKhoanXoa: taiKhoanXoa })
        })
        .then(res => res.text())
        .then(ketQua => {
            if (ketQua === "XoaUserThanhCong") {
                alert(`✅ Đã loại bỏ tài khoản môn sinh [ ${tenXoa} ] thành công!`);
                taiDanhSachMonSinh(); 
            } else {
                alert("Máy chủ báo lỗi: " + ketQua);
            }
        })
        .catch(err => alert("❌ Thao tác thất bại do lỗi mạng!"));
    }
}

window.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById("bodyDanhSachMonSinh")) {
        taiDanhSachMonSinh(); 
        
        const thanhLoc = document.getElementById("locDanhSachCLB");
        if (thanhLoc) {
            thanhLoc.addEventListener("change", function() {
                const chonCLB = this.value;
                if (!window.khoLuuTruMonSinh) return;
                
                if (chonCLB === "tat-ca") {
                    hienThiMonSinhRaBang(window.khoLuuTruMonSinh);
                } else {
                    const danhSachDaLoc = window.khoLuuTruMonSinh.filter(ms => ms.clb === chonCLB);
                    hienThiMonSinhRaBang(danhSachDaLoc);
                }
            });
        }
    }
});

// ========================================================
// XỬ LÝ ĐẶT HÀNG
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    const formDatHang = document.getElementById('formDatHang');
    
    function taoMaDonHang() {
        const chu = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const so = '0123456789';
        let ma = 'VN-';
        for (let i = 0; i < 2; i++) ma += chu.charAt(Math.floor(Math.random() * chu.length));
        for (let i = 0; i < 2; i++) ma += so.charAt(Math.floor(Math.random() * so.length));
        return ma;
    }

    if (formDatHang) {
        formDatHang.addEventListener('submit', function(e) {
            e.preventDefault(); 

            if (gioHang.length === 0) {
                alert("⚠️ Giỏ hàng của bạn đang trống!");
                return;
            }

            const hoTen = document.getElementById('dhHoTen').value.trim();
            const sdt = document.getElementById('dhSoDienThoai').value.trim();
            const diaChi = document.getElementById('dhDiaChi').value.trim();
            const nutBam = formDatHang.querySelector('.btn-checkout');

            const maDon = taoMaDonHang();
            let chiTietDon = "";
            let tongTienGocSo = 0; 
            
            gioHang.forEach(sp => {
                let giaSo = parseInt(sp.gia.toString().replace(/\./g, '').replace(' VNĐ', ''));
                tongTienGocSo += giaSo * sp.soLuong;
                chiTietDon += `- ${sp.soLuong}x ${sp.ten} (Size: ${sp.size})\n`; 
            });

            if (phanTramGiamGia > 0) {
                chiTietDon += `\n🎁 Đã dùng mã giảm giá: ${window.MA_VOUCHER_DANG_DUNG} (${phanTramGiamGia}%)`;
            }

            let tongTienSo = window.tongTienCuoiCungSo || tongTienGocSo;
            let tongTienChuoi = window.tongTienCuoiCungChuoi || (tongTienGocSo.toLocaleString('vi-VN') + " VNĐ");

            nutBam.innerText = "🚀 ĐANG GỬI ĐƠN HÀNG...";
            nutBam.disabled = true;

            const goiDuLieu = {
                action: 'order',
                maDonHang: maDon, 
                hoTen: hoTen,
                sdt: sdt,
                diaChi: diaChi,
                chiTiet: chiTietDon,
                tongTien: tongTienChuoi
            };

            fetch(MANG_LUOI_GOOGLE, {
                method: 'POST',
                body: JSON.stringify(goiDuLieu)
            })
            .then(res => res.text())
            .then(ketQua => {
                if (ketQua === "DatHangThanhCong") {
                    localStorage.removeItem("gioHangVovinam"); 
                    
                    const maNganHang = "mbbank"; 
                    const soTaiKhoan = "4567895177777"; 
                    const tenTaiKhoan = "PHAM DUC LOC"; 

                    const tenKhongDau = tenTaiKhoan.replace(/ /g, '%20');
                    const urlQR = `https://img.vietqr.io/image/${maNganHang}-${soTaiKhoan}-compact2.png?amount=${tongTienSo}&addInfo=${maDon}&accountName=${tenKhongDau}`;

                    const anhQR = document.getElementById("anhMaQR");
                    if (anhQR) anhQR.src = urlQR;
                    
                    const elSoTien = document.getElementById("txtSoTien");
                    if (elSoTien) elSoTien.innerText = tongTienChuoi;
                    
                    const elNoiDung = document.getElementById("txtNoiDung");
                    if (elNoiDung) elNoiDung.innerText = maDon;
                    
                    const elNganHang = document.getElementById("txtNganHang");
                    if (elNganHang) elNganHang.innerText = maNganHang.toUpperCase();
                    
                    const elChuTaiKhoan = document.getElementById("txtChuTaiKhoan");
                    if (elChuTaiKhoan) elChuTaiKhoan.innerText = tenTaiKhoan;

                    const modal = document.getElementById("modalThanhToanQR");
                    if (modal) modal.style.display = "flex";
                    
                    hienThiThongBao("Tạo đơn thành công! Vui lòng thanh toán.", "thanh-cong");
                } else {
                    hienThiThongBao("❌ Lỗi máy chủ: " + ketQua, "loi");
                }
            })
            .catch(err => hienThiThongBao("❌ Lỗi mạng! Không thể gửi đơn hàng.", "loi"))
            .finally(() => {
                nutBam.innerText = "🚀 XÁC NHẬN ĐẶT HÀNG";
                nutBam.disabled = false;
            });
        });
    }
});

function hoanTatThanhToan() {
    alert("🎉 Cảm ơn bạn! Đơn hàng của bạn đang được Ban Chủ Nhiệm xử lý.\n\nHệ thống sẽ chuyển bạn đến trang theo dõi vận đơn.");
    window.location.href = "lichsudonhang.html";
}

function dongPopupQR() {
    const popup = document.getElementById('modalThanhToanQR');
    if (popup) {
        popup.style.display = 'none';
        window.location.href = 'cuahang.html';
    }
}

// ========================================================
// HỆ THỐNG THÔNG BÁO NỔI (TOAST NOTIFICATION)
// ========================================================
function hienThiThongBao(loiNhan, kieu = 'thanh-cong') {
    const toast = document.createElement('div');
    toast.className = `toast-vovinam ${kieu === 'loi' ? 'error' : ''}`;
    
    const icon = kieu === 'loi' ? '❌' : '🎉';
    toast.innerHTML = `<span style="font-size: 20px;">${icon}</span> <span style="line-height: 1.4;">${loiNhan}</span>`;
    
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 500); 
    }, 3000);
}

// ========================================================
// HỆ THỐNG ĐIỂM DANH TỰ ĐỘNG
// ========================================================

let khoMonSinhDiemDanh = []; 

window.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById("bodyDanhSachDiemDanh")) {
        const daDangNhap = localStorage.getItem("daDangNhap");
        let vaiTro = localStorage.getItem("vaiTroDangNhap");
        let clbCuaToi = localStorage.getItem("clbDangNhap");
        if (vaiTro) vaiTro = vaiTro.trim();

        if (daDangNhap !== "true") {
            alert("⛔ Bạn cần đăng nhập để xem danh sách Câu lạc bộ!");
            window.location.href = "dangnhap.html";
            return; 
        }

        // Nếu KHÔNG PHẢI Admin và KHÔNG PHẢI Lớp trưởng (chỉ là User thường) -> Ẩn nút Lưu
        if (vaiTro !== "Admin" && vaiTro !== "Lớp trưởng") {
            const tieuDe = document.querySelector('h2');
            if(tieuDe) tieuDe.innerHTML = "👥 DANH SÁCH MÔN SINH";

            const nutLuu = document.querySelector('.btn-save-attendance');
            if(nutLuu) nutLuu.style.display = 'none';
        }

        // Nếu KHÔNG PHẢI Admin (Tức là User hoặc Lớp trưởng) -> Khóa khung chọn CLB, chỉ thao tác trên CLB của mình
        if (vaiTro !== "Admin") {
            const boxChonCLB = document.getElementById('clbDiemDanh');
            if(boxChonCLB) {
                boxChonCLB.value = clbCuaToi;
                boxChonCLB.disabled = true; 
                boxChonCLB.style.background = "#f1f5f9";
            }
        }

        const oNgay = document.getElementById('ngayDiemDanh');
        if (oNgay) oNgay.value = new Date().toISOString().split('T')[0];

        layDuLieuMonSinhDeDiemDanh();
        
        // Bật nút Lưu Điểm Danh cho Admin và Lớp trưởng
        if (vaiTro === "Admin" || vaiTro === "Lớp trưởng") {
            kichHoatNutLuuDiemDanh();
        }
    }
});

function layDuLieuMonSinhDeDiemDanh() {
    const bang = document.getElementById("bodyDanhSachDiemDanh");
    if (!bang) return; 

    bang.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px; font-weight:bold; color:#64748b;">⏳ Đang tải danh sách võ sinh từ hệ thống...</td></tr>`;

    fetch(MANG_LUOI_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ action: "getUsers" })
    })
    .then(res => res.json())
    .then(danhSach => {
        khoMonSinhDiemDanh = danhSach; 
        taiDanhSachDiemDanh(); 
    })
    .catch(err => {
        bang.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #e53e3e; font-weight:bold;">❌ Lỗi tải dữ liệu. Hãy kiểm tra mạng!</td></tr>`;
    });
}

function taiDanhSachDiemDanh() {
    const bang = document.getElementById("bodyDanhSachDiemDanh");
    const clbChon = document.getElementById('clbDiemDanh').value;
    if(!bang) return;

    const danhSachLoc = khoMonSinhDiemDanh.filter(ms => ms.clb === clbChon && ms.vaiTro !== "Admin");

    if (danhSachLoc.length === 0) {
        bang.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px; color:#64748b;">Chưa có môn sinh nào thuộc Câu lạc bộ này đăng ký hệ thống.</td></tr>`;
        return;
    }

    let html = "";
    danhSachLoc.forEach((ms, index) => {
        const defaultStatus = 'Có mặt';
        const defaultClass = 'present';
        ms.lastAttendanceStatus = defaultStatus; 

        let capDai = ms.capDai || "Lam đai";
        let colorClass = "belt-lam-dai"; 
        if (capDai.includes("Hoàng")) colorClass = "belt-hoang-dai";
        else if (capDai.includes("Tự vệ")) colorClass = "belt-tu-ve";

        let vaiTroHienTai = localStorage.getItem("vaiTroDangNhap");
        if (vaiTroHienTai) vaiTroHienTai = vaiTroHienTai.trim();

        let cotCuoiCung = "";
        // Cấp quyền cho Lớp trưởng hiện nút tick điểm danh giống như Admin
        if (vaiTroHienTai === "Admin" || vaiTroHienTai === "Lớp trưởng") {
            cotCuoiCung = `
                <div style="display: flex; justify-content: center;">
                    <span class="status-toggle ${defaultClass}" onclick="toggleAttendanceStatus(this, '${ms.taiKhoan}')">
                        ${defaultStatus}
                    </span>
                </div>
            `;
        } else {
            cotCuoiCung = `<span style="color: #10b981; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px;">✔ Đang sinh hoạt</span>`;
        }

        html += `
            <tr style="border-bottom: 1px dashed #e2ebf4;">
                <td style="padding: 15px; text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
                <td style="padding: 15px; font-weight: bold; color: #001f3f; font-size: 16px;">${ms.hoTen}</td>
                <td style="padding: 15px; text-align: center;">
                    <span class="belt-badge ${colorClass}">${capDai}</span>
                </td>
                <td style="padding: 15px; text-align: center;">
                    ${cotCuoiCung}
                </td>
            </tr>
        `;
    });
    bang.innerHTML = html;
}

function kichHoatNutLuuDiemDanh() {
    const nutLuu = document.querySelector('.btn-save-attendance');
    if (!nutLuu) return;

    nutLuu.addEventListener('click', function() {
        const clbDaChon = document.getElementById('clbDiemDanh').value;
        const ngayDiemDanh = document.getElementById('ngayDiemDanh').value;

        if (!ngayDiemDanh) {
            alert("⚠️ Vui lòng chọn ngày điểm danh!");
            return;
        }

        nutLuu.innerText = "⏳ Đang gửi dữ liệu...";
        nutLuu.disabled = true;

        const mangVoSinh = [];
        const danhSachLoc = khoMonSinhDiemDanh.filter(ms => ms.clb === clbDaChon && ms.vaiTro !== "Admin");

        danhSachLoc.forEach(ms => {
            const trangThai = ms.lastAttendanceStatus || "Có mặt"; 
            mangVoSinh.push({ ten: ms.hoTen, trangThai: trangThai });
        });

        if(mangVoSinh.length === 0) {
             alert("❌ Không có dữ liệu môn sinh để lưu!");
             nutLuu.innerText = "💾 LƯU DANH SÁCH ĐIỂM DANH";
             nutLuu.disabled = false;
             return;
        }

        const goiDuLieu = { action: 'saveAttendance', clb: clbDaChon, ngay: ngayDiemDanh, danhSach: mangVoSinh };

        fetch(MANG_LUOI_GOOGLE, {
            method: 'POST',
            body: JSON.stringify(goiDuLieu)
        })
        .then(res => res.text())
        .then(ketQua => {
            if (ketQua === "LuuDiemDanhThanhCong") {
                alert(`🎉 Đã lưu Điểm danh ngày ${ngayDiemDanh} cho ${clbDaChon} thành công!`);
            } else {
                alert("Máy chủ báo lỗi: " + ketQua);
            }
        })
        .catch(err => alert("❌ Lỗi mạng! Không thể truyền dữ liệu điểm danh đi."))
        .finally(() => {
            nutLuu.innerText = "💾 LƯU DANH SÁCH ĐIỂM DANH";
            nutLuu.disabled = false;
        });
    });
}

function toggleAttendanceStatus(element, userAccount) {
    if (element.classList.contains('present')) {
        element.classList.remove('present');
        element.classList.add('absent');
        element.innerText = 'Vắng';
    } else {
        element.classList.remove('absent');
        element.classList.add('present');
        element.innerText = 'Có mặt';
    }
    
    const ms = khoMonSinhDiemDanh.find(item => item.taiKhoan === userAccount);
    if (ms) ms.lastAttendanceStatus = element.innerText; 
}

function HLV_DoiVaiTro(taiKhoanNguoiDung, vaiTroMoi, tenVoSinh) {
    fetch(MANG_LUOI_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ action: "updateRole", taiKhoan: taiKhoanNguoiDung, vaiTroMoi: vaiTroMoi })
    })
    .then(res => res.text())
    .then(ketQua => {
        if (ketQua === "CapNhatVaiTroThanhCong") {
            alert(`✅ Đã thay đổi vai trò của [ ${tenVoSinh} ] thành [ ${vaiTroMoi} ] thành công!`);
            taiDanhSachMonSinh();
        } else {
            alert("Lỗi máy chủ: " + ketQua);
        }
    })
    .catch(err => alert("❌ Thao tác thất bại do lỗi mạng!"));
}

// ========================================================
// XỬ LÝ FORM ĐĂNG TIN TỨC
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    const formDangTin = document.getElementById('formDangTin');
    if (formDangTin) {
        formDangTin.addEventListener('submit', function(e) {
            e.preventDefault();
            const nutBam = formDangTin.querySelector('.btn-post-news');
            nutBam.innerText = "⏳ ĐANG ĐẨY LÊN MÁY CHỦ...";
            nutBam.disabled = true;

            const tieuDe = document.getElementById('tinTieuDe').value.trim();
            const chuyenMuc = document.getElementById('tinChuyenMuc').value;
            const linkAnh = document.getElementById('tinLinkAnh').value.trim();
            const noiDung = tinymce.get('tinNoiDung').getContent();

            if (noiDung === "") {
                alert("⚠️ Vui lòng viết nội dung cho bài báo!");
                nutBam.innerText = "🚀 ĐĂNG BÀI VIẾT LÊN TRANG CHỦ";
                nutBam.disabled = false;
                return;
            }

            const goiDuLieu = {
                action: 'addNews', tieuDe: tieuDe, chuyenMuc: chuyenMuc, linkAnh: linkAnh, noiDung: noiDung
            };

            fetch(MANG_LUOI_GOOGLE, { method: 'POST', body: JSON.stringify(goiDuLieu) })
            .then(res => res.text())
            .then(ketQua => {
                if (ketQua === "DangTinThanhCong") {
                    alert("🎉 Đăng tin tức thành công!");
                    formDangTin.reset(); 
                    tinymce.get('tinNoiDung').setContent(''); 
                } else {
                    alert("Lỗi máy chủ: " + ketQua);
                }
            })
            .catch(err => alert("❌ Lỗi mạng! Không thể đăng bản tin."))
            .finally(() => {
                nutBam.innerText = "🚀 ĐĂNG BÀI VIẾT LÊN TRANG CHỦ";
                nutBam.disabled = false;
            });
        });
    }
});

// ========================================================
// ĐỒNG BỘ MENU THẢ XUỐNG VÀ CÁC NÚT ĐIỀU HƯỚNG THEO QUYỀN
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    const linkDiemDanh = document.getElementById('navDiemDanhCLB');
    const linkThongTin = document.getElementById('navThongTinCLB');
    const nutHanhDong = document.getElementById('nutHanhDongCLB');
    
    const daDangNhap = localStorage.getItem("daDangNhap");
    const clbCuaToi = localStorage.getItem("clbDangNhap"); 
    let vaiTro = localStorage.getItem("vaiTroDangNhap");
    if (vaiTro) vaiTro = vaiTro.trim();

    const khoLinkCLB = {
        "CLB Lê Hữu Trác": "clb-lehuutrac.html",
        "CLB Nguyễn Huệ": "clb-nguyenhue.html",
        "CLB Hùng Vương": "clb-hungvuong.html",
        "CLB Y Ngông": "clb-yngong.html",
        "CLB Nội Trú": "clb-noitru.html"
    };

    if (linkDiemDanh || linkThongTin) {
        if (daDangNhap === "true") {
            if (vaiTro === "Admin") {
                if (linkDiemDanh) { linkDiemDanh.innerText = "🎯 Quản lý điểm danh"; linkDiemDanh.href = "diemdanh.html"; }
                if (linkThongTin) { linkThongTin.innerText = "ℹ️ Xem tất cả CLB"; linkThongTin.href = "index.html#tieuDeCLB"; }
            } else if (vaiTro === "Lớp trưởng") {
                if (linkDiemDanh) { linkDiemDanh.innerText = "🎯 Quản lý điểm danh"; linkDiemDanh.href = "diemdanh.html"; }
                if (linkThongTin) { linkThongTin.innerText = "ℹ️ Thông tin CLB của tôi"; linkThongTin.href = khoLinkCLB[clbCuaToi] || "index.html"; }
            } else {
                if (linkDiemDanh) { linkDiemDanh.innerText = "👥 Xem danh sách lớp"; linkDiemDanh.href = "diemdanh.html"; }
                if (linkThongTin) { linkThongTin.innerText = "ℹ️ Thông tin CLB của tôi"; linkThongTin.href = khoLinkCLB[clbCuaToi] || "index.html"; }
            }
        } else {
            if (linkDiemDanh) { linkDiemDanh.innerText = "🔐 Đăng nhập để xem lớp"; linkDiemDanh.href = "dangnhap.html"; }
            if (linkThongTin) { linkThongTin.innerText = "ℹ️ Danh sách các CLB"; linkThongTin.href = "index.html"; }
        }
    }

    if (nutHanhDong && daDangNhap === "true") {
        if (vaiTro === "Admin" || vaiTro === "Lớp trưởng") {
            nutHanhDong.innerText = "📋 QUẢN LÝ ĐIỂM DANH";
            nutHanhDong.href = "diemdanh.html";
            nutHanhDong.style.background = "#e53e3e"; 
            nutHanhDong.style.boxShadow = "0 5px 15px rgba(229,62,62,0.3)";
        } else {
            nutHanhDong.innerText = "👥 XEM DANH SÁCH MÔN SINH";
            nutHanhDong.href = "diemdanh.html";
            nutHanhDong.style.background = "#10b981"; 
            nutHanhDong.style.boxShadow = "0 5px 15px rgba(16,185,129,0.3)";
        }
    }
});

// =======================================================
// HỆ THỐNG THÔNG BÁO TỰ ĐỘNG (NOTIFICATION BELL V3 - CÁ NHÂN HÓA NÂNG CAO)
// =======================================================

// 1. Hàm tạo chìa khóa hộp thư riêng (Cá nhân hóa theo người dùng)
function layKeyThongBao() {
    const taiKhoan = localStorage.getItem("taiKhoanDangNhap");
    // Nếu có tài khoản thì dùng hộp thư riêng, nếu không thì xài hộp thư khách
    return taiKhoan ? ('vovinamThongBao_' + taiKhoan) : 'vovinamThongBao_khach_vang_lai';
}

// 2. Hàm lấy danh sách thông báo
function layDanhSachThongBao() {
    return JSON.parse(localStorage.getItem(layKeyThongBao())) || [];
}

// 3. Hàm cất thông báo vào lại hộp thư riêng
function luuDanhSachThongBao(danhSach) {
    localStorage.setItem(layKeyThongBao(), JSON.stringify(danhSach));
}

function toggleThongBao() {
    const dropdown = document.getElementById("thongBaoDropdown");
    if(dropdown) {
        dropdown.classList.toggle("show");
        if(dropdown.classList.contains("show")) renderThongBao();
    }
}

window.addEventListener('click', function(event) {
    if (!event.target.closest('.notification-bell')) {
        const dropdown = document.getElementById("thongBaoDropdown");
        if (dropdown && dropdown.classList.contains('show')) dropdown.classList.remove('show');
    }
});

function renderThongBao() {
    const ul = document.getElementById("danhSachThongBao");
    if (!ul) return;
    
    ul.innerHTML = ""; 
    let countChuaDoc = 0;
    let danhSach = layDanhSachThongBao(); 

    if (danhSach.length === 0) {
        ul.innerHTML = `<li style="text-align:center; padding: 15px; color: #64748b;">🔕 Không có thông báo nào.</li>`;
    } else {
        [...danhSach].reverse().forEach(tb => {
            if (tb.chuaDoc) countChuaDoc++;
            const li = document.createElement("li");
            li.className = tb.chuaDoc ? "chuadoc" : "dadoc"; 
            li.innerHTML = tb.noiDung;
            li.setAttribute("onclick", `xuLyClickThongBao('${tb.id}', '${tb.link}')`);
            ul.appendChild(li);
        });
    }

    const badge = document.getElementById("thongBaoBadge");
    if (badge) {
        badge.innerText = countChuaDoc;
        badge.style.display = countChuaDoc > 0 ? "inline-block" : "none";
    }
}

function xuLyClickThongBao(id, link) {
    let danhSach = layDanhSachThongBao();
    danhSach = danhSach.map(tb => {
        if (tb.id === id) return { ...tb, chuaDoc: false }; // Đánh dấu đã đọc thành công
        return tb;
    });
    luuDanhSachThongBao(danhSach); 
    renderThongBao();
    if (link && link !== 'undefined' && link !== '#') window.location.href = link;
}

// =====================================
// BẮN THÔNG BÁO TIN TỨC (ĐÃ FIX LỖI RESET CHƯA ĐỌC)
// =====================================
function tuDongTaoThongBaoTinTuc(danhSachTinTuc) {
    if (!danhSachTinTuc || danhSachTinTuc.length === 0) return;
    let danhSachThucTe = danhSachTinTuc;
    let coThayDoi = false;
    let danhSach = layDanhSachThongBao(); 
    
    // THUẬT TOÁN MỚI: Dùng Dấu Thời Gian làm ID bất biến
    const taoIdTuTin = (tin) => {
        if (tin.thoiGian) {
            const timeStr = new Date(tin.thoiGian).getTime();
            if (!isNaN(timeStr)) return 'tin-' + timeStr;
        }
        return 'tin-' + btoa(unescape(encodeURIComponent(tin.tieuDe))).substring(0, 15);
    };

    const danhSachIdTrenMayChu = danhSachThucTe.map(tin => taoIdTuTin(tin));
    
    // 1. Dọn dẹp: Xóa thông báo của bài viết đã bị gỡ trên Google Sheets
    const soLuongCu = danhSach.length;
    danhSach = danhSach.filter(tb => {
        if (!tb.id.startsWith('tin-')) return true;
        return danhSachIdTrenMayChu.includes(tb.id);
    });
    if (danhSach.length !== soLuongCu) coThayDoi = true;

    // 2. Thêm mới & Cập nhật
    danhSachThucTe.forEach(tin => {
        const thongBaoId = taoIdTuTin(tin);
        const viTri = danhSach.findIndex(tb => tb.id === thongBaoId);
        const noiDungMoi = `📰 <b>Tin tức mới:</b> ${tin.tieuDe}`;
        
        if (viTri === -1) {
            // Tin mới hoàn toàn -> Đẩy thông báo chưa đọc
            danhSach.push({
                id: thongBaoId,
                noiDung: noiDungMoi,
                chuaDoc: true,
                link: `tintuc.html` 
            });
            coThayDoi = true;
        } else {
            // Tin cũ đã tồn tại: Nếu Admin sửa tiêu đề, Cập nhật lại chữ nhưng BẢO TOÀN trạng thái Đã Đọc
            if (danhSach[viTri].noiDung !== noiDungMoi) {
                danhSach[viTri].noiDung = noiDungMoi;
                // Tuyệt đối không can thiệp vào biến chuaDoc ở đây
                coThayDoi = true;
            }
        }
    });
    
    if (coThayDoi) {
        luuDanhSachThongBao(danhSach);
        renderThongBao();
    }
}

// =====================================
// BẮN THÔNG BÁO HỌC PHÍ (BẢO TOÀN TRẠNG THÁI)
// =====================================
function tuDongTaoThongBaoHocPhi(danhSachHocPhi) {
    const daDangNhap = localStorage.getItem("daDangNhap");
    const tenHienTai = localStorage.getItem("tenDangNhap"); 
    
    if (daDangNhap !== "true" || !tenHienTai || !danhSachHocPhi || danhSachHocPhi.length === 0) return;

    let coThayDoi = false;
    let danhSach = layDanhSachThongBao(); 
    const hocPhiCuaToi = danhSachHocPhi.find(hp => hp.hoTen === tenHienTai);

    if (hocPhiCuaToi) {
        let thangHienThi = hocPhiCuaToi.thang;
        let objDate = new Date(thangHienThi);
        if (!isNaN(objDate.getTime())) {
            thangHienThi = "tháng " + (objDate.getMonth() + 1);
        }

        const idThongBaoHocPhi = `hocphi-${thangHienThi}-${tenHienTai}`;
        let noiDungThongBao = "";
        let trangWebChuyenHuong = "#"; 

        if (hocPhiCuaToi.trangThai === "Đã nộp") {
            noiDungThongBao = `💰 <b>Thông báo học phí:</b> Môn sinh ${hocPhiCuaToi.hoTen} - ${hocPhiCuaToi.clb}, đã hoàn thành học phí ${thangHienThi} (Số tiền ${hocPhiCuaToi.soTien})`;
            trangWebChuyenHuong = "index.html"; 
        } else if (hocPhiCuaToi.trangThai === "Chưa nộp") {
            noiDungThongBao = `⚠️ <b>Nhắc nhở học phí:</b> Môn sinh ${hocPhiCuaToi.hoTen} - ${hocPhiCuaToi.clb}, chưa hoàn thành học phí ${thangHienThi} (Số tiền ${hocPhiCuaToi.soTien}), vui lòng nhấp vào thông báo để hoàn thành học phí`;
            trangWebChuyenHuong = "hocphi.html"; 
        } else {
            return;
        }

        const viTriHienTai = danhSach.findIndex(tb => tb.id === idThongBaoHocPhi);

        if (viTriHienTai === -1) {
            danhSach.push({
                id: idThongBaoHocPhi,
                noiDung: noiDungThongBao,
                chuaDoc: true,
                link: trangWebChuyenHuong,
                ghiChuTrangThai: hocPhiCuaToi.trangThai 
            });
            coThayDoi = true;
        } else {
            // Nếu admin ĐỔI TRẠNG THÁI đóng tiền (Từ chưa nộp sang đã nộp)
            if (danhSach[viTriHienTai].ghiChuTrangThai !== hocPhiCuaToi.trangThai) {
                danhSach[viTriHienTai].noiDung = noiDungThongBao;
                danhSach[viTriHienTai].link = trangWebChuyenHuong;
                danhSach[viTriHienTai].chuaDoc = true; // Chỉ re-ping (báo chưa đọc lại) khi sự kiện nộp tiền thay đổi
                danhSach[viTriHienTai].ghiChuTrangThai = hocPhiCuaToi.trangThai;
                coThayDoi = true;
            } 
            // Nếu admin chỉ gõ sửa lại số tiền, không đổi trạng thái
            else if (danhSach[viTriHienTai].noiDung !== noiDungThongBao) {
                danhSach[viTriHienTai].noiDung = noiDungThongBao;
                // KHÔNG can thiệp vào chuaDoc ở đây
                coThayDoi = true;
            }
        }
    }

    if (coThayDoi) {
        luuDanhSachThongBao(danhSach);
        renderThongBao();
    }
}

// ========================================================
// KÍCH HOẠT HỆ THỐNG CHUÔNG & KÉO DỮ LIỆU TỪ GOOGLE SHEETS
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    // 1. Hiện chuông ngay lập tức
    if (typeof renderThongBao === 'function') renderThongBao();

    const daDangNhap = localStorage.getItem("daDangNhap");
    if (daDangNhap === "true") {
        // 2. Kéo dữ liệu Học Phí từ Google Sheets về để quét thông báo
        fetch(MANG_LUOI_GOOGLE, {
            method: "POST",
            body: JSON.stringify({ action: "getHocPhi" }) 
        })
        .then(res => res.json())
        .then(duLieuHocPhiThucTe => {
            if (typeof tuDongTaoThongBaoHocPhi === 'function') {
                tuDongTaoThongBaoHocPhi(duLieuHocPhiThucTe);
            }
        })
        .catch(err => console.log("Lỗi tải thông báo học phí:", err));
    }
});

// ========================================================
// ĐỒNG BỘ TIN TỨC VÀ HIỂN THỊ (TRANG CHỦ VÀ TRANG TIN TỨC)
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    // 1. DÀNH CHO TRANG TIN TỨC (tintuc.html)
    const tieuDiemBox = document.getElementById("tinTieuDiemBox");
    const tinNhoBox = document.getElementById("danhSachTinNhoBox");
    if (tieuDiemBox) {
        fetch(MANG_LUOI_GOOGLE, { method: "POST", body: JSON.stringify({ action: "getNews" }) })
        .then(res => res.json())
        .then(danhSachTin => {
            if (danhSachTin.length === 0) {
                tieuDiemBox.innerHTML = `<p style="text-align: center; padding: 40px; color: #64748b; font-size: 18px; font-weight: bold;">📰 Tòa soạn hiện tại chưa xuất bản bài viết nào.</p>`;
                if (tinNhoBox) tinNhoBox.innerHTML = "";
                return;
            }
            if (typeof tuDongTaoThongBaoTinTuc === 'function') tuDongTaoThongBaoTinTuc(danhSachTin);

            const tin1 = danhSachTin[0];
            const ngayDang1 = new Date(tin1.thoiGian).toLocaleDateString('vi-VN');
            tieuDiemBox.innerHTML = `
                <!-- Đã cố định max-width: 800px, height: 200px và margin: 0 auto để căn giữa -->
                <div class="main-news-card" style="display: flex; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); max-width: 800px; height: 200px; margin: 0 auto;">
                    
                    <!-- Khung ảnh: Kế thừa 100% chiều cao của thẻ cha (200px) -->
                    <div style="flex: 1; min-width: 200px; max-width: 300px; height: 100%; background-color: #f8fafc; display: flex; justify-content: center; align-items: center;">
                        <img src="${tin1.linkAnh}" alt="${tin1.tieuDe}" style="width: 100%; height: 100%; object-fit: contain; padding: 10px;">
                    </div>
                    
                    <!-- Khung chữ: Tối ưu lề và khoảng cách các dòng -->
                    <div style="flex: 2; padding: 15px 25px; display: flex; flex-direction: column; justify-content: center;">
                        <span style="background: #fee2e2; color: #ef4444; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; align-self: flex-start; margin-bottom: 6px;">${tin1.chuyenMuc}</span>
                        <h2 style="color: #001f3f; font-size: 17px; font-weight: 800; line-height: 1.3; margin-top: 0; margin-bottom: 6px;">${tin1.tieuDe}</h2>
                        <p style="color: #64748b; font-size: 12px; margin-bottom: 8px;">📅 Ngày đăng: ${ngayDang1}</p>
                        
                        <div class="news-content-body" style="color: #475569; line-height: 1.4; font-size: 13px; margin-bottom: 12px; max-height: 38px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${tin1.noiDung}
                        </div>
                        
                        <button onclick="moXemChiTietTinBao(${0})" style="background: #0056b3; color: white; border: none; padding: 6px 15px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; align-self: flex-start; transition: 0.3s;">Đọc tiếp ➔</button>
                    </div>
                </div>
            `;

            let htmlTinNho = "";
            for (let i = 1; i < danhSachTin.length; i++) {
                const tin = danhSachTin[i];
                const ngayDang = new Date(tin.thoiGian).toLocaleDateString('vi-VN');
                htmlTinNho += `
                    <div class="sub-news-card" style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                        <div style="height: 200px; overflow: hidden;">
                            <img src="${tin.linkAnh}" alt="${tin.tieuDe}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                            <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; align-self: flex-start; margin-bottom: 10px;">${tin.chuyenMuc}</span>
                            <h3 style="color: #001f3f; font-size: 18px; font-weight: 700; line-height: 1.4; margin-bottom: 10px; flex: 1;">${tin.tieuDe}</h3>
                            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 15px;">📅 ${ngayDang}</p>
                            <button onclick="moXemChiTietTinBao(${i})" style="background: transparent; color: #0056b3; border: 1px solid #0056b3; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; width: 100%;">Đọc chi tiết</button>
                        </div>
                    </div>
                `;
            }
            if (tinNhoBox) tinNhoBox.innerHTML = htmlTinNho;
            window.KHO_TIN_TUC_TOAN_CUC = danhSachTin;
        })
        .catch(err => {
            tieuDiemBox.innerHTML = `<p style="text-align: center; padding: 30px; font-weight: bold; color: #e53e3e;">❌ Thao tác tải tin tức thất bại!</p>`;
        });
    }

    // 2. DÀNH CHO TRANG CHỦ (index.html)
    const tinTucTrangChuBox = document.getElementById("tinTucTrangChuBox");
    if (tinTucTrangChuBox) {
        fetch(MANG_LUOI_GOOGLE, { method: "POST", body: JSON.stringify({ action: "getNews" }) })
        .then(res => res.json())
        .then(danhSachTin => {
            if (danhSachTin.length === 0) {
                tinTucTrangChuBox.innerHTML = `<p style="text-align: center; color: #64748b;">Tòa soạn hiện tại chưa xuất bản bài viết nào.</p>`;
                return;
            }
            if (typeof tuDongTaoThongBaoTinTuc === 'function') tuDongTaoThongBaoTinTuc(danhSachTin);

            const tinMoiNhat = danhSachTin.slice(0, 2);
            let html = "";
            tinMoiNhat.forEach(tin => {
                let trichDan = tin.noiDung.replace(/<[^>]+>/g, '');
                html += `
                    <a href="tintuc.html" style="display: flex; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin-bottom: 20px; text-decoration: none; color: inherit; transition: 0.3s; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px; max-width: 300px; height: 180px;">
                            <img src="${tin.linkAnh}" alt="${tin.tieuDe}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="padding: 20px 25px; flex: 2; min-width: 250px; display: flex; flex-direction: column; justify-content: center;">
                            <span style="color: #e53e3e; font-size: 13px; font-weight: bold; margin-bottom: 8px;">${tin.chuyenMuc}</span>
                            <h3 style="color: #0056b3; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 10px; line-height: 1.4;">${tin.tieuDe}</h3>
                            <p style="color: #64748b; font-size: 14px; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;">${trichDan}</p>
                        </div>
                    </a>
                `;
            });
            html += `
                <div style="text-align: center; margin-top: 30px;">
                    <a href="tintuc.html" style="display: inline-block; padding: 12px 35px; background: #e2ebf4; color: #0056b3; font-size: 15px; font-weight: bold; border-radius: 30px; text-decoration: none; transition: background 0.3s;">Xem tất cả bảng tin ➔</a>
                </div>
            `;
            tinTucTrangChuBox.innerHTML = html;
        })
        .catch(err => {
            tinTucTrangChuBox.innerHTML = `<p style="text-align: center; color: #e53e3e; font-weight: bold;">❌ Lỗi kết nối! Không thể đồng bộ tin tức.</p>`;
        });
    }
});

function moXemChiTietTinBao(index) {
    const tin = window.KHO_TIN_TUC_TOAN_CUC[index];
    if (!tin) return;

    const popup = document.createElement('div');
    popup.id = "popupDocTinBao";
    // Tối ưu lại padding để hiển thị trên mobile không bị quá chật
    popup.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 15px; backdrop-filter: blur(3px);";
    const ngayDang = new Date(tin.thoiGian).toLocaleDateString('vi-VN');

    // CHIA BỐ CỤC LÀM 2 PHẦN: Header chứa nút TẮT (Không cuộn) và Body chứa Nội dung (Được cuộn)
    popup.innerHTML = `
        <div style="background: white; width: 100%; max-width: 800px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: slideUp 0.3s ease; overflow: hidden;">
            
            <div style="display: flex; justify-content: flex-end; padding: 15px 15px 0; background: white; z-index: 10;">
                <button onclick="document.getElementById('popupDocTinBao').remove()" style="background: #e53e3e; border: none; font-size: 18px; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-weight: bold; color: white; box-shadow: 0 4px 10px rgba(229, 62, 62, 0.3); transition: 0.2s;">✕</button>
            </div>

            <div style="padding: 0 30px 40px 30px; overflow-y: auto; flex: 1;">
                <span style="background: #f1f5f9; color: #0056b3; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${tin.chuyenMuc}</span>
                <h1 style="color: #001f3f; font-size: 26px; font-weight: 800; margin-top: 15px; margin-bottom: 10px; line-height: 1.3;">${tin.tieuDe}</h1>
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">📅 Ghi nhận ngày: ${ngayDang} | Tòa soạn VOVINAM EA M'DROH</p>
                
                <div style="width: 100%; max-height: 350px; overflow: hidden; border-radius: 12px; margin-bottom: 25px;">
                    <img src="${tin.linkAnh}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                
                <div class="news-main-rich-text" style="color: #334155; line-height: 1.8; font-size: 16px;">
                    ${tin.noiDung}
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        /* 1. CSS CHỐNG TRÀN ẢNH VÀ CHỮ TRÊN ĐIỆN THOẠI CHO NỘI DUNG BÀI VIẾT */
        .news-main-rich-text {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .news-main-rich-text img, .news-main-rich-text iframe, .news-main-rich-text video {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 10px; /* Bo góc ảnh cho mượt mắt */
            display: block;
            margin: 15px auto; /* Tự động căn giữa mọi ảnh trong bài */
        }
        .news-main-rich-text table {
            width: 100% !important;
            display: block;
            overflow-x: auto; /* Nếu có bảng tính thì cho phép cuộn ngang cái bảng thôi */
        }
        
        /* 2. CSS Tùy chỉnh các thẻ tiêu đề bên trong bài viết */
        .news-main-rich-text h2 { color: #001f3f; font-size: 22px; margin-top: 25px; margin-bottom: 15px; font-weight: 800; }
        .news-main-rich-text h3 { color: #0056b3; font-size: 19px; margin-top: 20px; margin-bottom: 12px; font-weight: 700; }
        .news-main-rich-text p { margin-bottom: 15px; text-align: justify; }
        .news-main-rich-text strong { font-weight: bold; color: #001f3f; }
        .news-main-rich-text ul, .news-main-rich-text ol { padding-left: 20px; margin-bottom: 15px; }

        /* 3. Reponsive tối ưu riêng cho Màn hình điện thoại */
        @media screen and (max-width: 768px) {
            #popupDocTinBao > div > div:nth-child(2) {
                padding: 0 20px 30px 20px !important; /* Thu nhỏ lề 2 bên để khoảng không gian chữ rộng hơn */
            }
            .news-main-rich-text p { 
                text-align: left; /* Chữ trên đt nếu căn justify dễ bị thưa khoảng trắng */ 
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(popup);
}

// ========================================================
// HỆ THỐNG QUẢN LÝ ĐƠN HÀNG VÀ LỊCH SỬ (ADMIN VÀ USER)
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById("bodyDanhSachDonHang")) taiDanhSachDonHang();
    
    if (document.getElementById("bodyLichSuDonHang")) {
        const daDangNhap = localStorage.getItem("daDangNhap");
        const hoTenNguoiDung = localStorage.getItem("tenDangNhap"); 
        if (daDangNhap !== "true" || !hoTenNguoiDung) {
            alert("⛔ Bạn cần đăng nhập để xem lịch sử mua hàng!");
            window.location.href = "dangnhap.html";
            return;
        }
        taiLichSuDonHangCuaToi(hoTenNguoiDung);
    }
});

function taiDanhSachDonHang() {
    const bang = document.getElementById("bodyDanhSachDonHang");
    bang.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; font-weight:bold; color:#64748b;">⏳ Đang tải danh sách đơn hàng...</td></tr>`;

    fetch(MANG_LUOI_GOOGLE, { method: "POST", body: JSON.stringify({ action: "getOrders" }) })
    .then(res => res.json())
    .then(danhSachDon => {
        if (danhSachDon.length === 0) {
            bang.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: #64748b;">Chưa có đơn đặt hàng nào trong hệ thống.</td></tr>`;
            return;
        }

        let html = "";
        const cacTrangThai = ["Chờ xử lý", "Đang chuẩn bị", "Đang giao hàng", "Đã hoàn thành", "Đã hủy"];
        danhSachDon.forEach(don => {
            const ngayDat = new Date(don.thoiGian).toLocaleString('vi-VN'); 
            let optionHtml = "";
            cacTrangThai.forEach(tt => {
                let selected = (don.trangThai === tt) ? "selected" : "";
                optionHtml += `<option value="${tt}" ${selected}>${tt}</option>`;
            });

            let mauNen = "#fef08a"; 
            if (don.trangThai === "Đã hoàn thành") mauNen = "#bbf7d0"; 
            if (don.trangThai === "Đã hủy") mauNen = "#fecaca"; 
            if (don.trangThai === "Đang giao hàng" || don.trangThai === "Đang chuẩn bị") mauNen = "#bfdbfe"; 

            html += `
                <tr style="border-bottom: 1px dashed #e2ebf4;">
                    <td style="padding: 15px; color: #64748b; font-size: 13px;">🕒 ${ngayDat}</td>
                    <td style="padding: 15px;">
                        <strong style="color: #001f3f;">${don.hoTen}</strong><br>
                        <span style="color: #e53e3e; font-weight: bold; font-size: 13px;">📞 ${don.sdt}</span><br>
                        <span style="color: #64748b; font-size: 13px;">📍 ${don.diaChi}</span><br>
                        <code style="background: #e2ebf4; padding: 2px 5px; border-radius: 4px; font-size: 12px; margin-top: 5px; display: inline-block;">Mã: ${don.maDonHang}</code>
                    </td>
                    <td style="padding: 15px; font-size: 14px; color: #475569; white-space: pre-wrap;">${don.chiTiet}</td>
                    <td style="padding: 15px; color: #e53e3e; font-weight: bold;">${don.tongTien}</td>
                    <td style="padding: 15px; text-align: center;">
                        <select onchange="HLV_DoiTrangThaiDon('${don.maDonHang}', this.value)" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #001f3f; cursor: pointer; outline: none; background-color: ${mauNen};">
                            ${optionHtml}
                        </select>
                    </td>
                </tr>
            `;
        });
        bang.innerHTML = html;
    })
    .catch(err => {
        bang.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #e53e3e; font-weight:bold;">❌ Lỗi mạng!</td></tr>`;
    });
}

function HLV_DoiTrangThaiDon(maDonHang, trangThaiMoi) {
    const xacNhan = confirm(`Bạn muốn chuyển đơn hàng [ ${maDonHang} ] sang trạng thái: "${trangThaiMoi}"?`);
    if (!xacNhan) { taiDanhSachDonHang(); return; }

    fetch(MANG_LUOI_GOOGLE, { method: "POST", body: JSON.stringify({ action: "updateOrderStatus", maDonHang: maDonHang, trangThaiMoi: trangThaiMoi }) })
    .then(res => res.text())
    .then(ketQua => {
        if (ketQua === "CapNhatDonThanhCong") {
            alert(`📦 Đã cập nhật trạng thái đơn hàng!`);
            taiDanhSachDonHang(); 
        } else {
            alert("Lỗi máy chủ: " + ketQua);
        }
    })
    .catch(err => alert("❌ Thao tác thất bại do lỗi mạng!"));
}

function taiLichSuDonHangCuaToi(hoTen) {
    const bang = document.getElementById("bodyLichSuDonHang");
    bang.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px; font-weight:bold; color:#64748b;">⏳ Đang dò tìm lịch sử mua hàng...</td></tr>`;

    fetch(MANG_LUOI_GOOGLE, { method: "POST", body: JSON.stringify({ action: "getMyOrders", hoTen: hoTen }) })
    .then(res => res.json())
    .then(danhSach => {
        if (danhSach.length === 0) {
            bang.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #64748b; font-size: 16px;">Bạn chưa đặt mua món đồ nào. <br><a href="cuahang.html" style="color: #0056b3; font-weight: bold; text-decoration: none; margin-top: 10px; display: inline-block;">🛒 Tham quan cửa hàng ngay</a></td></tr>`;
            return;
        }

        let html = "";
        danhSach.forEach(don => {
            const ngayDat = new Date(don.thoiGian).toLocaleString('vi-VN');
            let mauChu = "#ca8a04"; let mauNen = "#fef08a"; 
            if (don.trangThai === "Đã hoàn thành") { mauChu = "#16a34a"; mauNen = "#dcfce7"; }
            if (don.trangThai === "Đã hủy") { mauChu = "#dc2626"; mauNen = "#fee2e2"; }
            if (don.trangThai === "Đang giao hàng" || don.trangThai === "Đang chuẩn bị") { mauChu = "#2563eb"; mauNen = "#dbeafe"; }

            html += `
                <tr style="border-bottom: 1px dashed #e2ebf4;">
                    <td style="padding: 15px; color: #64748b; font-size: 13px;">
                        <code style="background: #e2ebf4; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: bold; color: #001f3f;">${don.maDonHang}</code><br>
                        <span style="display: inline-block; margin-top: 8px;">🕒 ${ngayDat}</span>
                    </td>
                    <td style="padding: 15px; font-size: 14px; color: #475569; white-space: pre-wrap; line-height: 1.5;">${don.chiTiet}</td>
                    <td style="padding: 15px; color: #e53e3e; font-weight: bold;">${don.tongTien}</td>
                    <td style="padding: 15px; text-align: center;">
                        <span style="background: ${mauNen}; color: ${mauChu}; padding: 6px 15px; border-radius: 20px; font-size: 13px; font-weight: bold;">${don.trangThai}</span>
                    </td>
                </tr>
            `;
        });
        bang.innerHTML = html;
    })
    .catch(err => {
        bang.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #e53e3e; font-weight:bold;">❌ Lỗi kết nối máy chủ!</td></tr>`;
    });
}

window.addEventListener('DOMContentLoaded', function() {
    const btnLichSu = document.getElementById("btnLichSuDonHang");
    if (btnLichSu) {
        const daDangNhap = localStorage.getItem("daDangNhap");
        if (daDangNhap === "true") btnLichSu.style.display = "inline-flex"; 
    }
});

// ========================================================
// HỆ THỐNG TRANG QUẢN LÝ HỌC PHÍ MÔN SINH (hocphi.html)
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById("bodyBangHocPhi")) {
        const daDangNhap = localStorage.getItem("daDangNhap");
        const hoTenNguoiDung = localStorage.getItem("tenDangNhap"); 
        const clbNguoiDung = localStorage.getItem("clbDangNhap"); 

        if (daDangNhap !== "true" || !hoTenNguoiDung) {
            alert("⛔ Bạn cần đăng nhập để xem thông tin học phí!");
            window.location.href = "dangnhap.html";
            return;
        }

        // Đắp thông tin cá nhân lên đầu trang
        const elTen = document.getElementById("hpTenMonSinh");
        const elCLB = document.getElementById("hpCLB");
        if (elTen) elTen.innerText = hoTenNguoiDung;
        if (elCLB) elCLB.innerText = `Đơn vị: ${clbNguoiDung}`;

        taiDuLieuHocPhiCaNhan(hoTenNguoiDung);
    }
});

function taiDuLieuHocPhiCaNhan(hoTen) {
    const bang = document.getElementById("bodyBangHocPhi");

    fetch(MANG_LUOI_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ action: "getHocPhi" })
    })
    .then(res => res.json())
    .then(danhSachAll => {
        // Lọc ra các dòng nộp tiền của chính môn sinh này
        const danhSachCuaToi = danhSachAll.filter(hp => hp.hoTen === hoTen);

        if (danhSachCuaToi.length === 0) {
            bang.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #64748b; font-size: 16px;">Hệ thống chưa ghi nhận dữ liệu học phí của bạn trong kỳ này.</td></tr>`;
            return;
        }

        let html = "";
        danhSachCuaToi.forEach(hp => {
            // Chuẩn hóa định dạng "Tháng"
            let thangHienThi = hp.thang;
            let objDate = new Date(thangHienThi);
            if (!isNaN(objDate.getTime())) {
                thangHienThi = "Tháng " + (objDate.getMonth() + 1) + "/" + objDate.getFullYear();
            }

            // Xử lý Giao diện Trạng thái
            let mauChu = "#ca8a04"; let mauNen = "#fef08a"; let nutThanhToan = "";
            
            if (hp.trangThai === "Đã nộp") { 
                mauChu = "#16a34a"; mauNen = "#dcfce7"; 
                nutThanhToan = `<span style="color: #10b981; font-weight: bold; font-style: italic;">✔ Hoàn tất</span>`;
            } 
            else if (hp.trangThai === "Chưa nộp") { 
                mauChu = "#dc2626"; mauNen = "#fee2e2"; 
                nutThanhToan = `<button onclick="moHienThiQRHocPhi('${hoTen}', '${thangHienThi}', '${hp.soTien}')" style="background: #e53e3e; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;">Thanh toán ngay</button>`;
            }

            html += `
                <tr style="border-bottom: 1px dashed #e2ebf4;">
                    <td style="padding: 15px; font-weight: bold; color: #001f3f;">🗓️ ${thangHienThi}</td>
                    <td style="padding: 15px; color: #e53e3e; font-weight: bold;">${hp.soTien}</td>
                    <td style="padding: 15px; text-align: center;">
                        <span style="background: ${mauNen}; color: ${mauChu}; padding: 6px 15px; border-radius: 20px; font-size: 13px; font-weight: bold;">${hp.trangThai}</span>
                    </td>
                    <td style="padding: 15px; text-align: center;">${nutThanhToan}</td>
                </tr>
            `;
        });
        bang.innerHTML = html;
    })
    .catch(err => {
        bang.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #e53e3e; font-weight:bold;">❌ Lỗi kết nối máy chủ!</td></tr>`;
    });
}

function moHienThiQRHocPhi(hoTen, thang, soTienChuoi) {
    // Ép số tiền "120.000VNĐ" thành số "120000" để sinh link QR
    const soTienSo = parseInt(soTienChuoi.replace(/\D/g,'')) || 0;
    
    // Tạo Cú pháp chuyển khoản (VD: Hoc phi Thang 5 - Pham Thi Hien)
    let thangKhongDau = thang.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '');
    let tenKhongDau = hoTen.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    const noiDungChuyenKhoan = `HP ${thangKhongDau} ${tenKhongDau}`;

    const maNganHang = "mbbank"; 
    const soTaiKhoan = "4567895177777"; 
    const tenTaiKhoan = "PHAM DUC LOC"; 
    const chuTaiKhoanQR = tenTaiKhoan.replace(/ /g, '%20');
    const qrNoiDung = noiDungChuyenKhoan.replace(/ /g, '%20');

    // Link API VietQR (Có thêm phần nội dung CK)
    const urlQR = `https://img.vietqr.io/image/${maNganHang}-${soTaiKhoan}-compact2.png?amount=${soTienSo}&addInfo=${qrNoiDung}&accountName=${chuTaiKhoanQR}`;

    // Đổ dữ liệu vào Modal
    document.getElementById("anhMaQRHocPhi").src = urlQR;
    document.getElementById("txtNoiDungHocPhi").innerText = noiDungChuyenKhoan;
    document.getElementById("txtSoTienHocPhi").innerText = soTienChuoi;
    document.getElementById("txtNganHangHocPhi").innerText = maNganHang;
    document.getElementById("txtChuTKHocPhi").innerText = tenTaiKhoan;

    // Hiển thị Modal
    document.getElementById("modalThanhToanHocPhi").style.display = "flex";
}

function dongPopupHocPhi() {
    const popup = document.getElementById('modalThanhToanHocPhi');
    if (popup) {
        popup.style.display = 'none';
        hienThiThongBao("✅ Cảm ơn bạn! Ban Chủ Nhiệm sẽ kiểm tra và xác nhận học phí sớm nhất.");
    }
}

// ========================================================
// HỆ THỐNG ĐỒNG BỘ CỬA HÀNG TỪ GOOGLE SHEETS (ĐÃ PHỤC HỒI)
// ========================================================

window.addEventListener('DOMContentLoaded', function() {
    // Chỉ chạy chức năng này nếu đang ở trang Cửa hàng
    if (document.getElementById("danhSachSanPham")) {
        taiDanhSachSanPham();
    }
});

function taiDanhSachSanPham() {
    const container = document.getElementById("danhSachSanPham");

    fetch(MANG_LUOI_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ action: "getProducts" })
    })
    .then(res => res.json())
    .then(danhSach => {
        window.KHO_SAN_PHAM_TOAN_CUC = danhSach; // Lưu toàn bộ kho hàng vào biến toàn cục
        hienThiSanPham(danhSach); // Vẽ giao diện
    })
    .catch(err => {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #e53e3e; font-weight: bold; padding: 40px;">❌ Lỗi kết nối máy chủ! Không tải được sản phẩm.</p>`;
    });
}

function hienThiSanPham(danhSach) {
    const container = document.getElementById("danhSachSanPham");
    if (danhSach.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 40px;">Cửa hàng hiện tại chưa có sản phẩm nào.</p>`;
        return;
    }

    let html = "";
    danhSach.forEach(sp => {
        let giaDinhDang = Number(sp.gia).toLocaleString('vi-VN');

        html += `
            <div class="product-card" data-category="${sp.loai}" style="background: white; border-radius: 15px; padding: 20px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); transition: transform 0.3s;">
                <a href="chitiet.html?id=${sp.id}" style="text-decoration: none; color: inherit;">
                    <img src="${sp.linkAnh}" alt="${sp.tenSanPham}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
                    <h3 style="font-size: 18px; color: #001f3f; margin-bottom: 10px;">${sp.tenSanPham}</h3>
                </a>
                <p class="price" style="color: #e53e3e; font-weight: bold; font-size: 16px; margin-bottom: 15px;">${giaDinhDang} VNĐ</p>
                
                <button onclick="themVaoGio('${sp.id}')" style="background: #0056b3; color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.3s;">🛒 Thêm vào giỏ</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ========================================================
// HIỂN THỊ CHI TIẾT SẢN PHẨM ĐỘNG (chitiet.html)
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById("chiTietSanPhamBox")) {
        taiChiTietSanPham();
    }
});

function taiChiTietSanPham() {
    const box = document.getElementById("chiTietSanPhamBox");
    const urlParams = new URLSearchParams(window.location.search);
    const idSanPham = urlParams.get('id');

    if (!idSanPham) {
        box.innerHTML = `<p style="text-align:center; color:#e53e3e; font-weight:bold; padding: 40px;">❌ Không tìm thấy mã sản phẩm!</p>`;
        return;
    }

    fetch(MANG_LUOI_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ action: "getProducts" }) 
    })
    .then(res => res.json())
    .then(danhSach => {
        window.KHO_SAN_PHAM_TOAN_CUC = danhSach; // Lưu để hàm themVaoGio hoạt động đúng
        const sp = danhSach.find(item => item.id === idSanPham);

        if (!sp) {
            box.innerHTML = `<p style="text-align:center; color:#e53e3e; font-weight:bold; padding: 40px;">❌ Sản phẩm này không tồn tại hoặc đã ngừng bán!</p>`;
            return;
        }

        let giaDinhDang = Number(sp.gia).toLocaleString('vi-VN');
        
        // --- ĐOẠN CODE MỚI XỬ LÝ SIZE TỰ ĐỘNG ---
        let sizeOptionsHtml = "";
        let mangSize = sp.size ? sp.size.split(',') : ["Mặc định"];
        mangSize.forEach(s => {
            let chuoiSizeCuaTungDong = s.trim();
            if (chuoiSizeCuaTungDong !== "") {
                sizeOptionsHtml += `<option value="${chuoiSizeCuaTungDong}">${chuoiSizeCuaTungDong}</option>`;
            }
        });
        // ----------------------------------------
        
        box.innerHTML = `
            <a href="cuahang.html" style="text-decoration: none; color: #0056b3; font-weight: bold; margin-bottom: 20px; display: inline-block;">⬅ Quay lại cửa hàng</a>
            
            <div style="display: flex; flex-wrap: wrap; gap: 40px; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
                
                <div style="flex: 1; min-width: 300px;">
                    <img src="${sp.linkAnh}" alt="${sp.tenSanPham}" style="width: 100%; border-radius: 10px; object-fit: cover; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                </div>
                
                <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column;">
                    <span style="background: #e2ebf4; color: #0056b3; padding: 5px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; align-self: flex-start; margin-bottom: 15px;">${sp.loai}</span>
                    <h1 style="font-size: 32px; color: #001f3f; margin-bottom: 10px; margin-top: 0;">${sp.tenSanPham}</h1>
                    <p style="font-size: 24px; color: #e53e3e; font-weight: bold; margin-bottom: 20px;">${giaDinhDang} VNĐ</p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                        <h4 style="margin-top: 0; color: #001f3f; margin-bottom: 10px;">📝 Mô tả sản phẩm:</h4>
                        <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0; white-space: pre-wrap;">${sp.moTa}</p>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="font-weight: bold; color: #001f3f; display: block; margin-bottom: 8px;">Chọn phân loại (Size):</label>
                        <select id="sizeSanPham_${sp.id}" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 15px;">
                            ${sizeOptionsHtml}
                        </select>
                    </div>
                    
                    <button onclick="themVaoGio('${sp.id}', document.getElementById('sizeSanPham_${sp.id}').value, 1)" style="background: #0056b3; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.3s; margin-top: auto; box-shadow: 0 5px 15px rgba(0,86,179,0.3);">
                        🛒 THÊM VÀO GIỎ HÀNG
                    </button>
                </div>
            </div>
        `;
    })
    .catch(err => {
        box.innerHTML = `<p style="text-align:center; color:#e53e3e; font-weight:bold; padding: 40px;">❌ Lỗi mạng, không tải được chi tiết!</p>`;
    });
}

// ========================================================
// HỆ THỐNG TẠO NÚT MENU DI ĐỘNG (HAMBURGER MENU)
// ========================================================
window.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const menu = document.querySelector('.menu');

    // Nếu tìm thấy thanh navbar và chưa có nút mobile nào
    if (navbar && menu && !document.querySelector('.mobile-menu-btn')) {
        // Tạo ra cái nút 3 gạch
        const btn = document.createElement('button');
        btn.className = 'mobile-menu-btn';
        btn.innerHTML = '☰'; 
        
        // Sự kiện khi bấm vào nút: Đóng/Mở menu thả xuống
        btn.onclick = function() {
            navbar.classList.toggle('mobile-active');
            
            // Đổi biểu tượng ☰ thành ✕ khi mở
            if (navbar.classList.contains('mobile-active')) {
                btn.innerHTML = '✕';
            } else {
                btn.innerHTML = '☰';
            }
        };

        // Bơm cái nút vào vị trí trước danh sách menu
        navbar.insertBefore(btn, menu);
    }
});

// ========================================================
// XỬ LÝ MÃ GIẢM GIÁ (ĐÃ KẾT NỐI VỚI GOOGLE SHEETS)
// ========================================================
function apDungVoucher() {
    const oNhapMa = document.getElementById('maVoucher');
    if (!oNhapMa) return;
    
    const maNhap = oNhapMa.value.trim().toUpperCase();

    if (maNhap === "") {
        hienThiThongBao("Vui lòng nhập mã giảm giá!", "loi");
        phanTramGiamGia = 0;
        window.MA_VOUCHER_DANG_DUNG = "";
        hienThiTrangGioHang();
        return;
    }

    // Yêu cầu phải đăng nhập mới dùng được Voucher (để check giới hạn mỗi người)
    const hoTenNguoiDung = localStorage.getItem("tenDangNhap");
    if (!hoTenNguoiDung) {
        hienThiThongBao("⚠️ Bạn cần đăng nhập để sử dụng mã giảm giá!", "loi");
        return;
    }

    // Đổi chữ nút bấm thành Đang xử lý để chống spam click
    const nutApDung = document.querySelector('button[onclick="apDungVoucher()"]');
    if (nutApDung) {
        nutApDung.innerText = "Đang dò mã...";
        nutApDung.disabled = true;
    }

    // Đóng gói dữ liệu gửi lên Apps Script (Gọi action "checkVoucher")
    const goiDuLieu = {
        action: 'checkVoucher',
        maVoucher: maNhap,
        hoTen: hoTenNguoiDung
    };

    fetch(MANG_LUOI_GOOGLE, {
        method: 'POST',
        body: JSON.stringify(goiDuLieu)
    })
    .then(res => res.text())
    .then(ketQua => {
        if (ketQua === "LoiSheet") {
            hienThiThongBao("❌ Lỗi hệ thống: Không tìm thấy kho Voucher!", "loi");
            ResetVoucher();
        } else if (ketQua === "KhongHopLe") {
            hienThiThongBao("❌ Mã giảm giá không hợp lệ hoặc không tồn tại!", "loi");
            ResetVoucher();
        } else if (ketQua === "HetLuot") {
            hienThiThongBao("❌ Bạn đã hết lượt sử dụng mã giảm giá này!", "loi");
            ResetVoucher();
        } else {
            // Nếu kết quả trả về là một con số (Phần trăm giảm)
            const phanTram = parseInt(ketQua);
            if (!isNaN(phanTram)) {
                phanTramGiamGia = phanTram;
                window.MA_VOUCHER_DANG_DUNG = maNhap;
                hienThiThongBao(`✅ Áp dụng thành công! Đơn hàng được giảm ${phanTramGiamGia}%`, "thanh-cong");
            }
        }
        hienThiTrangGioHang(); // Cập nhật lại giao diện số tiền
    })
    .catch(err => {
        hienThiThongBao("❌ Lỗi kết nối mạng! Không thể kiểm tra mã.", "loi");
    })
    .finally(() => {
        // Phục hồi lại nút bấm
        if (nutApDung) {
            nutApDung.innerText = "Áp dụng";
            nutApDung.disabled = false;
        }
    });
}

// Hàm phụ trợ để reset giá trị khi mã sai
function ResetVoucher() {
    phanTramGiamGia = 0;
    window.MA_VOUCHER_DANG_DUNG = "";
}

// ========================================================
// XỬ LÝ ĐẶT HÀNG (FIX LỖI NÚT XÁC NHẬN)
// ========================================================
function taoMaDonHang() {
    const chu = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const so = '0123456789';
    let ma = 'VN-';
    for (let i = 0; i < 2; i++) ma += chu.charAt(Math.floor(Math.random() * chu.length));
    for (let i = 0; i < 2; i++) ma += so.charAt(Math.floor(Math.random() * so.length));
    return ma;
}

function xacNhanDatHang() {
    if (gioHang.length === 0) {
        alert("⚠️ Giỏ hàng của bạn đang trống!");
        return;
    }

    // Lấy dữ liệu từ các ô input chuẩn theo giao diện mới
    const hoTen = document.getElementById('tenNguoiNhan').value.trim();
    const sdt = document.getElementById('sdtNguoiNhan').value.trim();
    const diaChi = document.getElementById('diaChiNhanHang').value.trim();
    const ghiChu = document.getElementById('ghiChuDonHang').value.trim();

    if (hoTen === "" || sdt === "") {
        alert("⚠️ Vui lòng nhập đầy đủ Họ tên và Số điện thoại để HLV liên hệ!");
        return;
    }

    // Hiệu ứng nút bấm đang loading
    const nutBam = document.querySelector('button[onclick="xacNhanDatHang()"]');
    if(nutBam) {
        nutBam.innerText = "🚀 ĐANG GỬI ĐƠN HÀNG...";
        nutBam.disabled = true;
    }

    const maDon = taoMaDonHang();
    let chiTietDon = "";
    let tongTienGocSo = 0; 
    
    gioHang.forEach(sp => {
        let giaSo = parseInt(String(sp.gia).toString().replace(/\./g, '').replace(' VNĐ', ''));
        tongTienGocSo += giaSo * sp.soLuong;
        chiTietDon += `- ${sp.soLuong}x ${sp.ten} (Size: ${sp.size})\n`; 
    });

    if (ghiChu !== "") {
        chiTietDon += `\n📌 Ghi chú thêm: ${ghiChu}`;
    }

    if (phanTramGiamGia > 0) {
        chiTietDon += `\n🎁 Đã dùng mã: ${window.MA_VOUCHER_DANG_DUNG} (${phanTramGiamGia}%)`;
    }

    let tongTienSo = window.tongTienCuoiCungSo || tongTienGocSo;
    let tongTienChuoi = window.tongTienCuoiCungChuoi || (tongTienGocSo.toLocaleString('vi-VN') + " VNĐ");

    const goiDuLieu = {
        action: 'order',
        maDonHang: maDon, 
        hoTen: hoTen,
        sdt: sdt,
        diaChi: diaChi,
        chiTiet: chiTietDon,
        tongTien: tongTienChuoi
    };

    // Gửi lên Google Sheets
    fetch(MANG_LUOI_GOOGLE, {
        method: 'POST',
        body: JSON.stringify(goiDuLieu)
    })
    .then(res => res.text())
    .then(ketQua => {
        if (ketQua === "DatHangThanhCong") {
            // Xóa giỏ hàng
            localStorage.removeItem("gioHangVovinam"); 
            gioHang = []; 
            
            // Render mã QR MB Bank
            const maNganHang = "mbbank"; 
            const soTaiKhoan = "4567895177777"; 
            const tenTaiKhoan = "PHAM DUC LOC"; 
            const tenKhongDau = tenTaiKhoan.replace(/ /g, '%20');
            const urlQR = `https://img.vietqr.io/image/${maNganHang}-${soTaiKhoan}-compact2.png?amount=${tongTienSo}&addInfo=${maDon}&accountName=${tenKhongDau}`;

            document.getElementById("anhMaQR").src = urlQR;
            document.getElementById("txtSoTien").innerText = tongTienChuoi;
            document.getElementById("txtNoiDung").innerText = maDon;
            
            document.getElementById("modalThanhToanQR").style.display = "flex";
            hienThiThongBao("Tạo đơn thành công! Vui lòng thanh toán.", "thanh-cong");
        } else {
            hienThiThongBao("❌ Lỗi máy chủ: " + ketQua, "loi");
        }
    })
    .catch(err => hienThiThongBao("❌ Lỗi mạng! Không thể gửi đơn hàng.", "loi"))
    .finally(() => {
        if(nutBam) {
            nutBam.innerText = "🚀 XÁC NHẬN ĐẶT HÀNG";
            nutBam.disabled = false;
        }
    });
}

// ========================================================
// TÍNH NĂNG QUÊN MẬT KHẨU (LIÊN HỆ BAN IT)
// ========================================================
function quenMatKhauIT(event) {
    event.preventDefault(); // Ngăn chặn trang bị cuộn lên đầu khi bấm thẻ <a>
    
    const xacNhan = confirm(
        "LƯU Ý CẤP LẠI MẬT KHẨU:\n\n" +
        "Hệ thống sẽ chuyển hướng bạn đến Zalo của Ban IT.\n" +
        "Vui lòng nhắn tin theo cú pháp sau để được hỗ trợ nhanh nhất:\n\n" +
        "👉 'Xin cấp lại mật khẩu - [Tên tài khoản hoặc Số điện thoại của bạn]'\n\n" +
        "Bạn có muốn tiếp tục đến Zalo ngay bây giờ không?"
    );
    
    if (xacNhan) {
        // Link Zalo của IT lấy theo thông tin footer
        window.open("https://zalo.me/0775922038", "_blank");
    }
}

// ========================================================
// HỆ THỐNG WIDGET CHAT CHO NGƯỜI DÙNG (KẾT NỐI GOOGLE SHEETS)
// ========================================================
const API_CHAT = "https://script.google.com/macros/s/AKfycbwDYWEvGNLaYN4WH-gWNnIpxeMoj-Qolgwfzi6UuAZfMbmPRk64GlcdMTdv1LIqmD9F5g/exec";

// Khai báo biến đếm thời gian cho Chatbot 15s
let timerChoPhanHoi = null;
let dangChoAdmin = false;

window.addEventListener('DOMContentLoaded', function() {
    if(window.location.pathname.includes("tinnhan.html") || window.location.pathname.includes("quanly") || window.location.pathname.includes("dang")) return;

    // Đã bổ sung khu vực div#chatQuickReplies để chứa nút bấm tự động
    const chatHTML = `
        <div class="chat-widget-btn" onclick="toggleChatWindow()">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div class="chat-widget-window" id="chatWidgetWindow">
            <div class="chat-window-header">
                <span>Hỗ trợ môn sinh</span>
                <button class="chat-close-btn" onclick="toggleChatWindow()">✕</button>
            </div>
            <div class="chat-window-body" id="chatWidgetBody">
                <div class="msg-bubble msg-admin">Chào bạn! Ban chủ nhiệm có thể giúp gì cho bạn?</div>
            </div>
            <div class="chat-quick-replies" id="chatQuickReplies">
                <!-- Nút tự động tải vào đây -->
            </div>
            <div class="chat-window-footer">
                <input type="text" id="chatWidgetInput" placeholder="Nhập tin nhắn..." onkeypress="if(event.key === 'Enter') guiTinNhanUser()">
                <button onclick="guiTinNhanUser()" style="display:flex; justify-content:center; align-items:center; background:none; border:none; cursor:pointer;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0056b3"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);
});

// Hàm gọi danh sách nút từ Google Sheets (Bổ sung tính năng tự bắt lỗi)
function taiNutChatbot() {
    fetch(API_CHAT, { 
        method: "POST", 
        body: JSON.stringify({ action: "getBotCommands" }) 
    })
    .then(res => {
        // Kiểm tra xem đường link Apps Script có bị lỗi không
        if (!res.ok) throw new Error("Máy chủ Google từ chối kết nối!");
        return res.json();
    })
    .then(commands => {
        const boxNut = document.getElementById('chatQuickReplies');
        if(!boxNut) return;
        boxNut.innerHTML = "";
        
        // Nếu trang tính rỗng hoặc sai tên, cảnh báo sẽ in ra Console
        if (!commands || commands.length === 0) {
            console.warn("Hệ thống nhận được danh sách rỗng. Hãy kiểm tra lại tên Sheet 'Chatbot' hoặc thao tác Deploy.");
            return;
        }

        // Đổ nút bấm ra màn hình
        commands.forEach(cmd => {
            boxNut.innerHTML += `<button class="btn-quick-reply" onclick="bamNutChatbot('${cmd.command}')">${cmd.command}</button>`;
        });
    })
    .catch(e => {
        console.error("Lỗi khi tải nút Chatbot:", e);
        hienThiThongBao("Không thể tải nút bấm! Vui lòng làm lại thao tác Deploy New Version trên Google Apps Script.", "loi");
    });
}

// Hàm giả lập người dùng bấm nút
function bamNutChatbot(lenh) {
    const input = document.getElementById('chatWidgetInput');
    if(input) {
        input.value = lenh;
        guiTinNhanUser(); // Tự động kích hoạt việc gửi
    }
}

function toggleChatWindow() {
    const chatWin = document.getElementById('chatWidgetWindow');
    if (chatWin.style.display === 'flex' || chatWin.style.display === 'block') {
        chatWin.style.display = 'none';
    } else {
        chatWin.style.display = 'flex';
        taiTinNhanCuaUser(); // Tải tin nhắn từ Sheet
        taiNutChatbot();     // Tải nút bấm
    }
}

// 1. Lấy dữ liệu từ Google Sheets về cho User
async function taiTinNhanCuaUser() {
    let taiKhoan = localStorage.getItem("taiKhoanDangNhap") || localStorage.getItem("guest_id");
    if (!taiKhoan) return;
    
    const chatBody = document.getElementById('chatWidgetBody');
    if(!chatBody) return;

    try {
        let res = await fetch(API_CHAT, { method: "POST", body: JSON.stringify({ action: "getChat" }) });
        let listChat = await res.json();
        
        chatBody.innerHTML = `<div class="msg-bubble msg-admin">Chào bạn! Ban chủ nhiệm có thể giúp gì cho bạn?</div>`;
        let myChats = listChat.filter(msg => msg.idUser === taiKhoan);
        
        // HỦY HẸN GIỜ 15s NẾU CÓ TIN NHẮN MỚI TỪ ADMIN HOẶC BOT
        if (myChats.length > 0) {
            let tinCuoi = myChats[myChats.length - 1];
            if (tinCuoi.sender === "admin") {
                dangChoAdmin = false;
                if (timerChoPhanHoi) clearTimeout(timerChoPhanHoi);
            }
        }

        myChats.forEach(msg => {
            let timeHienThi = "";
            if (msg.thoiGian) {
                let d = new Date(msg.thoiGian);
                let h = d.getHours().toString().padStart(2, '0');
                let m = d.getMinutes().toString().padStart(2, '0');
                timeHienThi = `<span style="display:block; font-size:10px; margin-top:4px; opacity:0.7; text-align:right;">${h}:${m} ${d.getDate()}/${d.getMonth()+1}</span>`;
            }

            if (msg.sender === "user") {
                chatBody.innerHTML += `<div class="msg-bubble msg-user">${msg.noiDung}${timeHienThi}</div>`;
            } else {
                chatBody.innerHTML += `<div class="msg-bubble msg-admin">${msg.noiDung}${timeHienThi}</div>`;
            }
        });
        chatBody.scrollTop = chatBody.scrollHeight;
    } catch(e) { console.log("Đang đồng bộ chat..."); }
}

// 2. Bắn tin nhắn lên Google Sheets
function guiTinNhanUser() {
    const input = document.getElementById('chatWidgetInput');
    if(!input) return;
    const msg = input.value.trim();
    if(!msg) return;

    let taiKhoan = localStorage.getItem("taiKhoanDangNhap");
    let tenNguoiDung = localStorage.getItem("tenDangNhap");

    if (!taiKhoan) {
        taiKhoan = localStorage.getItem("guest_id");
        if (!taiKhoan) {
            taiKhoan = "khach_" + Math.floor(Math.random() * 100000);
            localStorage.setItem("guest_id", taiKhoan);
        }
        tenNguoiDung = "Khách vãng lai";
    }

    let d = new Date();
    let h = d.getHours().toString().padStart(2, '0');
    let m = d.getMinutes().toString().padStart(2, '0');
    let timeHienThi = `<span style="display:block; font-size:10px; margin-top:4px; opacity:0.7; text-align:right;">${h}:${m} ${d.getDate()}/${d.getMonth()+1}</span>`;

    const chatBody = document.getElementById('chatWidgetBody');
    chatBody.innerHTML += `<div class="msg-bubble msg-user">${msg}${timeHienThi}</div>`;
    input.value = "";
    chatBody.scrollTop = chatBody.scrollHeight; 
    
    // THIẾT LẬP BỘ ĐẾM 15 GIÂY BÁO BẬN
    if (timerChoPhanHoi) clearTimeout(timerChoPhanHoi);
    dangChoAdmin = true;
    
    timerChoPhanHoi = setTimeout(() => {
        if (dangChoAdmin) {
            guiTinNhanBotBan("⏳ Bạn hãy chờ Thầy của mình nhé! Thầy chắc đang bận công việc gì đó rồi, bạn thông cảm giúp mình nhé!");
            dangChoAdmin = false;
        }
    }, 15000);

    fetch(API_CHAT, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "sendChat", idUser: taiKhoan, hoTen: tenNguoiDung, sender: "user", noiDung: msg })
    }).then(() => { setTimeout(taiTinNhanCuaUser, 1000); });
}

// 3. Hàm hỗ trợ gửi thẳng tin báo bận lên máy chủ dưới tư cách Admin
function guiTinNhanBotBan(noiDungBot) {
    let taiKhoan = localStorage.getItem("taiKhoanDangNhap") || localStorage.getItem("guest_id");
    const chatBody = document.getElementById('chatWidgetBody');
    
    let d = new Date();
    let h = d.getHours().toString().padStart(2, '0');
    let m = d.getMinutes().toString().padStart(2, '0');
    let timeHienThi = `<span style="display:block; font-size:10px; margin-top:4px; opacity:0.7; text-align:right;">${h}:${m} ${d.getDate()}/${d.getMonth()+1}</span>`;

    chatBody.innerHTML += `<div class="msg-bubble msg-admin">${noiDungBot}${timeHienThi}</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;

    fetch(API_CHAT, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "sendChat", idUser: taiKhoan, hoTen: "🤖 Trợ lý ảo Vovinam", sender: "admin", noiDung: noiDungBot })
    });
}

// 4. Tự động tải tin nhắn mới mỗi 3 giây
setInterval(() => {
    const chatWin = document.getElementById('chatWidgetWindow');
    if (chatWin && (chatWin.style.display === 'flex' || chatWin.style.display === 'block')) {
        taiTinNhanCuaUser();
    }
}, 3000);

// ========================================================
// HỆ THỐNG POP-UP THÔNG BÁO TỪ GOOGLE SHEETS (NÂNG CẤP BẬT/TẮT BẰNG MENU)
// ========================================================

// 1. Hàm tự động chạy khi vào trang chủ
window.addEventListener('DOMContentLoaded', async function() {
    if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") return;
    if (sessionStorage.getItem("daXemPopup")) return;
    
    // Gọi hàm hiển thị với tham số tự động
    hienThiPopup(false); 
});

// 2. Hàm khi người dùng chủ động bấm vào menu
function moLaiPopupThongBao() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) dropdown.classList.remove('show');
    
    let vaiTro = localStorage.getItem("vaiTroDangNhap");
    
    if (vaiTro === "Admin") {
        // Chuyển thẳng về trang Quản lý môn sinh và tự động cuộn xuống khu vực sửa Pop-up
        window.location.href = "quanlymonsinh.html#quanly-popup";
    } else {
        hienThiPopup(true); 
    }
}

// 3. Hàm xử lý logic gọi dữ liệu từ Sheet (Dùng chung cho cả 2 trường hợp)
async function hienThiPopup(laNguoiDungTuBam) {
    let tenNguoiDung = localStorage.getItem("tenDangNhap") || "bạn";

    try {
        let res = await fetch(API_CHAT, { // Đảm bảo API_CHAT đã được khai báo ở trên
            method: "POST",
            body: JSON.stringify({ action: "getPopup" })
        });
        let data = await res.json();

        if (data.trangThai === "Bật" && data.tieuDe && data.noiDung) {
            let noiDungThongBao = data.noiDung.replace(/{ten}/g, `<strong>${tenNguoiDung}</strong>`);
            noiDungThongBao = noiDungThongBao.replace(/\n/g, '<br>');

            // Nếu đang có popup cũ trên màn hình thì xóa đi trước khi tạo cái mới
            let oldPopup = document.getElementById('thongBaoPopup');
            if (oldPopup) oldPopup.remove();

            const popupHTML = `
                <div class="popup-overlay" id="thongBaoPopup">
                    <div class="popup-box">
                        <button class="popup-close" onclick="dongPopup()">✕</button>
                        <div class="popup-icon">📣</div>
                        <h3 class="popup-title">${data.tieuDe}</h3>
                        <p class="popup-content">${noiDungThongBao}</p>
                        <button class="popup-btn" onclick="dongPopup()">ĐÃ RÕ VÀ TẮT THÔNG BÁO</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            
            setTimeout(() => {
                const popup = document.getElementById('thongBaoPopup');
                if(popup) popup.classList.add('show');
            }, 100);

        } else {
            // Nếu Ban chủ nhiệm đang TẮT thông báo mà môn sinh cố tình bấm xem
            if (laNguoiDungTuBam) {
                alert("📣 Hiện tại Ban Chủ Nhiệm chưa có thông báo nội bộ nào mới!");
            }
        }
    } catch(e) {
        if (laNguoiDungTuBam) alert("⚠️ Không thể tải thông báo lúc này, vui lòng kiểm tra kết nối mạng.");
    }
}

// 4. Hàm đóng Pop-up
function dongPopup() {
    const popup = document.getElementById('thongBaoPopup');
    if(popup) {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
        sessionStorage.setItem("daXemPopup", "true"); 
    }
}

// ========================================================
// HỆ THỐNG UX BUILDER (LOGIC THÊM VÀ XÓA KHỐI)
// ========================================================

function themKhoiBuilder(loai) {
    const canvas = document.getElementById('builderCanvas');
    const emptyMsg = canvas.querySelector('.empty-canvas-msg');
    if (emptyMsg) emptyMsg.remove(); // Xóa dòng chữ "Khu vực thiết kế" khi bắt đầu thêm

    // Tạo một ID duy nhất cho khối để dễ dàng nhắm mục tiêu khi Xóa
    const blockId = 'block_' + Date.now();
    const blockWrapper = document.createElement('div');
    blockWrapper.className = 'builder-block-wrapper';
    blockWrapper.id = blockId;

    // Mã HTML của thanh công cụ Mini chứa nút XÓA
    const controlsHtml = `
        <div class="block-controls">
            <button onclick="diChuyenKhoi('${blockId}', -1)" title="Lên trên"><i class="fa-solid fa-arrow-up"></i></button>
            <button onclick="diChuyenKhoi('${blockId}', 1)" title="Xuống dưới"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="btn-delete" onclick="xoaKhoi('${blockId}')" title="Xóa khối này"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

    let contentHtml = '';

    // Sinh mã HTML tùy thuộc vào nút bạn vừa bấm
    switch (loai) {
        case 'heading':
            contentHtml = `<h2 class="vd-heading builder-edit-area" contenteditable="true">Nhập Tiêu đề...</h2>`;
            break;
        case 'paragraph':
            contentHtml = `<p class="vd-paragraph builder-edit-area" contenteditable="true">Nhập nội dung đoạn văn chi tiết...</p>`;
            break;
        case 'image':
            contentHtml = `<div style="text-align:center;">
                <input type="text" class="builder-edit-area" placeholder="Dán link hình ảnh (URL)..." onchange="this.nextElementSibling.src = this.value">
                <img src="https://via.placeholder.com/800x400?text=Thay+link+anh+de+hien+thi" class="vd-image">
            </div>`;
            break;
        case 'iconbox':
            contentHtml = `
            <div class="vd-iconbox-container">
                <div class="vd-iconbox">
                    <input type="text" class="builder-edit-area" style="font-family:'FontAwesome'; font-weight:900;" placeholder="Mã Icon (VD: fas fa-star)" value="fas fa-shield-halved">
                    <h4 class="builder-edit-area" contenteditable="true">Tên Biểu Tượng</h4>
                    <p class="builder-edit-area" contenteditable="true">Mô tả ngắn gọn.</p>
                </div>
            </div>`;
            break;
        case 'button':
            contentHtml = `<div style="text-align:center;">
                <a href="#" class="vd-button builder-edit-area" contenteditable="true">Nội dung nút bấm</a><br>
                <input type="text" class="builder-edit-area" style="width: 200px; margin-top:10px; font-size:12px;" placeholder="Link trỏ tới (VD: dangky.html)">
            </div>`;
            break;
        case 'divider':
            contentHtml = `<hr class="vd-divider">`;
            break;
    }

    // Đẩy cả thanh công cụ và nội dung vào Canvas
    blockWrapper.innerHTML = controlsHtml + contentHtml;
    canvas.appendChild(blockWrapper);
}

// Lệnh thực thi khi bấm nút XÓA (Thùng rác)
function xoaKhoi(id) {
    if(confirm("Bạn có chắc chắn muốn xóa khối này?")) {
        document.getElementById(id).remove(); // Định vị đúng ID và xóa nó đi
        
        // Nếu xóa hết khối, hiện lại dòng chữ hướng dẫn
        const canvas = document.getElementById('builderCanvas');
        if(canvas.children.length === 0) {
            canvas.innerHTML = `<div class="empty-canvas-msg" style="text-align: center; color: #94a3b8; font-weight: 600; padding: 100px 0;"><i class="fa-solid fa-layer-group" style="font-size: 40px; margin-bottom: 15px; color: #cbd5e1;"></i><br>Khu vực thiết kế.<br>Hãy bấm thêm các khối ở bên trái để bắt đầu xây dựng!</div>`;
        }
    }
}

// Lệnh thực thi Di chuyển khối Lên / Xuống
function diChuyenKhoi(id, chieu) {
    const block = document.getElementById(id);
    if (!block) return;
    
    const wrapper = block.parentNode;
    if (chieu === -1 && block.previousElementSibling) {
        wrapper.insertBefore(block, block.previousElementSibling);
    } else if (chieu === 1 && block.nextElementSibling) {
        wrapper.insertBefore(block.nextElementSibling, block);
    }
}

// Lệnh Xuất Bản trang lên Google Sheets
function luuTrangGioiThieu() {
    const canvas = document.getElementById('builderCanvas');
    if(canvas.querySelector('.empty-canvas-msg')) {
        alert("⚠️ Không có nội dung nào để lưu!");
        return;
    }

    const btn = document.getElementById('btnLuuPageBuilder');
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ĐANG XUẤT BẢN...`;
    btn.disabled = true;

    // Nhân bản Canvas để lọc bỏ các mã rác (nút Xóa, Lên, Xuống) trước khi lưu
    let cleanCanvas = canvas.cloneNode(true);
    cleanCanvas.querySelectorAll('.block-controls').forEach(el => el.remove());
    
    cleanCanvas.querySelectorAll('.builder-edit-area').forEach(el => {
        el.removeAttribute('contenteditable');
        el.classList.remove('builder-edit-area');
        if (el.tagName === 'INPUT') {
            if (el.placeholder.includes('Dán link')) el.remove();
            else if (el.placeholder.includes('Link trỏ tới')) {
                let btnNode = el.previousElementSibling.previousElementSibling;
                if(btnNode) btnNode.href = el.value || '#';
                el.remove();
            }
            else if (el.placeholder.includes('Mã Icon')) {
                let iconClass = el.value || 'fas fa-star';
                let iconNode = document.createElement('i');
                iconNode.className = iconClass;
                el.parentNode.insertBefore(iconNode, el);
                el.remove();
            }
        }
    });

    const rawHTML = cleanCanvas.innerHTML;

    fetch(MANG_LUOI_GOOGLE, {
        method: "POST",
        body: JSON.stringify({ action: "saveAboutPage", htmlContent: rawHTML })
    })
    .then(res => res.text())
    .then(ketQua => {
        if(ketQua === "LuuTrangThanhCong") hienThiThongBao("🎉 Đã xuất bản trang Giới thiệu thành công!");
        else hienThiThongBao("Lỗi máy chủ!", "loi");
    })
    .catch(err => hienThiThongBao("Lỗi kết nối mạng!", "loi"))
    .finally(() => {
        btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> XUẤT BẢN TRANG`;
        btn.disabled = false;
    });
}

// ========================================================
// TÍNH NĂNG CHẾ ĐỘ TỐI (DARK MODE)
// ========================================================

// 1. Kiểm tra trạng thái lưu trong bộ nhớ khi vừa tải trang
window.addEventListener('DOMContentLoaded', function() {
    const isDarkMode = localStorage.getItem('vovinamDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        capNhatIconDarkMode(true);
    }
});

// 2. Hàm xử lý khi người dùng bấm nút 🌙 / ☀️
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode'); // Bật/tắt class giao diện tối
    
    const isDark = body.classList.contains('dark-mode');
    
    // Lưu lựa chọn vào bộ nhớ trình duyệt để không bị mất khi tải lại trang
    localStorage.setItem('vovinamDarkMode', isDark);
    
    // Đổi icon tương ứng
    capNhatIconDarkMode(isDark);
}

// 3. Cập nhật biểu tượng Mặt trăng / Mặt trời
function capNhatIconDarkMode(isDark) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        if (isDark) {
            // Icon Mặt trời (Màu vàng sáng)
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #ffc107;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        } else {
            // Icon Mặt trăng (Màu mặc định)
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }
    }
}

// ========================================================
// TÍNH NĂNG ẨN / HIỆN MẬT KHẨU
// ========================================================
function togglePassword(inputId, btnElement) {
    const input = document.getElementById(inputId);
    
    // Nếu đang là mật khẩu ẩn -> Đổi thành chữ hiển thị & đổi icon mắt nhắm chéo
    if (input.type === "password") {
        input.type = "text";
        btnElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`;
    } 
    // Nếu đang là chữ hiển thị -> Đổi về mật khẩu ẩn & đổi icon mắt mở
    else {
        input.type = "password";
        btnElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
    }
}

// ========================================================
// HỆ THỐNG KÍCH HOẠT ỨNG DỤNG PWA
// ========================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(dangKy => {
                console.log('✅ Hệ thống PWA đã sẵn sàng!');
            })
            .catch(loi => {
                console.log('❌ Lỗi khởi động PWA: ', loi);
            });
    });
}