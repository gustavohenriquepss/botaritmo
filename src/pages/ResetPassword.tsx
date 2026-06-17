import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validRecovery, setValidRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery type in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token=')) {
      setValidRecovery(true);
    } else {
      setValidRecovery(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi redefinida com sucesso.',
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!validRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <SEOHead title="Link inválido" description="Link de recuperação inválido ou expirado" />
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-[#1A1A1A] font-display">Link inválido</h1>
          <p className="text-sm text-[#1A1A1A] opacity-50">
            Este link de recuperação de senha é inválido ou expirou.
          </p>
          <Button onClick={() => navigate('/auth')} className="bg-[#1A1A1A] text-white hover:bg-opacity-90">
            Voltar para entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <SEOHead title="Redefinir Senha" description="Defina uma nova senha para sua conta" />
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-4xl font-normal text-[#1A1A1A] tracking-[-0.02em] font-display">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-sm text-[#1A1A1A] opacity-50">
            Defina uma nova senha para sua conta
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="border-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white hover:bg-opacity-90"
          >
            {loading ? 'Aguarde...' : 'Redefinir Senha'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
