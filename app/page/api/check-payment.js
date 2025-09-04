import axios from 'axios';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { checkRequestId } = req.body;

  try {
    // Get access token
    const auth = Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString('base64');
    
    const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Check payment status
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, -3);
    const password = Buffer.from(`${process.env.DARAJA_BUSINESS_SHORTCODE}${process.env.DARAJA_PASSKEY}${timestamp}`).toString('base64');
    
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: process.env.DARAJA_BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkRequestId
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const resultCode = response.data.ResultCode;
    if (resultCode === 0) {
      res.status(200).json({ status: 'paid' });
    } else {
      res.status(200).json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Payment check error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
}