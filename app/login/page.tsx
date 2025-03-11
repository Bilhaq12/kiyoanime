"use client";

import React, { useState } from 'react';
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from 'next/link';
import LoginLayout from './layout';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Tambahkan logika login di sini
    console.log('Login:', email, password);
  };

  return (
    <LoginLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="w-full max-w-md p-8 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <p className="mt-4 text-center">
            Belum punya akun?{' '}
            <Link href="/daftar" className="text-blue-500 hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
};

export default LoginPage;