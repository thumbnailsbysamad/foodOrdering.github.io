const menu = [
  { id: 1, name: "🥤 Chocolate Milkshake (S)", price: 50 },
  { id: 2, name: "🥤 Chocolate Milkshake (M)", price: 70 },
  { id: 3, name: "🥤 Chocolate Milkshake (L)", price: 90 },
  { id: 4, name: "☕ Cold Coffee (S)", price: 40 },
  { id: 5, name: "☕ Cold Coffee (M)", price: 60 },
  { id: 6, name: "☕ Cold Coffee (L)", price: 80 }
];

// Add item to cart by ID
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
  showPopup(`${item.name} added to cart!`, "success");
}

// Add all visible items in a section to cart
function addAllToCart(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return; // prevent errors if sectionId is invalid

  const cards = section.querySelectorAll('.food-card');
  let count = 0;

  cards.forEach(card => {
    const id = parseInt(card.getAttribute('data-id'));
    if (!isNaN(id)) {
      addToCart(id);
      count++;
    }
  });

  if (count > 0) {
    showPopup(`${count} item(s) added to cart from ${sectionId}`, "success");
  } else {
    showPopup("No items found to add in this section.", "error");
  }
}

// Render Cart on cart.html
window.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cartItems");
  cartContainer.innerHTML = '';

  if (cartItems.length === 0) {
    cartContainer.innerHTML = '<p class="text-center">Your cart is empty.</p>';
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

function updateQty(index, change) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  cartItems[index].qty += change;
  if (cartItems[index].qty < 1) cartItems.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  renderCart();
}

function checkout() {
  const name = document.getElementById("customerName").value.trim();
  if (!name) return alert("Please enter your name");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return alert("Your cart is empty");

  localStorage.setItem("customerName", name);
  redirectToPayment();
}

function redirectToPayment() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const name = document.getElementById("customerName").value.trim();

  if (!name) return alert("Please enter your name");
  if (cart.length === 0) return alert("Cart is empty");

  let total = 0;
  cart.forEach(item => total += item.price * item.qty);

  const upiID = "syed.4292-0@wahdfcbank";
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiID)}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`;

  // Remove existing UPI section if it exists
  const existingUPI = document.getElementById("upiPaymentSection");
  if (existingUPI) existingUPI.remove();

  const div = document.createElement("div");
  div.id = "upiPaymentSection";
  div.className = "mt-6 text-center px-4";
  div.innerHTML = `
    <p class="mb-2 font-bold text-green-600 text-base">Scan to Pay:</p>
    <img src="images/Screenshot_2025-04-26-06-18-34-270_com.whatsapp-edit.jpg" alt="My UPI QR Code"
         class="mx-auto rounded-xl shadow border border-gray-300"
         style="width: 150px; height: 150px; object-fit: contain;" />

    <p class="text-sm mt-3">
      or <a href="${upiLink}" target="_blank" rel="noopener noreferrer"
      class="bg-blue-600 text-white px-4 py-2 rounded inline-block mt-2 shadow hover:bg-blue-700 transition">
        🔗 Tap to Pay in UPI App
      </a>
    </p>
    <p class="text-xs mt-2 text-gray-600">UPI ID: <span class="font-semibold">${upiID}</span></p>
    <p class="text-xs text-gray-500 mt-1">Amount: <span class="font-semibold text-black">₹${total}</span></p>
  `;

  document.getElementById("cartItems").appendChild(div);
}

function clearCart() {
  if (confirm("Are you sure you want to clear the cart?")) {
    localStorage.removeItem("cart");
    renderCart();
    const upiSection = document.getElementById("upiPaymentSection");
    if (upiSection) upiSection.remove();
  }
}

function goBackToMain() {
  window.location.href = "index.html";
}
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type === "success" ? "success-popup" : "error-popup"}`;
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

// Auto render on cart page
window.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cartItems");
  if (cartContainer) renderCart();

  const welcome = document.getElementById("welcomePopup");
  if (welcome) {
    welcome.style.display = "block";
    setTimeout(() => welcome.remove(), 3000);
  }
});
