import React, { useState } from 'react';
import { Feather, Mail, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const result = mode === 'signup'
      ? await signUp(email.trim(), password, name.trim() || email.split('@')[0])
      : await signIn(email.trim(), password);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === 'signup') {
      setInfo('Compte créé. Si la confirmation par e-mail est activée, vérifiez votre boîte de réception avant de vous connecter.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2B4DE8] to-[#1B36C9] text-white flex items-center justify-center shadow-sonic">
            <Feather className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-poppins text-xl font-bold text-[#14161F] tracking-tight">SileyaBook</h1>
            <p className="text-xs text-[#8089A6] font-poppins">Maison d'Édition &amp; Studio Auteur</p>
          </div>
        </div>

        <div className="bg-white border border-[#E7EAF3] rounded-2xl shadow-card-soft p-6 sm:p-8 space-y-5">
          <div className="flex items-center bg-[#F6F8FF] p-1 rounded-xl border border-[#E7EAF3]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setInfo(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold font-poppins transition-all ${
                mode === 'login' ? 'bg-white text-[#2B4DE8] shadow-xs' : 'text-[#4A4E5A]'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold font-poppins transition-all ${
                mode === 'signup' ? 'bg-white text-[#2B4DE8] shadow-xs' : 'text-[#4A4E5A]'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#4A4E5A] uppercase tracking-wider">Nom</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8089A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8FF] border border-[#E7EAF3] rounded-xl text-sm text-[#14161F] placeholder-[#8089A6] focus:outline-none focus:ring-2 focus:ring-[#2B4DE8]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4A4E5A] uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8089A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8FF] border border-[#E7EAF3] rounded-xl text-sm text-[#14161F] placeholder-[#8089A6] focus:outline-none focus:ring-2 focus:ring-[#2B4DE8]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4A4E5A] uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8089A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F6F8FF] border border-[#E7EAF3] rounded-xl text-sm text-[#14161F] placeholder-[#8089A6] focus:outline-none focus:ring-2 focus:ring-[#2B4DE8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8089A6] hover:text-[#2B4DE8] transition-colors"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="p-3 rounded-xl bg-[#EEF2FF] border border-[#2B4DE8]/20 text-[#2B4DE8] text-xs">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#2B4DE8] to-[#1B36C9] hover:from-[#1B36C9] hover:to-[#011CF6] text-white font-poppins font-bold text-sm shadow-sonic transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{isSubmitting ? 'Un instant…' : mode === 'signup' ? "Créer mon compte" : 'Se connecter'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
