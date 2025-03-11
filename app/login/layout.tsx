import React from 'react';

interface LoginLayoutProps {
  children: React.ReactNode;
}

const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <div>
      {/* Tambahkan layout umum untuk halaman login di sini */}
      {children}
    </div>
  );
};

export default LoginLayout;