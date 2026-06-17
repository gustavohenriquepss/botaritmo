import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        toast({
          title: 'E-mail enviado',
          description: 'Verifique sua caixa de entrada para redefinir sua senha.',
        });
        setIsForgot(false);
      } else if (isSignUp) {
        if (!name.trim()) {
          toast({
            title: 'Erro',
            description: 'Por favor, informe seu nome.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: name.trim()
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Conta criada!',
          description: 'Agora você pode entrar com suas credenciais.'
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: 'Bem-vindo de volta!',
          description: 'Você entrou com sucesso.'
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black opacity-50 z-[1000]"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#1A1A1A] z-[1001] shadow-2xl transition-transform duration-300 ${isOpen ? 'animate-slide-in-right' : ''}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="flex flex-col h-full px-10 pt-24 pb-10">
          <h2 className="text-white text-4xl font-medium mb-2 font-display">
            {isForgot ? 'Recuperar Senha' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            {isForgot
              ? 'Informe seu e-mail para receber o link de redefinição'
              : isSignUp 
                ? 'Junte-se a nós para criar e gerenciar seus eventos' 
                : 'Bem-vindo de volta! Por favor, entre para continuar'}
          </p>

          <form onSubmit={handleAuth} className="flex flex-col gap-6">
            {isSignUp && !isForgot && (
              <div>
                <label htmlFor="name" className="block text-white text-sm font-medium mb-2 uppercase tracking-wide">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-brand transition-colors"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2 uppercase tracking-wide">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-brand transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {!isForgot && (
              <div>
                <label htmlFor="password" className="block text-white text-sm font-medium mb-2 uppercase tracking-wide">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-brand transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white font-medium py-3 px-6 uppercase text-sm border border-black hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Aguarde...' : isForgot ? 'Enviar Link' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isForgot && (
              <button
                onClick={() => setIsForgot(true)}
                className="block w-full text-gray-400 hover:text-white transition-colors text-sm"
              >
                Esqueceu sua senha?
              </button>
            )}
            {isForgot && (
              <button
                onClick={() => setIsForgot(false)}
                className="block w-full text-gray-400 hover:text-white transition-colors text-sm"
              >
                Voltar para entrar
              </button>
            )}
            {!isForgot && (
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="block w-full text-gray-400 hover:text-white transition-colors text-sm"
              >
                {isSignUp 
                  ? 'Já tem uma conta? Entre' 
                  : 'Não tem uma conta? Crie uma'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
