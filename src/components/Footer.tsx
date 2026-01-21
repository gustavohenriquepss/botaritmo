import React from 'react';
import logoFooter from '@/assets/logo-footer.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-black py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-center">
        <img src={logoFooter} alt="BOTA RITMO - powered by yeon" className="h-14" />
      </div>
    </footer>
  );
};

export default Footer;
