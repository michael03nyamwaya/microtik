// pages/index.js
'use client'
import { useState } from 'react';
import Head from 'next/head';

export default function MikroTikDarajaIntegration() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(50);
  const [duration, setDuration] = useState('1h');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userCredentials, setUserCredentials] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatus('Initiating payment...');
    
    try {
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.startsWith('0') ? `254${phoneNumber.substring(1)}` : phoneNumber,
          amount,
          duration
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('Payment initiated successfully! Check your phone to complete payment.');
        // Poll for payment confirmation
        checkPaymentStatus(data.checkRequestId);
      } else {
        setStatus(`Error: ${data.error}`);
        setIsProcessing(false);
      }
    } catch {
      setStatus('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (checkRequestId) => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch('/api/check-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checkRequestId }),
        });
        
        const data = await response.json();
        
        if (data.status === 'paid') {
          clearInterval(interval);
          setStatus('Payment confirmed! Creating your account...');
          createMikroTikUser(phoneNumber, duration);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatus('Payment confirmation timeout. Please try again.');
          setIsProcessing(false);
        }
      } catch {
        // Removed unused error parameter
        console.error('Error checking payment status');
      }
    }, 2000);
  };

  const createMikroTikUser = async (phone, accessDuration) => {
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `user_${phone.substring(phone.length - 4)}`,
          password: Math.random().toString(36).slice(-8),
          phone,
          duration: accessDuration
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('Account created successfully!');
        setUserCredentials(data.credentials);
      } else {
        setStatus(`Error creating account: ${data.error}`);
      }
    } catch {
      setStatus('Failed to create user account. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>MikroTik & Daraja Integration</title>
        <meta name="description" content="Integrate MikroTik with Daraja API for user management" />
      </Head>

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WiFi Access Purchase</h1>
            <p className="text-gray-600 mb-6">Pay via M-Pesa to get internet access</p>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                M-Pesa Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="e.g., 07XX XXX XXX"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (KSh)
              </label>
              <div className="mt-1">
                <select
                  id="amount"
                  name="amount"
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                >
                  <option value={20}>20 - 30 minutes</option>
                  <option value={50}>50 - 1 hour</option>
                  <option value={100}>100 - 3 hours</option>
                  <option value={200}>200 - 24 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Access Duration
              </label>
              <div className="mt-1">
                <select
                  id="duration"
                  name="duration"
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="30m">30 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="3h">3 hours</option>
                  <option value="1d">24 hours</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Pay KSh ${amount}`}
              </button>
            </div>
          </form>

          {status && (
            <div className={`mt-6 p-4 rounded-md ${status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              <p className="text-sm">{status}</p>
            </div>
          )}

          {userCredentials && (
            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <h3 className="text-sm font-medium text-green-800">Your Access Credentials</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Username: <span className="font-mono">{userCredentials.username}</span></p>
                <p>Password: <span className="font-mono">{userCredentials.password}</span></p>
                <p className="mt-2">Duration: {userCredentials.duration}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <p>By purchasing, you agree to our terms of service. Internet access will be automatically disabled after the selected duration.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-3">1</div>
              <h3 className="font-semibold mb-2">Enter Phone Number</h3>
              <p className="text-sm text-gray-600">Provide your M-Pesa registered phone number</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-3">2</div>
              <h3 className="font-semibold mb-2">Make Payment</h3>
              <p className="text-sm text-gray-600">Confirm the STK push prompt on your phone</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mb-3">3</div>
              <h3 className="font-semibold mb-2">Get Access</h3>
              <p className="text-sm text-gray-600">Receive your credentials and connect to WiFi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}