const axios = require('axios');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, amount, duration } = req.body;

  try {
    // 1. Get access token from Daraja API
    const auth = Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString('base64');
    
    const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Initiate STK push
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, -3);
    const password = Buffer.from(`${process.env.DARAJA_BUSINESS_SHORTCODE}${process.env.DARAJA_PASSKEY}${timestamp}`).toString('base64');
    
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.DARAJA_BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.DARAJA_BUSINESS_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BASE_URL}/api/payment-callback`,
        AccountReference: 'WiFi Access',
        TransactionDesc: `Internet access for ${duration}`
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.status(200).json({ 
      success: true, 
      checkRequestId: stkResponse.data.CheckoutRequestID 
    });
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
}