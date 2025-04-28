// Updated Menu
const menu = [
  { id: 1, name: "🥤 Choco Bomb Shake", price: 110 },
  { id: 2, name: "🥤 Classic Vanilla Buzz", price: 10 },
  { id: 3, name: "🥤 Oreo Swirl Shake", price: 120 },
  { id: 4, name: "🥤 Crunchy KitKat Shake", price: 120 },
  { id: 5, name: "🥤 Nutella Love", price: 120 },
  { id: 6, name: "☕ Classic Chill Coffee", price: 100 },
  { id: 7, name: "☕ Nutella Chill Brew", price: 100 },
  { id: 8, name: "☕ Chill Caramel Frappe", price: 120 }
];

// Add item to cart
function addToCart(itemId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = menu.find(i => i.id === itemId);
  const existing = cart.find(i => i.id === itemId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showPopup(`✅ ${item.name} added to cart!`, "success");
}

// Render Cart
function renderCart() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cartItems");
  cartContainer.innerHTML = '';

  if (cartItems.length === 0) {
    cartContainer.innerHTML = '<p class="text-center">🛒 Your cart is empty.</p>';
    return;
  }

  cartItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'food-card';

    div.innerHTML = `
      <div class="food-info">
        <h4>${item.name}</h4>
        <p>₹${item.price} × ${item.qty}</p>
        <div class="quantity-control">
          <button onclick="updateQty(${index}, -1)">−</button>
          <span class="qty">${item.qty}</span>
          <button onclick="updateQty(${index}, 1)">+</button>
        </div>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalDiv = document.createElement("div");
  totalDiv.className = "text-right font-bold text-xl mt-4";
  totalDiv.textContent = `Total: ₹${total}`;
  cartContainer.appendChild(totalDiv);
}

// Update quantity
function updateQty(index, change) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  cartItems[index].qty += change;
  if (cartItems[index].qty < 1) cartItems.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  renderCart();
}

// Generate QR Code dynamically
function startUPIPayment(customerName) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const merchantUpiId = "9391921245@okbizaxis"; // <-- Your UPI ID
  const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(customerName)}&am=${totalAmount}&cu=INR`;

  const qrContainer = document.getElementById("qrContainer");
  qrContainer.innerHTML = "";

  const qr = new QRCode(qrContainer, {
    text: upiLink,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById("checkout-section").style.display = "none";
  document.getElementById("qr-section").style.display = "block";
}

// Proceed to Checkout
function checkout() {
  const name = document.getElementById("customerName").value.trim();
  if (!name) {
    showPopup("⚠️ Please enter your name", "error");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    showPopup("⚠️ Your cart is empty", "error");
    return;
  }

  localStorage.setItem("customerName", name);
  startUPIPayment(name);
}

// Clear cart
function clearCart() {
  if (confirm("🗑️ Are you sure you want to clear the cart?")) {
    localStorage.removeItem("cart");
    renderCart();
    showPopup("🗑️ Cart cleared", "success");
  }
}

function goBackToMain() {
  document.querySelector(".card-section").style.display = "flex";
  document.getElementById("milkshake-options").style.display = "none";
  document.getElementById("coldcoffee-options").style.display = "none";
}

// Popup for messages
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type === "success" ? "success-popup" : "error-popup"}`;
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(-20px)";
  }, 800);

  setTimeout(() => popup.remove(), 1200);
}

// Auto render cart on page load
window.addEventListener("DOMContentLoaded", renderCart);

function viewCart() {
  window.location.href = "cart.html";
}

function increaseQty(button) {
  const qtySpan = button.previousElementSibling;
  let qty = parseInt(qtySpan.textContent);
  qty++;
  qtySpan.textContent = qty;
}

function decreaseQty(button) {
  const qtySpan = button.nextElementSibling;
  let qty = parseInt(qtySpan.textContent);
  if (qty > 0) qty--;
  qtySpan.textContent = qty;
}
