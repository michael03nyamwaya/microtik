module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Daraja sends payment results here
  const callbackData = req.body;
  
  // You can process the callback here - update database, etc.
  console.log('Payment callback received:', callbackData);

  res.status(200).json({ received: true });
}