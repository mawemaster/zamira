import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Save, LogOut, Camera, User, MapPin, Calendar, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function MinhaConta() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  // Campos do Formulário
  const [formData, setFormData] = useState({
    full_name: "",
    username: "", // display_name
    bio: "",
    birth_date: "",
    birth_time: "",
    city: "",
    avatar_url: ""
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/"); // Manda pro login se não tiver sessão
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          username: data.display_name || "",
          bio: data.bio || "", // Precisamos garantir que essa coluna exista ou criar
          birth_date: data.birth_date || "",
          birth_time: data.birth_time || "", // Precisamos garantir que essa coluna exista
          city: data.city || "",
          avatar_url: data.avatar_url || ""
        });
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();

      const updates = {
        id: session.user.id,
        full_name: formData.full_name,
        display_name: formData.username,
        city: formData.city,
        birth_date: formData.birth_date,
        // bio e birth_time dependem de adicionar colunas no banco,
        // por enquanto vamos salvar o que temos garantido no SQL anterior
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#02031C] flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#02031C] text-white p-4 md:p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Cabeçalho e Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-200">Completude do Perfil</span>
            <span className="text-purple-400 font-bold">100%</span>
          </div>
          <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-full" />
          </div>
        </div>

        {/* Navegação de Abas */}
        <Tabs defaultValue="identidade" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 rounded-xl p-1 h-auto">
            <TabsTrigger value="identidade" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 py-2 text-xs md:text-sm">Identidade</TabsTrigger>
            <TabsTrigger value="jornada" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 py-2 text-xs md:text-sm">Jornada</TabsTrigger>
            <TabsTrigger value="alma" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 py-2 text-xs md:text-sm">Alma</TabsTrigger>
            <TabsTrigger value="outros" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 py-2 text-xs md:text-sm">Outros</TabsTrigger>
          </TabsList>

          <TabsContent value="identidade" className="space-y-6 mt-6">

            {/* Foto de Capa e Perfil */}
            <div className="relative mb-12">
              <div className="h-32 md:h-40 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-t-2xl w-full object-cover opacity-50" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-[#02031C] bg-slate-800 overflow-hidden flex items-center justify-center">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-500" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-purple-600 rounded-full text-white border-2 border-[#02031C] hover:bg-purple-700">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Formulário de Dados Pessoais */}
            <Card className="bg-white/5 border-white/10 p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase font-bold">Nome Completo</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="Seu nome real"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase font-bold">Nome de Exibição (@)</label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="Como quer ser chamado"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold">Biografia</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-black/20 border-white/10 text-white min-h-[80px] resize-none"
                  placeholder="Conte um pouco sobre sua jornada mística..."
                  maxLength={160}
                />
                <p className="text-xs text-right text-gray-500">{formData.bio.length}/160</p>
              </div>
            </Card>

            {/* Identidade Astral */}
            <div className="flex items-center gap-2 text-purple-400 font-bold text-lg">
              <Star className="w-5 h-5" />
              <h2>Força da Identidade Astral</h2>
            </div>

            <Card className="bg-white/5 border-white/10 p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase font-bold">Data de Nascimento</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="pl-9 bg-black/20 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase font-bold">Cidade de Nascimento</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="pl-9 bg-black/20 border-white/10 text-white"
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Botão de Salvar */}
            <Button
              onClick={updateProfile}
              disabled={saving}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg shadow-lg shadow-purple-900/20"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Salvar Alterações
            </Button>

            <div className="pt-8 border-t border-white/10">
              <Button variant="outline" onClick={handleLogout} className="w-full border-red-900/30 text-red-400 hover:bg-red-950/10 hover:text-red-300">
                <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
              </Button>
            </div>

          </TabsContent>

          {/* Conteúdo placeholder para outras abas */}
          <TabsContent value="jornada" className="text-center py-10 text-gray-500">
            Em breve: Seu histórico e conquistas.
          </TabsContent>
          <TabsContent value="alma" className="text-center py-10 text-gray-500">
            Em breve: Mapa astral detalhado.
          </TabsContent>
          <TabsContent value="outros" className="text-center py-10 text-gray-500">
            Configurações adicionais.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}