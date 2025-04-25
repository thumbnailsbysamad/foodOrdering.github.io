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
function renderCart() {
  const cartContainer = document.getElementById("cartItems");
  if (!cartContainer) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";

  const existingPayment = document.querySelector('.payment-section');
  if (existingPayment) existingPayment.remove();

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class='text-center text-gray-500'>Your cart is empty.</p>`;
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow flex justify-between items-center mb-2";
    card.innerHTML = `
      <div>
        <h2 class="font-semibold">${item.name}</h2>
        <p>₹${item.price} × ${item.qty}</p>
      </div>
      <div class="space-x-2">
        <button onclick="changeQty(${index}, -1)" class="bg-gray-300 px-2 rounded">-</button>
        <button onclick="changeQty(${index}, 1)" class="bg-gray-300 px-2 rounded">+</button>
      </div>
    `;
    cartContainer.appendChild(card);
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "text-right font-bold text-xl mt-4";
  totalDiv.textContent = `Total: ₹${total}`;
  cartContainer.appendChild(totalDiv);
}

function changeQty(index, delta) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  const paymentSection = document.querySelector('.payment-section');
  if (paymentSection) paymentSection.remove();
}

function checkout() {
  const name = document.getElementById("customerName").value.trim();
  if (!name) {
    showPopup("Please enter your name.", "error");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    showPopup("Cart is empty.", "error");
    return;
  }

  localStorage.setItem("customerName", name);
  redirectToPayment(name, cart);
}

function redirectToPayment(name, cart) {
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const upiID = "samadbro7864-1@okaxis";
  const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`;
  const qrLink = `https://upiqr.in/api/qr?name=${encodeURIComponent(name)}&vpa=${upiID}&amount=${total}`;

  const div = document.createElement("div");
  div.className = "payment-section mt-4 text-center";
  div.innerHTML = `
    <p class="mb-2 font-bold text-green-600">Scan to Pay via Google Pay / PhonePe:</p>
    <img src="${qrLink}" alt="Scan UPI QR" class="mx-auto rounded shadow w-40">
    <p class="text-sm mt-2">or <a href="${upiLink}" class="text-blue-600 underline" target="_blank">Click here to pay</a></p>
    <p class="text-xs mt-2 text-gray-600">UPI ID: ${upiID}</p>
  `;
  document.getElementById("cartItems").appendChild(div);
  showPopup("UPI QR generated!", "success");
}

function clearCart() {
  localStorage.removeItem("cart");
  renderCart();
  showPopup("Cart cleared!", "success");
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
