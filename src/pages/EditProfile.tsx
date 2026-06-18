import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Upload } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? '');
        setUsername(data.username ?? '');
        setBio(data.bio ?? '');
        setTags(data.tags ?? []);
        setAvatarUrl(data.avatar_url ?? null);
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const addTag = (raw: string) => {
    const t = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!t || tags.includes(t) || tags.length >= 8) return;
    setTags([...tags, t]);
  };

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('event-images').upload(path, file, {
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      toast.error(error.message || 'Erro ao enviar imagem');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('event-images').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    if (username && !/^[a-z0-9_]{3,30}$/.test(username)) {
      toast.error('Username inválido. Use 3-30 caracteres: a-z, 0-9, _');
      return;
    }
    if (bio.length > 280) {
      toast.error('Bio deve ter no máximo 280 caracteres');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        tags,
        avatar_url: avatarUrl,
      })
      .eq('user_id', userId);
    setSaving(false);
    if (error) {
      if (error.code === '23505') {
        toast.error('Esse username já está em uso');
      } else {
        toast.error('Erro ao salvar perfil');
      }
      return;
    }
    toast.success('Perfil atualizado');
    if (username) navigate(`/@${username}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 text-center text-[11px] uppercase">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead title="Editar Perfil" description="Edite seu perfil de criador" />
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-32 pb-16">
        <h1 className="text-3xl font-display font-medium mb-8">EDITAR PERFIL</h1>

        {/* Avatar */}
        <div className="mb-8">
          <label className="block text-[11px] uppercase font-medium mb-3">Foto do perfil</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border border-black bg-gray-100 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] text-gray-400 uppercase">Sem foto</span>
              )}
            </div>
            <label className="cursor-pointer relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-black group">
              <span className="relative z-10 flex items-center gap-2">
                <Upload className="w-3 h-3" />
                {uploading ? 'ENVIANDO...' : 'ENVIAR FOTO'}
              </span>
              <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Display name */}
        <div className="mb-6">
          <label className="block text-[11px] uppercase font-medium mb-2">Nome</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome ou nome artístico"
            className="w-full border border-black px-3 py-2 text-sm focus:outline-none focus:bg-brand/20"
          />
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-[11px] uppercase font-medium mb-2">Username</label>
          <div className="flex items-stretch border border-black">
            <span className="px-3 flex items-center bg-black text-white text-[11px] uppercase">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="seu_username"
              maxLength={30}
              className="flex-1 px-3 py-2 text-sm focus:outline-none focus:bg-brand/20"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">3-30 chars: a-z, 0-9, _</p>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-[11px] uppercase font-medium mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Conte sobre seu trabalho..."
            className="w-full border border-black px-3 py-2 text-sm focus:outline-none focus:bg-brand/20 resize-none"
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase">{bio.length}/280</p>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label className="block text-[11px] uppercase font-medium mb-2">Tags</label>
          <div className="border border-black p-2 flex flex-wrap gap-1 items-center min-h-[44px]">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 bg-black text-white text-[11px] uppercase px-2 py-1"
              >
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              onBlur={() => {
                if (tagInput) {
                  addTag(tagInput);
                  setTagInput('');
                }
              }}
              placeholder={tags.length === 0 ? 'techno, house, curadoria...' : ''}
              className="flex-1 min-w-[120px] px-1 py-1 text-sm focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Enter ou vírgula para adicionar. Até 8 tags.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="relative overflow-hidden bg-black text-white h-[44px] px-6 flex items-center text-[11px] font-medium uppercase border border-black group disabled:opacity-50"
          >
            <span className="relative z-10">{saving ? 'SALVANDO...' : 'SALVAR PERFIL'}</span>
          </button>
          {username && (
            <button
              onClick={() => navigate(`/@${username}`)}
              className="relative overflow-hidden bg-white text-black h-[44px] px-6 flex items-center text-[11px] font-medium uppercase border border-black group"
            >
              <span className="relative z-10">VER MEU PERFIL</span>
              <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile;
