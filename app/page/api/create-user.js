// For this example, we'll simulate MikroTik API interaction
// In a real implementation, you would use the node-routeros package

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, phone, duration } = req.body;

  try {
    // Simulate MikroTik API call
    console.log('Creating user on MikroTik:', { username, password, phone, duration });
    
    // In a real implementation, you would:
    // 1. Connect to MikroTik using node-routeros
    // 2. Execute commands to create a user
    // 3. Close the connection

    // Simulate delay for API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      credentials: {
        username,
        password,
        duration
      }
    });
  } catch (error) {
    console.error('MikroTik user creation error:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
}