'use client';  

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // State instead of getElementById
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Next.js router instead of window.location.href
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      router.push('/');  // Navigate to home page
      
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Login</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          required
        />
        
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Login
        </button>
      </form>
      
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}