// main.js - Centralized JavaScript logic

// Utility function to show popups (used across pages)
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type === "success" ? "success-popup" : "error-popup"}`;
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(-20px)";
  }, 800); // Popup visible for 0.8s

  setTimeout(() => popup.remove(), 1200); // Total animation time + removal
}

// ==========================================
// Functions for index.html (Menu Selection)
// ==========================================

function toggleOptions(type) {
  document.querySelector(".card-section").style.display = "none";
  document.getElementById("milkshake-options").style.display = type === "milkshake" ? "block" : "none";
  document.getElementById("coldcoffee-options").style.display = type === "coldcoffee" ? "block" : "none";
  // Reset scroll to top of food options section when toggling
  document.querySelector('.mobile-frame').scrollTop = 0;
}

function goBack() { // Used on index.html to go back to main menu
  document.querySelector(".card-section").style.display = "flex";
  document.getElementById("milkshake-options").style.display = "none";
  document.getElementById("coldcoffee-options").style.display = "none";
  // Reset scroll to top of mobile frame when going back
  document.querySelector('.mobile-frame').scrollTop = 0;
}

function increaseQty(btn) {
  let span = btn.parentElement.querySelector(".qty");
  span.textContent = parseInt(span.textContent) + 1;
  let toppings = btn.closest(".food-card").querySelector(".toppings");
  if (toppings) toppings.classList.add("show-toppings");
}

function decreaseQty(btn) {
  let span = btn.parentElement.querySelector(".qty");
  let current = parseInt(span.textContent);
  if (current > 0) {
    span.textContent = current - 1;
  }
  if (parseInt(span.textContent) == 0) {
    let toppings = btn.closest(".food-card").querySelector(".toppings");
    if (toppings) {
      toppings.classList.remove("show-toppings");
      // Uncheck all toppings when quantity becomes 0
      toppings.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
    }
  }
}

// Optimized function to add all selected items (including toppings) to cart
function addAllToCart(sectionId) {
  const section = document.getElementById(sectionId);
  const cards = section.querySelectorAll('.food-card');
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cards.forEach(card => {
    const qty = parseInt(card.querySelector(".qty").textContent);
    if (qty > 0) {
      const id = parseInt(card.getAttribute("data-id"));
      const name = card.getAttribute("data-name");
      let basePrice = parseInt(card.getAttribute("data-price")); // Base price of the item

      let currentItemToppings = [];
      let toppingsPrice = 0;

      // Collect selected toppings and their prices
      const toppingCheckboxes = card.querySelectorAll(".toppings input[type='checkbox']:checked");
      toppingCheckboxes.forEach(checkbox => {
        const toppingName = checkbox.value;
        let toppingCost = 0;
        // Parse cost from label text (e.g., " (+₹20)")
        const labelText = checkbox.parentElement.textContent;
        const match = labelText.match(/\+\₹(\d+)/);
        if (match) {
          toppingCost = parseInt(match[1]);
        }
        currentItemToppings.push({ name: toppingName, price: toppingCost });
        toppingsPrice += toppingCost;
      });

      const finalPricePerUnit = basePrice + toppingsPrice;

      // Create a unique identifier for the item with its specific toppings
      // This ensures "Vanilla with Choco Chips" is different from "Vanilla with Whipped Cream"
      const itemToppingsSignature = currentItemToppings.map(t => t.name).sort().join('|');
      const itemUniqueKey = `${id}-${itemToppingsSignature}`;

      // Check if an item with the exact same base ID and toppings already exists in the cart
      const existingItemIndex = cart.findIndex(item =>
        item.uniqueKey === itemUniqueKey
      );

      if (existingItemIndex > -1) {
        // If it exists, update its quantity
        cart[existingItemIndex].qty += qty;
      } else {
        // Otherwise, add as a new item to the cart
        cart.push({
          id: id,
          uniqueKey: itemUniqueKey, // For matching identical items
          name: name,
          basePrice: basePrice, // Store base price for reference (optional)
          price: finalPricePerUnit, // Store final price per unit including toppings
          qty: qty,
          toppings: currentItemToppings // Store topping details
        });
      }

      // Reset quantity and uncheck toppings after adding to cart on the menu page
      card.querySelector(".qty").textContent = "0";
      if (card.querySelector(".toppings")) {
        card.querySelector(".toppings").classList.remove("show-toppings");
        card.querySelectorAll(".toppings input[type='checkbox']").forEach(cb => cb.checked = false);
      }
    }
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  showPopup("Items added to cart!", "success");
}


// ==========================================
// Functions for cart.html (Cart Management & Checkout)
// ==========================================

function renderCart() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cartItems");
  cartContainer.innerHTML = ''; // Clear previous items

  if (cartItems.length === 0) {
    cartContainer.innerHTML = '<p class="text-center">🛒 Your cart is empty.</p>';
    // Hide payment section if cart is empty
    document.getElementById("paymentSection").style.display = "none";
    return;
  } else {
    document.getElementById("paymentSection").style.display = "block";
  }

  cartItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'food-card'; // Reusing food-card class for consistent styling

    let toppingsDisplay = '';
    if (item.toppings && item.toppings.length > 0) {
      // Display toppings list with their individual prices
      toppingsDisplay = `<p class="toppings-list">Toppings: ${item.toppings.map(t => `${t.name} (+₹${t.price})`).join(', ')}</p>`;
    }

    div.innerHTML = `
      <div class="food-info">
        <h4>${item.name}</h4>
        ${toppingsDisplay}
        <p>₹${item.price} per unit × ${item.qty} = ₹${item.price * item.qty}</p>
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

// Update quantity of an item in the cart
function updateQty(index, change) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartItems[index]) { // Check if item exists
    cartItems[index].qty += change;
    if (cartItems[index].qty < 1) {
      cartItems.splice(index, 1); // Remove item if quantity goes below 1
      showPopup("Item removed from cart!", "error");
    }
    localStorage.setItem("cart", JSON.stringify(cartItems));
    renderCart(); // Re-render the cart to reflect changes
  }
}

// Clear all items from the cart
function clearCart() {
  if (confirm("🗑️ Are you sure you want to clear the cart?")) {
    localStorage.removeItem("cart");
    renderCart();
    showPopup("🗑️ Cart cleared", "success");
  }
}

// Initiate checkout process (validation and QR code generation)
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

  localStorage.setItem("customerName", name); // Store customer name
  generateQRCode(name);
}

// Generate QR Code for UPI payment
function generateQRCode(customerName) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const merchantUpiId = "9391921245@okbizaxis"; // Replace with your actual UPI ID
  const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(customerName)}&am=${totalAmount}&cu=INR`;

  document.getElementById("paymentSection").style.display = "none";
  document.getElementById("qrSection").style.display = "block";

  // Ensure QRious library is loaded before creating QR code
  if (typeof QRious !== 'undefined') {
    new QRious({
      element: document.getElementById('qrcode'), // Canvas element for QR code
      value: upiLink, // Data to encode
      size: 250 // Size of the QR code
    });
  } else {
    document.getElementById('qrSection').innerHTML = `<p style="color:red;">Error: QR Code library not loaded. Please check your internet connection or the library link in cart.html.</p>`;
    console.error("QRious library (qrious.min.js) not found or loaded incorrectly.");
  }

  document.getElementById('upiText').innerText = `Amount: ₹${totalAmount}`;
}

// Confirm payment and save order
function confirmPayment() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const customerName = localStorage.getItem("customerName") || "Guest";
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const newOrder = {
    id: Date.now(), // Unique ID for the order (timestamp)
    customerName: customerName,
    items: cart,
    total: totalAmount,
    date: new Date().toLocaleString() // Readable date/time
  };
  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  localStorage.removeItem("cart"); // Clear cart after successful order
  localStorage.removeItem("customerName"); // Clear stored customer name

  showPopup("✅ Payment confirmed! Thank you for your order.", "success");
  setTimeout(() => {
    window.location.href = "index.html"; // Redirect to home page after confirmation
  }, 1500); // Give time for popup to be seen
}

// This function is for the cart page's "Back to Main Menu" button
function goBackToMain() {
  window.location.href = "index.html";
}


// ==========================================
// Functions for orders.html (Order History)
// ==========================================

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const container = document.getElementById("ordersContainer");
  container.innerHTML = ''; // Clear existing content

  if (orders.length === 0) {
    container.innerHTML = `<p class="text-center" style="margin-top: 50px; color: #555;">No Orders Yet 🚫</p>`;
    return;
  }

  // Display orders in reverse chronological order (most recent first)
  orders.slice().reverse().forEach(order => {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-card';

    orderDiv.innerHTML = `
      <h3>Order #${order.id}</h3>
      <p class="order-date">Placed by ${order.customerName} on ${order.date}</p>
      <ul class="order-items">
        ${order.items.map(item => {
            let toppingDetails = '';
            if (item.toppings && item.toppings.length > 0) {
                // Display only topping names here for brevity in order history
                toppingDetails = ` (${item.toppings.map(t => t.name).join(', ')})`;
            }
            return `<li>${item.name}${toppingDetails} × ${item.qty}</li>`;
        }).join('')}
      </ul>
      <p class="order-total">Total: ₹${order.total}</p>
    `;
    container.appendChild(orderDiv);
  });
}
