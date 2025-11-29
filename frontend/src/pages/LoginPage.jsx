import React, { useState, useEffect } from 'react';

export default function LoginPage({ handleLogin, setCurrentPage }) {
  const [mode, setMode] = useState('signin'); // signin | signup | verify
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const pending = localStorage.getItem('pendingVerifyEmail');
      if (pending) { setEmail(pending); setMode('verify'); localStorage.removeItem('pendingVerifyEmail'); }
    } catch (e) {}
  }, []);

  const apiBase = '';

  const doSignup = async () => {
    setMessage('');
    if (!name || !email || !password) return setMessage('Please fill all fields');
    if (!/^[^@\s]+@gmail\.com$/i.test(email.trim())) return setMessage('Please provide a valid Gmail address');
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Registration failed');
      setMessage(data.message || 'Registered. Check your email for the verification code.');
      // move to verify
      setMode('verify');
    } catch (e) { setMessage('Registration request failed: ' + e.message); }
  };

  const doVerify = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Verification failed');
      setMessage('Email verified! You can now sign in.');
      setMode('signin');
      if (typeof setCurrentPage === 'function') setCurrentPage('login');
    } catch (e) { setMessage('Verification request failed: ' + e.message); }
  };

  const resend = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/send-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Failed to resend');
      setMessage(data.message || 'Verification code resent');
    } catch (e) { setMessage('Resend failed: ' + e.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-purple-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-black mb-2">🔐 ARI TECHNOLOGY</div>
          <p className="text-black font-semibold">Secure Access Portal</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('signin')} className={`flex-1 py-2 rounded ${mode==='signin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'}`}>Sign In</button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded ${mode==='signup' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'}`}>Sign Up</button>
          <button onClick={() => setMode('verify')} className={`flex-1 py-2 rounded ${mode==='verify' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'}`}>Verify</button>
        </div>

        {mode === 'signin' && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-black font-bold mb-2">Email Address</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black font-medium focus:outline-none focus:border-blue-600 bg-gray-50" />
            </div>
            <div>
              <label className="block text-black font-bold mb-2">Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black font-medium focus:outline-none focus:border-blue-600 bg-gray-50" />
            </div>
            <button onClick={() => handleLogin(email, password)} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold text-lg">Sign In</button>
          </div>
        )}

        {mode === 'signup' && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-black font-bold mb-2">Full name</label>
              <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black font-medium bg-gray-50" />
            </div>
            <div>
              <label className="block text-black font-bold mb-2">Gmail address</label>
              <input type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black font-medium bg-gray-50" />
            </div>
            <div>
              <label className="block text-black font-bold mb-2">Password</label>
              <input type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black font-medium bg-gray-50" />
            </div>
            <button onClick={doSignup} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg">Create Account</button>
          </div>
        )}

        {mode === 'verify' && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-black font-bold mb-2">Email to verify</label>
              <input type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black font-medium bg-gray-50" />
            </div>
            <div>
              <label className="block text-black font-bold mb-2">Verification code</label>
              <input type="text" placeholder="6 digit code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-xl text-black font-medium bg-gray-50" />
            </div>
            <div className="flex gap-3">
              <button onClick={doVerify} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">Verify</button>
              <button onClick={resend} className="flex-1 py-3 bg-gray-200 text-black rounded-lg font-bold">Resend Code</button>
            </div>
          </div>
        )}

        {message && <p className="text-center text-sm text-red-600 mt-2">{message}</p>}

      </div>
    </div>
  );
}
