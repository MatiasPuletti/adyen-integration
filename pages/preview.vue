<template>
  <main class="preview-page">
    <section class="cart">
      <h2>Cart</h2>
      <div class="order-summary">
        <ul class="order-summary-list">
          <li class="order-summary-list-list-item">
            <img src="~/public/images/sunglasses.png" class="order-summary-list-list-item-image" alt />
            <p class="order-summary-list-list-item-title">Sunglasses</p>
            <p class="order-summary-list-list-item-price">50.00</p>
            <input 
              type="number" 
              v-model="quantities.sunglasses" 
              min="0" 
              class="quantity-input"
              @change="updateTotal"
            />
          </li>
          <li class="order-summary-list-list-item">
            <img src="~/public/images/headphones.png" class="order-summary-list-list-item-image" alt />
            <p class="order-summary-list-list-item-title">Headphones</p>
            <p class="order-summary-list-list-item-price">50.00</p>
            <input 
              type="number" 
              v-model="quantities.headphones" 
              min="0" 
              class="quantity-input"
              @change="updateTotal"
            />
          </li>
        </ul>
      </div>
      <div class="cart-footer">
        <span class="cart-footer-label">Total:</span>
        <span class="cart-footer-amount">{{ total.toFixed(2) }}</span>
        <nuxt-link :to="`/checkout/${type}?sunglasses=${quantities.sunglasses}&headphones=${quantities.headphones}`">
          <p class="button">Continue to checkout</p>
        </nuxt-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const type = route.query.type;

const quantities = ref({
  sunglasses: 1,
  headphones: 1
});

const total = computed(() => {
  return (quantities.value.sunglasses * 50) + (quantities.value.headphones * 50);
});
</script>