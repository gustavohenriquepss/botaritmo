import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from './AuthSheet';
import logo from '@/assets/logo-br.png';
export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (user && pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
      setIsAuthOpen(false);
    }
  }, [user, pendingRoute, navigate]);
  return createPortal(<>
      <nav className="fixed top-8 left-4 md:left-8 z-[2000] flex items-center justify-start mx-0 gap-2">
      {/* Logo */}
      <Link to="/" className="h-[34px] flex items-center justify-center">
        <img src={logo} alt="Bota Ritmo" className="h-full w-auto object-contain" />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center">
        <Link to="/" className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-black leading-none group">
          <span className="relative z-10">DESCOBRIR</span>
          <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        {/* Calendário temporariamente escondido
        <Link to="/calendario" className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border-l-0 border border-black leading-none group">
          <span className="relative z-10">CALENDÁRIO</span>
          <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        */}
        <button onClick={() => {
          if (user) {
            navigate('/create-event');
          } else {
            setPendingRoute('/create-event');
            setIsAuthOpen(true);
          }
        }} className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border-l-0 border border-black leading-none group">
          <span className="relative z-10">POSTAR EVENTO </span>
          <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </button>
        {user ? <>
            <Link to="/my-events" className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border-l-0 border border-black leading-none group">
              <span className="relative z-10">MEUS EVENTOS</span>
              <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
            </Link>
            <button onClick={async () => {
            await supabase.auth.signOut();
          }} className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border-l-0 border border-black leading-none group">
              <span className="relative z-10">SAIR</span>
              <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
            </button>
          </> : <button onClick={() => setIsAuthOpen(true)} className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border-l-0 border border-black leading-none group">
            <span className="relative z-10">ENTRAR</span>
            <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </button>}
      </div>

      {/* Mobile Navigation - Full Screen */}
      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 z-[3000] flex flex-col animate-in slide-in-from-top duration-300">
          {/* Close header */}
          <div className="bg-[#1A1A1A] flex items-center justify-center py-16 animate-in fade-in duration-500">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white text-[11px] font-medium uppercase tracking-wider">
              FECHAR
            </button>
          </div>
          
          {/* Menu items */}
          <div className="flex-1 flex flex-col bg-white">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 flex items-center justify-center text-[#1A1A1A] text-[17px] font-medium uppercase border-b border-black tracking-[-0.34px] animate-fade-in" style={{
            animationDelay: '0.1s',
            animationFillMode: 'both'
          }}>
              DESCOBRIR
            </Link>
            {/* Calendário temporariamente escondido
            <Link to="/calendario" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 flex items-center justify-center text-[#1A1A1A] text-[17px] font-medium uppercase border-b border-black tracking-[-0.34px] animate-fade-in" style={{
            animationDelay: '0.15s',
            animationFillMode: 'both'
          }}>
              CALENDÁRIO
            </Link>
            */}
            <button onClick={() => {
            if (user) {
              navigate('/create-event');
            } else {
              setPendingRoute('/create-event');
              setIsAuthOpen(true);
            }
            setIsMobileMenuOpen(false);
          }} className="flex-1 flex items-center justify-center text-[#1A1A1A] text-[17px] font-medium uppercase border-b border-black tracking-[-0.34px] animate-fade-in" style={{
            animationDelay: '0.2s',
            animationFillMode: 'both'
          }}>
              CRIAR EVENTO
            </button>
            {user ? <>
                <Link to="/my-events" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 flex items-center justify-center text-[#1A1A1A] text-[17px] font-medium uppercase border-b border-black tracking-[-0.34px] animate-fade-in" style={{
              animationDelay: '0.3s',
              animationFillMode: 'both'
            }}>
                  MEUS EVENTOS
                </Link>
                <button onClick={async () => {
              await supabase.auth.signOut();
              setIsMobileMenuOpen(false);
            }} className="flex-1 flex items-center justify-center text-[#1A1A1A] text-[17px] font-medium uppercase tracking-[-0.34px] animate-fade-in" style={{
              animationDelay: '0.4s',
              animationFillMode: 'both'
            }}>
                  SAIR
                </button>
              </> : <button onClick={() => {
            setIsAuthOpen(true);
            setIsMobileMenuOpen(false);
          }} className="flex-1 flex items-center justify-center text-[#1A1A1A] text-[17px] font-medium uppercase tracking-[-0.34px] animate-fade-in" style={{
            animationDelay: '0.3s',
            animationFillMode: 'both'
          }}>
                ENTRAR
              </button>}
          </div>
        </div>}
    </nav>

    {/* Menu Button - Mobile Only - Fixed top right */}
    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden fixed top-8 right-4 z-[2000] overflow-hidden bg-white text-black h-[34px] px-3 border border-black flex items-center justify-center text-[11px] font-medium uppercase leading-none group">
      <span className="relative z-10">MENU</span>
      <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
    </button>
    
    <AuthSheet isOpen={isAuthOpen} onClose={() => {
      setIsAuthOpen(false);
      setPendingRoute(null);
    }} />
    </>, document.body);
};