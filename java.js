// Hiện/ẩn ô tìm kiếm khi bấm kính lúp
const searchIcon = document.getElementById('searchIcon');
const searchInput = document.getElementById('searchInput');
if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', function (e) {
        e.preventDefault();
        if (searchInput.style.display === 'none' || searchInput.style.display === '') {
            searchInput.style.display = 'block';
            searchInput.focus();
        } else {
            searchInput.style.display = 'none';
        }
    });
    // Ẩn ô tìm kiếm khi click ra ngoài
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchIcon.contains(e.target)) {
            searchInput.style.display = 'none';
        }
    });
}

// ========== CART MANAGEMENT ==========
// Lưu giỏ hàng vào localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Lấy cart icon
const cartIcon = document.getElementById('cartIcon');
if (cartIcon) {
    cartIcon.addEventListener('click', function (e) {
        e.preventDefault();
        openCartModal();
    });
}

// Mở modal giỏ hàng
function openCartModal() {
    const cartModal = document.getElementById('cartModal');
    const cartModalContent = document.getElementById('cartModalContent');
    cartModal.classList.add('active');
    cartModalContent.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCart();
}

// Đóng modal giỏ hàng
function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    const cartModalContent = document.getElementById('cartModalContent');
    cartModal.classList.remove('active');
    cartModalContent.classList.remove('active');
    document.body.style.overflow = '';
}

// Thêm sản phẩm vào giỏ
function addToCart(product) {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Hiển thị thông báo lỗi
        showLoginRequiredMessage();
        return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price.split('-')[0].replace('$', '')),
            image: product.image,
            qty: 1
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    // Hiển thị thông báo thành công
    showAddToCartMessage(product.name);
}

// Xóa sản phẩm khỏi giỏ
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Cập nhật số lượng
function updateQty(productId, newQty) {
    if (newQty <= 0) {
        removeFromCart(productId);
    } else {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.qty = newQty;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    }
}

// Render giỏ hàng
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        cartEmpty.style.display = 'block';
        cartSummary.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartSummary.style.display = 'block';

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQty(${item.id}, ${item.qty - 1})">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, ${item.qty + 1})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        cartTotal.textContent = '$' + total.toFixed(2);
    }
}

// Thêm nút "Add to Cart" cho mỗi sản phẩm
document.addEventListener('DOMContentLoaded', function () {
    // Render initial cart count
    renderCart();
});


// Hàm tìm kiếm sản phẩm theo tên
function searchProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) return;
    // Lấy tất cả sản phẩm từ các category, loại trùng theo ID
    const productMap = new Map();
    Object.values(productData).forEach(catProducts => {
        catProducts.forEach(product => {
            if (!productMap.has(product.id)) {
                productMap.set(product.id, product);
            }
        });
    });
    const allProducts = Array.from(productMap.values());
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(keyword));
    // Hiện product listing, ẩn trending
    const productListing = document.getElementById('productListing');
    const productGrid = document.getElementById('productGrid');
    const trendingSection = document.querySelector('.trending-product');
    trendingSection.style.display = 'none';
    productListing.style.display = 'block';
    document.getElementById('categoryTitle').textContent = `Kết quả cho "${keyword}"`;
    if (filtered.length === 0) {
        productGrid.innerHTML = '<div style="padding:24px;">Không tìm thấy sản phẩm phù hợp.</div>';
    } else {
        productGrid.innerHTML = filtered.map(product => `
            <div class="row">
                <img src="${product.image}" alt="${product.name}">
                ${product.tag ? `<div class="product-text"><h5>${product.tag}</h5></div>` : ''}
                <div class="quick-view">
                    <i class='bx bx-show'></i>
                </div>
                <div class="heart-icon">
                    <i class='bx bx-heart'></i>
                </div>
                <div class="rating">
                    ${generateStars(product.rating)}
                </div>
                <div class="color-options">
                    <span>${product.colors} Color${product.colors > 1 ? 's' : ''}</span>
                </div>
                <div class="price">
                    <h4>${product.name}</h4>
                    <p>${product.price}</p>
                    <button class="add-to-cart-btn" onclick="addToCart({id:${product.id}, name:'${product.name}', price:'${product.price}', image:'${product.image}', tag:'${product.tag}', rating:${product.rating}, colors:${product.colors}})">Thêm vào giỏ</button>
                </div>
            </div>
        `).join('');
    }
    productListing.scrollIntoView({ behavior: 'smooth' });
}

// Sticky header on scroll
const header = document.querySelector("header");
window.addEventListener("scroll", function () {
    header.classList.toggle("sticky", this.window.scrollY > 0);
});

// Toggle mobile menu
let menu = document.querySelector('#menu-icon');
let navmenu = document.querySelector('.navmenu');
menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navmenu.classList.toggle('open');
};

// Check user on page load
window.onload = function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        console.log('Current user:', currentUser.username);
    }
};

// Modal open/close logic for login/register
const modal = document.getElementById('authModal');
const userIcon = document.getElementById('userIcon');
userIcon.onclick = (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Not logged in: show modal
        const modal = document.getElementById('authModal');
        const modalContent = document.getElementById('modalContent');
        modal.classList.add('active');
        modalContent.classList.add('active');
        document.body.style.overflow = 'hidden';
        showLogin(); // Always show login first
    } else {
        // Logged in: show logout confirmation modal
        const logoutUsernameEl = document.getElementById('logoutUsername');
        logoutUsernameEl.textContent = 'Bạn đang đăng nhập với: ' + currentUser.username;
        openLogoutModal();
    }
};

// Close modal and reset forms/messages
function closeModal() {
    const modal = document.getElementById('authModal');
    const modalContent = document.getElementById('modalContent');
    modal.classList.remove('active');
    modalContent.classList.remove('active');
    document.body.style.overflow = '';
    clearMessages();
    resetForms();
}

// Switch between login/register tabs in modal
function showTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.form-container');
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
    clearMessages();
}

// Handle user registration
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    if (password !== confirmPassword) {
        showMessage('messageContainer', 'Passwords do not match!', 'error');
        return;
    }
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.username === username)) {
        showMessage('messageContainer', 'Username already exists!', 'error');
        return;
    }
    const newUser = {
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showMessage('messageContainer', 'Account created successfully! Redirecting...', 'success');
    setTimeout(() => {
        showLogin();
        document.getElementById('loginUsername').value = username;
        checkLoginForm();
    }, 1500);
}

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            email: user.email
        }));
        showMessage('messageContainer', 'Login successful! Welcome back.', 'success');
        setTimeout(() => {
            updateUIForLoggedInUser(user);
            closeModal();
        }, 1000);
    } else {
        showMessage('messageContainer', 'Invalid username or password!', 'error');
    }
}

// Handle user logout
function handleLogout() {
    localStorage.removeItem('currentUser');

    // Show success message with animation
    closeLogoutModal();
    const messageContainer = document.createElement('div');
    messageContainer.className = 'logout-success-notification';
    messageContainer.innerHTML = '<i class="bx bx-check-circle"></i> Đã đăng xuất thành công!';
    document.body.appendChild(messageContainer);

    // Auto reload after animation
    setTimeout(() => {
        messageContainer.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageContainer.classList.remove('show');
        setTimeout(() => {
            messageContainer.remove();
            location.reload();
        }, 400);
    }, 2500);
}

// Open logout confirmation modal
function openLogoutModal() {
    const logoutModal = document.getElementById('logoutModal');
    const logoutModalContent = document.getElementById('logoutModalContent');
    logoutModal.classList.add('active');
    logoutModalContent.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close logout confirmation modal
function closeLogoutModal() {
    const logoutModal = document.getElementById('logoutModal');
    const logoutModalContent = document.getElementById('logoutModalContent');
    logoutModal.classList.remove('active');
    logoutModalContent.classList.remove('active');
    document.body.style.overflow = '';
}

// Confirm logout
function confirmLogout() {
    handleLogout();
}

// Hiển thị thông báo yêu cầu đăng nhập
function showLoginRequiredMessage() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'toast-notification error';
    messageContainer.innerHTML = '<i class="bx bx-info-circle"></i> Vui lòng đăng nhập để thêm vào giỏ hàng!';
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageContainer.classList.remove('show');
        setTimeout(() => {
            messageContainer.remove();
        }, 400);
    }, 4000);
}

// Hiển thị thông báo thêm vào giỏ thành công
function showAddToCartMessage(productName) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'toast-notification success';
    messageContainer.innerHTML = `<i class="bx bx-check-circle"></i> ${productName} đã được thêm vào giỏ hàng!`;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageContainer.classList.remove('show');
        setTimeout(() => {
            messageContainer.remove();
        }, 400);
    }, 3500);
}
// Update UI after login (placeholder)
function updateUIForLoggedInUser(user) {
    console.log('User logged in:', user.username);
}

// Show a message in the modal
function showMessage(elementId, message, type) {
    const container = document.getElementById(elementId);
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;

    container.innerHTML = '';
    container.appendChild(messageEl);

    // Auto-hide message after 4 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.style.animation = 'slideOutUp 0.4s ease-out forwards';
                setTimeout(() => {
                    messageEl.remove();
                }, 400);
            }
        }, 4000);
    }
}

// Clear all messages in the modal
function clearMessages() {
    document.getElementById('messageContainer').innerHTML = '';
}

// Reset all login/register forms
function resetForms() {
    // Reset login form
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginBtn').classList.remove('active');
    // Reset register form
    document.getElementById('regUsername').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
    document.getElementById('registerBtn').classList.remove('active');
}

// Show register tab in modal
function showRegister() {
    document.getElementById('modalTitle').textContent = 'Sign up';
    document.getElementById('welcomeTitle').textContent = 'Create an account';
    document.getElementById('welcomeSubtitle').textContent = 'Join us and start your shopping journey';
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    clearMessages();
}

// Show login tab in modal
function showLogin() {
    document.getElementById('modalTitle').textContent = 'Login';
    document.getElementById('welcomeTitle').textContent = 'Welcome back!';
    document.getElementById('welcomeSubtitle').textContent = 'Please login to access your account';
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    clearMessages();
}

// Enable/disable login button based on form input
function checkLoginForm() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    if (username && password) {
        loginBtn.classList.add('active');
    } else {
        loginBtn.classList.remove('active');
    }
}

// Enable/disable register button based on form input
function checkRegisterForm() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const registerBtn = document.getElementById('registerBtn');
    if (username && email && password && confirmPassword) {
        registerBtn.classList.add('active');
    } else {
        registerBtn.classList.remove('active');
    }
}

// ========== SAMPLE PRODUCT DATA ==========
const productData = {
    new: [
        {
            id: 2,
            name: "Formal Men Lowers",
            price: "$99 - $129",
            image: "image/2.jpg",
            tag: "New",
            rating: 5,
            colors: 2
        },
        {
            id: 9,
            name: "Casual Cotton Shirt",
            price: "$79 - $99",
            image: "image/9.jpg",
            tag: "New",
            rating: 4.5,
            colors: 2
        },
        {
            id: 12,
            name: "Summer Sundress",
            price: "$69 - $89",
            image: "image/12.jpg",
            tag: "New",
            rating: 4.5,
            colors: 2
        }
    ],
    men: [
        {
            id: 9,
            name: "Casual Cotton Shirt",
            price: "$79 - $99",
            image: "image/9.jpg",
            tag: "New",
            rating: 4.5,
            colors: 2
        },
        {
            id: 10,
            name: "Elegant Evening Gown",
            price: "$149 - $189",
            image: "image/10.jpg",
            tag: "Hot",
            rating: 5,
            colors: 3
        },
        {
            id: 11,
            name: "Denim Jacket",
            price: "$89 - $119",
            image: "image/11.jpg",
            tag: "Sale",
            rating: 4.5,
            colors: 1
        },
        {
            id: 12,
            name: "Summer Sundress",
            price: "$69 - $89",
            image: "image/12.jpg",
            tag: "New",
            rating: 4.5,
            colors: 2
        },
        {
            id: 13,
            name: "Classic Blazer",
            price: "$119 - $149",
            image: "image/13.jpg",
            tag: "Hot",
            rating: 4.5,
            colors: 2
        },
        {
            id: 14,
            name: "Vintage Sweater",
            price: "$79 - $109",
            image: "image/14.jpg",
            tag: "Sale",
            rating: 4.5,
            colors: 1
        },
        {
            id: 15,
            name: "Athletic Leggings",
            price: "$59 - $79",
            image: "image/15.jpg",
            tag: "New",
            rating: 4.5,
            colors: 2
        },
        {
            id: 16,
            name: "Wool Overcoat",
            price: "$179 - $219",
            image: "image/16.jpg",
            tag: "Hot",
            rating: 5,
            colors: 1
        }
    ],
    women: [
        {
            id: 1,
            name: "Half Running Set",
            price: "$99 - $129",
            image: "image/1.jpg",
            tag: "Sale",
            rating: 4.5,
            colors: 2
        },
        {
            id: 2,
            name: "Formal Men Lowers",
            price: "$99 - $129",
            image: "image/2.jpg",
            tag: "New",
            rating: 5,
            colors: 2
        },
        {
            id: 3,
            name: "Half Running Suit",
            price: "$99 - $129",
            image: "image/3.jpg",
            tag: "Sale",
            rating: 4.5,
            colors: 1
        },
        {
            id: 4,
            name: "Half Fancy Lady Dress",
            price: "$99 - $129",
            image: "image/4.jpg",
            tag: "Hot",
            rating: 4.5,
            colors: 1
        },
        {
            id: 5,
            name: "Flix Flox Jeans",
            price: "$99 - $129",
            image: "image/5.jpg",
            tag: "Sale",
            rating: 4.5,
            colors: 1
        },
        {
            id: 6,
            name: "Fancy Salwar Suits",
            price: "$99 - $129",
            image: "image/6.jpg",
            tag: "Hot",
            rating: 4.5,
            colors: 2
        },
        {
            id: 7,
            name: "Printed Straight Kurta",
            price: "$99 - $129",
            image: "image/7.jpg",
            tag: "Sale",
            rating: 4.5,
            colors: 2
        },
        {
            id: 8,
            name: "Collot Full Dress",
            price: "$99 - $129",
            image: "image/8.jpg",
            tag: "Sale",
            rating: 5,
            colors: 1
        }
    ]
};

// ========== SHOW PRODUCTS BY CATEGORY ==========
function showProducts(category) {
    const productListing = document.getElementById('productListing');
    const productGrid = document.getElementById('productGrid');
    const categoryTitle = document.getElementById('categoryTitle');
    const trendingSection = document.querySelector('.trending-product');

    // Ẩn trending products, hiện product listing
    trendingSection.style.display = 'none';
    productListing.style.display = 'block';

    // Scroll to section
    productListing.scrollIntoView({ behavior: 'smooth' });

    // Update title
    const titles = {
        'new': 'NEW Collection',
        'men': 'Men\'s Products',
        'women': 'Women\'s Products',
        'all': 'All Products'
    };
    categoryTitle.textContent = titles[category] || 'Products';

    // Get products
    let products = [];
    if (category === 'all') {
        // Combine all products and remove duplicates by id - sử dụng Map để đảm bảo không trùng
        const productMap = new Map();
        // Lấy từ women (8 products)
        if (productData.women) {
            productData.women.forEach(product => {
                productMap.set(product.id, product);
            });
        }
        // Lấy từ men (8 products) - sẽ ghi đè nếu trùng ID
        if (productData.men) {
            productData.men.forEach(product => {
                if (!productMap.has(product.id)) {
                    productMap.set(product.id, product);
                }
            });
        }
        // Lấy từ new (3 products) - sẽ ghi đè nếu trùng ID
        if (productData.new) {
            productData.new.forEach(product => {
                if (!productMap.has(product.id)) {
                    productMap.set(product.id, product);
                }
            });
        }
        // Chuyển Map thành array và sắp xếp theo ID
        products = Array.from(productMap.values()).sort((a, b) => a.id - b.id);
    } else {
        products = productData[category] || [];
    }

    // Render products
    productGrid.innerHTML = products.map(product => `
        <div class="row">
            <img src="${product.image}" alt="${product.name}">
            ${product.tag ? `<div class="product-text"><h5>${product.tag}</h5></div>` : ''}
            <div class="quick-view">
                <i class='bx bx-show'></i>
            </div>
            <div class="heart-icon">
                <i class='bx bx-heart'></i>
            </div>
            <div class="rating">
                ${generateStars(product.rating)}
            </div>
            <div class="color-options">
                <span>${product.colors} Color${product.colors > 1 ? 's' : ''}</span>
            </div>
            <div class="price">
                <h4>${product.name}</h4>
                <p>${product.price}</p>
                <button class="add-to-cart-btn" onclick="addToCart({id:${product.id}, name:'${product.name}', price:'${product.price}', image:'${product.image}', tag:'${product.tag}', rating:${product.rating}, colors:${product.colors}})">Thêm vào giỏ</button>
            </div>
        </div>
    `).join('');
}

// ========== GENERATE STAR RATING ==========
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bx bx-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="bx bxs-star-half"></i>';
    }

    return stars;
}

// ========== MOBILE DROPDOWN TOGGLE ==========
if (window.innerWidth <= 750) {
    const dropdownBtn = document.querySelector('.dropdown .dropbtn');
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', function (e) {
            e.preventDefault();
            this.parentElement.classList.toggle('active');
        });
    }
}

// ========== PRODUCT DETAIL MODAL ==========
let currentProduct = null;

// Mở product detail modal
function openProductDetail(product) {
    currentProduct = product;

    const detailModal = document.getElementById('productDetailModal');
    const detailContent = document.getElementById('productDetailContent');

    // Điền dữ liệu sản phẩm
    document.getElementById('detailImage').src = product.image;
    document.getElementById('detailName').textContent = product.name;

    // Hiển thị tag
    const tagEl = document.getElementById('detailTag');
    if (product.tag) {
        tagEl.textContent = product.tag;
        tagEl.style.display = 'inline-block';
    } else {
        tagEl.style.display = 'none';
    }

    // Hiển thị rating
    const starsEl = document.getElementById('detailStars');
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="bx bx-star"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="bx bxs-star-half"></i>';
    }
    starsEl.innerHTML = starsHTML;
    document.getElementById('detailRating').textContent = product.rating + '/5';

    // Hiển thị giá
    document.getElementById('detailPrice').textContent = product.price;

    // Hiển thị màu
    document.getElementById('detailColors').textContent = product.colors + ' colors';

    // Reset số lượng
    document.getElementById('detailQty').value = 1;

    // Mở modal
    detailModal.classList.add('active');
    detailContent.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Đóng product detail modal
function closeProductDetail() {
    const detailModal = document.getElementById('productDetailModal');
    const detailContent = document.getElementById('productDetailContent');
    detailModal.classList.remove('active');
    detailContent.classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
}

// Tăng số lượng
function increaseQty() {
    const input = document.getElementById('detailQty');
    input.value = parseInt(input.value) + 1;
}

// Giảm số lượng
function decreaseQty() {
    const input = document.getElementById('detailQty');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Thêm vào giỏ từ product detail
function addToCartDetail() {
    if (!currentProduct) return;

    const qty = parseInt(document.getElementById('detailQty').value);

    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showLoginRequiredMessage();
        return;
    }

    // Thêm vào giỏ
    for (let i = 0; i < qty; i++) {
        const existingItem = cart.find(item => item.id === currentProduct.id);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id: currentProduct.id,
                name: currentProduct.name,
                price: parseFloat(currentProduct.price.split('-')[0].replace('$', '')),
                image: currentProduct.image,
                qty: 1
            });
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Hiển thị thông báo
    showAddToCartMessage(currentProduct.name + ` (x${qty})`);

    // Đóng modal sau 1.5 giây
    setTimeout(() => {
        closeProductDetail();
    }, 1500);
}