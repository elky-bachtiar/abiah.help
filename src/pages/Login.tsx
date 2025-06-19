import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">A</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to Abiah.help</h1>
          <p className="text-white/70 mt-2">Your AI startup mentor awaits</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}