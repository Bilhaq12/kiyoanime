import React from 'react';

interface DaftarLayoutProps {
  children: React.ReactNode;
}

const DaftarLayout: React.FC<DaftarLayoutProps> = ({ children }) => {
  return (
    <div>
      {/* Tambahkan layout umum untuk halaman daftar di sini */}
      {children}
    </div>
  );
};

export default DaftarLayout;