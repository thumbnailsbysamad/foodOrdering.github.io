const menu = [
  { id: 1, name: "🥤 Chocolate Milkshake (S)", price: 50 },
  { id: 2, name: "🥤 Chocolate Milkshake (M)", price: 70 },
  { id: 3, name: "🥤 Chocolate Milkshake (L)", price: 90 },
  { id: 4, name: "☕ Cold Coffee (S)", price: 40 },
  { id: 5, name: "☕ Cold Coffee (M)", price: 60 },
  { id: 6, name: "☕ Cold Coffee (L)", price: 80 }
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
  startRazorpayPayment(name);
}

// Razorpay Integration
function startRazorpayPayment(customerName) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const options = {
    key: "rzp_test_AtBLYVtmhCUmGY", // <-- Replace with your real Razorpay Key
    amount: totalAmount * 100, // Razorpay takes amount in paise
    currency: "INR",
    name: "Coldgen",
    description: "Milkshake Stall Order",
    image: "images/logo.png", // Your logo optional
    handler: function (response) {
      // Payment success
      showPopup("✅ Payment Successful!", "success");
      localStorage.removeItem("cart");
      setTimeout(() => {
        window.location.href = "thankyou.html"; // Redirect after payment
      }, 1000);
    },
    prefill: {
      name: customerName,
      email: "", // Optional: you can prefill email
      contact: "" // Optional: you can prefill phone number
    },
    theme: {
      color: "#4CAF50"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
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
  }, 800); // Start animation
  
  setTimeout(() => popup.remove(), 1200);
}

// Auto render cart on page load
window.addEventListener("DOMContentLoaded", renderCart);
function viewCart() {
  window.location.href = "cart.html"; // Redirect to your cart page
}
const toppingSelect = item.querySelector('.topping-select');
const selectedTopping = toppingSelect ? toppingSelect.value : '';

const cartItem = {
  name: itemName,
  price: itemPrice,
  quantity: quantity,
  topping: selectedTopping  // 🆕 Add this line
};
