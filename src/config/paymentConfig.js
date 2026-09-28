import midtransClient from "midtrans-client";

// export const coreApi = new midtransClient.CoreApi({
//   isProduction: false,
//   serverKey: process.env.SERVER_KEY,
//   clientKey: process.env.CLIENT_KEY,
// });

export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.SERVER_KEY,
  clientKey: process.env.CLIENT_KEY,
});

export const paymentConfig = async (orderNumber, total) => {
  const parameter = {
    transaction_details: {
      order_id: orderNumber,
      gross_amount: total,
    },
    credit_card: {
      secure: true,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    const token = transaction.token;
    const redirect_url = transaction.redirect_url;

    return {
      tokens: token,
      url: redirect_url,
    };
  } catch (err) {
    throw err;
  }
};
