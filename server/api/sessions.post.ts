// server/api/sessions.post.ts
import { defineEventHandler, getRequestURL, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { createAdyenClient } from '../adyen';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  console.log("/api/sessions");

  // Add body reading with default values
  const body = await readBody(event).catch(() => ({}));
  const { amount = 10000, items = { sunglasses: 1, headphones: 1 } } = body;

  const adyenCheckout = await createAdyenClient();
  const config = useRuntimeConfig();
  const orderRef = uuidv4();

  // build returnUrl
  const url = getRequestURL(event);
  const protocol = url.protocol;
  const host = url.host;
  const returnUrl = `${protocol}//${host}/api/handleShopperRedirect?orderRef=${orderRef}`;
  console.log("returnUrl: " + returnUrl);

  try {
    const response = await adyenCheckout.PaymentsApi.sessions({
      amount: { currency: "EUR", value: amount },
      countryCode: "NL",
      merchantAccount: config.adyenMerchantAccount,
      reference: orderRef,
      lineItems: [
        { 
          quantity: items.sunglasses || 1, 
          amountIncludingTax: 5000, 
          description: "Sunglasses" 
        },
        { 
          quantity: items.headphones || 1, 
          amountIncludingTax: 5000, 
          description: "Headphones" 
        },
      ],
      returnUrl: `${returnUrl}`,
    });

    return { response, clientKey: config.adyenClientKey };
  } catch (err: any) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    throw createError({ statusCode: err.statusCode, message: err.message });
  }
});