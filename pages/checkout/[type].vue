<template>
  <div>
    <div id="payment-page">
      <div class="container">
        <div class="payment-container">
          <div class="payment" ref="paymentRef"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AdyenCheckout from '@adyen/adyen-web';

const route = useRoute();

// Find type from route and quantities from query params
const type = route.params.type;
const sunglassesQty = parseInt(route.query.sunglasses) || 1;
const headphonesQty = parseInt(route.query.headphones) || 1;

// Calculate total amount in cents (50.00 EUR = 5000 cents)
const totalAmount = (sunglassesQty * 5000) + (headphonesQty * 5000);

// Reactive references
const sessionId = ref('');
const redirectResult = ref('');
const paymentRef = ref(type);

// Function to invoke server-side API
async function sendPostRequest(url, data) {
  const res = await fetch(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : "",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

// Function to handle the server response
async function handleServerResponse(res, component) {
  if (res.action) {
    component.handleAction(res.action);
  } else {
    switch (res.resultCode) {
      case "Authorised":
        window.location.href = "/result/success";
        break;
      case "Pending":
      case "Received":
        window.location.href = "/result/pending";
        break;
      case "Refused":
        window.location.href = "/result/failed";
        break;
      default:
        window.location.href = "/result/error";
        break;
    }
  }
}

// Function to create AdyenCheckout instance
async function createAdyenCheckout(session, clientKey = null) {
  const configuration = {
    clientKey: clientKey,
    locale: "en_US",
    environment: "test", // Change to 'live' for production
    showPayButton: true,
    session: session,
    paymentMethodsConfiguration: {
      ideal: { showImage: true },
      card: {
        hasHolderName: true,
        holderNameRequired: true,
        name: "Credit or debit card",
        amount: { value: totalAmount, currency: "EUR" },
      },
      paypal: {
        amount: { currency: "EUR", value: totalAmount },
        environment: "test",
        countryCode: "US", // Only needed for test
      },
    },
    onPaymentCompleted: (result, component) => {
      console.log("result: " + result);
      handleServerResponse(result, component);
    },
    onError: (error, component) => {
      console.error(error.name, error.message, error.stack, component);
    },
  };

  return new AdyenCheckout(configuration);
}

// Function to start checkout
async function startCheckout() {
  try {
    const { response, clientKey } = await sendPostRequest(`/api/sessions?type=${type}`, {
      amount: totalAmount,
      items: {
        sunglasses: sunglassesQty,
        headphones: headphonesQty
      }
    });

    const checkout = await createAdyenCheckout(response, clientKey);
    checkout.create(type).mount(paymentRef.value);
  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
  }
}

// Function to finalize checkout
async function finalizeCheckout() {
  try {
    const checkout = await createAdyenCheckout({ id: sessionId.value });
    checkout.submitDetails({ details: redirectResult.value });
  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
  }
}

// onMounted lifecycle hook to handle component initialization
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  sessionId.value = urlParams.get('sessionId');
  redirectResult.value = urlParams.get('redirectResult');

  if (sessionId.value) {
    await finalizeCheckout();
  } else {
    await startCheckout();
  }
});
</script>