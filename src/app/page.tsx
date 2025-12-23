"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Apple, Facebook, Timer, Chrome, User } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Success
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user?.name || 'User');
      router.push('/home');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-8">
      {/* Logo/Brand */}
      <div className="mb-10 flex flex-col items-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-white shadow-sm transition-transform hover:scale-105">
          <Timer size={48} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>
      </div>

      {/* Forms */}
      <div className="w-full space-y-4">
        {/* Name Input (Signup Only) */}
        {!isLogin && (
          <div className="relative animate-in fade-in slide-in-from-top-4 duration-300">
            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign up')}
        </button>

        <div className="flex justify-center py-2">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-6 w-full opacity-50">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or</span>
        </div>
      </div>

      {/* Social Login - Vertical Stack */}
      <div className="w-full space-y-3">
        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50">
          <Apple size={20} className="fill-current" />
          Continue with Apple
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50">
          <Chrome size={20} className="text-gray-900" />
          Continue with Google
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50">
          <Facebook size={20} className="text-blue-600 fill-current" />
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}
