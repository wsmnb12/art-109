// This file manages the shopping cart functionality, including adding items, removing items, and updating the cart display.

let cart = [];

// Function to add an item to the cart
function addToCart(item) {
    cart.push(item);
    updateCartDisplay();
}

// Function to remove an item from the cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
}

// Function to update the cart display
function updateCartDisplay() {
    const cartContainer = document.getElementById('cart');
    cartContainer.innerHTML = ''; // Clear existing cart display

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Price: $${item.price}</p>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartContainer.appendChild(itemElement);
    });

    const totalPrice = cart.reduce((total, item) => total + item.price, 0);
    const totalElement = document.getElementById('total-price');
    totalElement.innerText = `Total: $${totalPrice.toFixed(2)}`;
}

// Function to get cart items (for checkout or further processing)
function getCartItems() {
    return cart;
}