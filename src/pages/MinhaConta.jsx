import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Sparkles, Save, MapPin, Heart, Link2, Star, Award, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import ColorPicker from "../components/profile/ColorPicker";
import BeliefSelector from "../components/profile/BeliefSelector";
import HobbySelector from "../components/profile/HobbySelector";
import BrazilCityAutocomplete from "../components/profile/BrazilCityAutocomplete";
import { calculateSunSign } from "../components/zodiacCalculator";

export default function MinhaContaPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("identidade");
  const [showColorModal, setShowColorModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    avatar_file: null,
    banner_url: "",
    banner_file: null,
    birth_date: "",
    birth_time: "",
    birth_time_unknown: false,
    birth_city: "",
    sun_sign: "",
    pronouns: "",
    pronouns_other: "",
    relationship_status: "",
    zamira_purpose: [],
    gender: "",
    gender_other: "",
    orientation: "",
    orientation_other: "",
    favorite_color: "#9333EA",
    beliefs: [],
    hobbies: [],
    cpf: "",
    social_links: {
      instagram: "",
      twitter: "",
      tiktok: "",
      linkedin: "",
      website: ""
    },
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: ""
    }
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        display_name: currentUser.display_name || currentUser.full_name || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        avatar_url: currentUser.avatar_url || "",
        avatar_file: null,
        banner_url: currentUser.banner_url || "",
        banner_file: null,
        birth_date: currentUser.birth_date || "",
        birth_time: currentUser.birth_time || "",
        birth_time_unknown: currentUser.birth_time_unknown || false,
        birth_city: currentUser.birth_city || "",
        sun_sign: currentUser.sun_sign || "",
        pronouns: currentUser.pronouns || "",
        pronouns_other: currentUser.pronouns_other || "",
        relationship_status: currentUser.relationship_status || "",
        zamira_purpose: currentUser.zamira_purpose || [],
        gender: currentUser.gender || "",
        gender_other: currentUser.gender_other || "",
        orientation: currentUser.orientation || "",
        orientation_other: currentUser.orientation_other || "",
        favorite_color: currentUser.favorite_color || "#9333EA",
        beliefs: currentUser.beliefs || [],
        hobbies: currentUser.hobbies || [],
        cpf: currentUser.cpf || "",
        social_links: currentUser.social_links || {
          instagram: "",
          twitter: "",
          tiktok: "",
          linkedin: "",
          website: ""
        },
        address: currentUser.address || {
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: ""
        }
      });
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast.error("Erro ao carregar usuário");
    }
  };

  const checkProfileCompletion = (data) => {
    const requiredFields = [
      data.first_name,
      data.last_name,
      data.display_name,
      data.username,
      data.bio,
      data.avatar_url,
      data.birth_date,
      data.pronouns,
      data.gender,
      data.orientation,
      data.favorite_color
    ];
    
    return requiredFields.every(field => field && field.toString().trim() !== "") &&
           data.beliefs.length > 0 &&
           data.hobbies.length > 0 &&
           data.zamira_purpose.length > 0;
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      let avatarUrl = data.avatar_url;
      let bannerUrl = data.banner_url;

      // Upload paralelo de imagens
      const uploadPromises = [];
      
      if (data.avatar_file) {
        uploadPromises.push(
          base44.integrations.Core.UploadFile({ file: data.avatar_file })
            .then(({ file_url }) => { avatarUrl = file_url; })
        );
      }

      if (data.banner_file) {
        uploadPromises.push(
          base44.integrations.Core.UploadFile({ file: data.banner_file })
            .then(({ file_url }) => { bannerUrl = file_url; })
        );
      }

      await Promise.all(uploadPromises);

      const wasProfileComplete = user.profile_completed;
      const isNowComplete = checkProfileCompletion({ ...data, avatar_url: avatarUrl, banner_url: bannerUrl });
      
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        username: data.username,
        bio: data.bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        birth_date: data.birth_date,
        birth_time: data.birth_time,
        birth_time_unknown: data.birth_time_unknown,
        birth_city: data.birth_city,
        sun_sign: data.sun_sign,
        pronouns: data.pronouns,
        pronouns_other: data.pronouns_other,
        relationship_status: data.relationship_status,
        zamira_purpose: data.zamira_purpose,
        gender: data.gender,
        gender_other: data.gender_other,
        orientation: data.orientation,
        orientation_other: data.orientation_other,
        favorite_color: data.favorite_color,
        beliefs: data.beliefs,
        hobbies: data.hobbies,
        cpf: data.cpf,
        social_links: data.social_links,
        address: data.address
      };

      if (!wasProfileComplete && isNowComplete && !user.profile_completed_reward_claimed) {
        updateData.profile_completed = true;
        updateData.profile_completed_reward_claimed = true;
        updateData.level = (user.level || 1) + 1;
        updateData.ouros = (user.ouros || 0) + 10;
        updateData.xp = (user.xp || 0) + 100;
      }

      await base44.auth.updateMe(updateData);
      
      // Sync em background
      base44.functions.invoke('syncUserData', {
        userId: user.id,
        newData: {
          display_name: updateData.display_name,
          full_name: `${data.first_name} ${data.last_name}`,
          avatar_url: avatarUrl,
          level: updateData.level || user.level,
          archetype: user.archetype,
          mystical_title: user.mystical_title
        }
      }).catch(err => console.error("Sync error:", err));

      return { isNowComplete, wasProfileComplete };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      loadUser();
      
      if (!result.wasProfileComplete && result.isNowComplete) {
        toast.success("🎉 PERFIL COMPLETO! +1 Nível +10 Ouros +100 XP!");
      } else {
        toast.success("✨ Perfil atualizado!");
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    }
  });

  const handleBirthDateChange = (dateValue) => {
    setFormData(prev => {
      const sunSign = calculateSunSign(dateValue);
      return {
        ...prev,
        birth_date: dateValue,
        sun_sign: sunSign || ""
      };
    });
  };

  const fetchAddressByCEP = async (cep) => {
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            cep,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }
        }));
        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const profileCompletionPercentage = () => {
    const totalFields = 14;
    let completed = 0;
    
    if (formData.first_name) completed++;
    if (formData.last_name) completed++;
    if (formData.display_name) completed++;
    if (formData.username) completed++;
    if (formData.bio) completed++;
    if (formData.avatar_url) completed++;
    if (formData.birth_date) completed++;
    if (formData.pronouns) completed++;
    if (formData.gender) completed++;
    if (formData.orientation) completed++;
    if (formData.favorite_color) completed++;
    if (formData.beliefs.length > 0) completed++;
    if (formData.hobbies.length > 0) completed++;
    if (formData.zamira_purpose.length > 0) completed++;
    
    return Math.round((completed / totalFields) * 100);
  };

  const completionPercent = profileCompletionPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🌟 Refúgio da Alma
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Preencha sua identidade mística e ganhe recompensas
          </p>

          <Card className="mt-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white font-semibold">Completude do Perfil</span>
              <span className="text-lg text-yellow-400 font-bold">{completionPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {completionPercent === 100 && !user.profile_completed_reward_claimed && (
              <p className="text-yellow-300 text-sm mt-2 flex items-center justify-center gap-2">
                <Award className="w-4 h-4" />
                Salve para receber: +1 Nível, +10 Ouros, +100 XP!
              </p>
            )}
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-slate-900/50 mb-6">
            <TabsTrigger value="identidade" className="text-xs md:text-sm">
              <User className="w-4 h-4 mr-1 md:mr-2" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="jornada" className="text-xs md:text-sm">
              <Heart className="w-4 h-4 mr-1 md:mr-2" />
              Jornada
            </TabsTrigger>
            <TabsTrigger value="alma" className="text-xs md:text-sm">
              <Star className="w-4 h-4 mr-1 md:mr-2" />
              Alma
            </TabsTrigger>
            <TabsTrigger value="outros" className="text-xs md:text-sm">
              <Link2 className="w-4 h-4 mr-1 md:mr-2" />
              Outros
            </TabsTrigger>
          </TabsList>

          {/* ABA IDENTIDADE */}
          <TabsContent value="identidade" className="space-y-6">
            <Card className="bg-slate-900/50 border-purple-900/30 overflow-hidden">
              <div className="relative h-48">
                {formData.banner_file ? (
                  <img src={URL.createObjectURL(formData.banner_file)} alt="" className="w-full h-full object-cover" />
                ) : formData.banner_url ? (
                  <img src={formData.banner_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-900 to-pink-900" />
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <div className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setFormData(prev => ({ ...prev, banner_file: file }));
                    }}
                  />
                </label>
              </div>

              <div className="p-6 -mt-16 relative">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full border-4 border-purple-600 overflow-hidden bg-slate-800">
                    {formData.avatar_file ? (
                      <img src={URL.createObjectURL(formData.avatar_file)} alt="" className="w-full h-full object-cover" />
                    ) : formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setFormData(prev => ({ ...prev, avatar_file: file }));
                      }}
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Primeiro Nome *</label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="bg-slate-800 border-purple-900/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Sobrenome *</label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="bg-slate-800 border-purple-900/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Nome de Exibição *</label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      className="bg-slate-800 border-purple-900/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">@Username *</label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                      className="bg-slate-800 border-purple-900/30 text-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm text-gray-300 mb-1 block">Biografia *</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-slate-800 border-purple-900/30 text-white h-24"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/1000</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-purple-900/30 p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Forja da Identidade Astral
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Data de Nascimento *</label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className="bg-slate-800 border-purple-900/30 text-white"
                  />
                </div>
                {formData.sun_sign && (
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Signo Solar (Auto)</label>
                    <Input
                      value={formData.sun_sign}
                      disabled
                      className="bg-purple-900/30 border-purple-500/50 text-yellow-300 font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Horário de Nascimento</label>
                  <Input
                    type="time"
                    value={formData.birth_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_time: e.target.value }))}
                    disabled={formData.birth_time_unknown}
                    className="bg-slate-800 border-purple-900/30 text-white"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      checked={formData.birth_time_unknown}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, birth_time_unknown: checked, birth_time: checked ? "" : prev.birth_time }))}
                    />
                    <label className="text-xs text-gray-400">Não sei o meu horário</label>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Cidade de Nascimento</label>
                  <BrazilCityAutocomplete
                    value={formData.birth_city}
                    onChange={(city) => setFormData(prev => ({ ...prev, birth_city: city }))}
                    placeholder="Digite o nome da cidade..."
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ABA JORNADA */}
          <TabsContent value="jornada" className="space-y-6">
            <Card className="bg-slate-900/50 border-purple-900/30 p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Identidade Pessoal</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Pronomes *</label>
                  <Select value={formData.pronouns} onValueChange={(value) => setFormData(prev => ({ ...prev, pronouns: value }))}>
                    <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-900/30">
                      {["Ela/Dela", "Ele/Dele", "Elu/Delu", "Prefiro não dizer", "Outro"].map(p => (
                        <SelectItem key={p} value={p} className="text-white">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.pronouns === "Outro" && (
                    <Input
                      value={formData.pronouns_other}
                      onChange={(e) => setFormData(prev => ({ ...prev, pronouns_other: e.target.value }))}
                      placeholder="Especifique"
                      className="bg-slate-800 border-purple-900/30 text-white mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Estado Civil</label>
                  <Select value={formData.relationship_status} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship_status: value }))}>
                    <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-900/30">
                      {["Solteiro(a)", "Num relacionamento", "Casado(a)", "Numa união estável", "Divorciado(a)", "Viúvo(a)", "Prefiro não dizer"].map(s => (
                        <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Gênero *</label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-900/30">
                      {["Mulher", "Homem", "Não-binário", "Prefiro não dizer", "Outro"].map(g => (
                        <SelectItem key={g} value={g} className="text-white">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.gender === "Outro" && (
                    <Input
                      value={formData.gender_other}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender_other: e.target.value }))}
                      placeholder="Especifique"
                      className="bg-slate-800 border-purple-900/30 text-white mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Orientação *</label>
                  <Select value={formData.orientation} onValueChange={(value) => setFormData(prev => ({ ...prev, orientation: value }))}>
                    <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-900/30">
                      {["Heterossexual", "Homossexual", "Bissexual", "Pansexual", "Assexual", "Prefiro não dizer", "Outro"].map(o => (
                        <SelectItem key={o} value={o} className="text-white">{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.orientation === "Outro" && (
                    <Input
                      value={formData.orientation_other}
                      onChange={(e) => setFormData(prev => ({ ...prev, orientation_other: e.target.value }))}
                      placeholder="Especifique"
                      className="bg-slate-800 border-purple-900/30 text-white mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm text-gray-300 mb-2 block">Estou no Zamira para... * (múltipla escolha)</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Amizade Mística",
                    "Um Relacionamento Sério",
                    "Conexões Casuais",
                    "Encontrar parceiros de estudo",
                    "Mentoria / Aprendizado",
                    "Apenas explorar"
                  ].map(purpose => (
                    <button
                      key={purpose}
                      onClick={() => setFormData(prev => ({ ...prev, zamira_purpose: toggleArrayItem(prev.zamira_purpose, purpose) }))}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        formData.zamira_purpose.includes(purpose)
                          ? "bg-purple-600 text-white"
                          : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                      }`}
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm text-gray-300 mb-2 block">Cor de Aura *</label>
                <button
                  onClick={() => setShowColorModal(true)}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-purple-900/30 w-full md:w-auto"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-white" style={{ backgroundColor: formData.favorite_color }} />
                  <span className="text-white">{formData.favorite_color}</span>
                </button>
              </div>
            </Card>
          </TabsContent>

          {/* ABA ALMA */}
          <TabsContent value="alma" className="space-y-6">
            <Card className="bg-slate-900/50 border-purple-900/30 p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">O que eu acredito *</h3>
              <BeliefSelector
                selected={formData.beliefs}
                onChange={(beliefs) => setFormData(prev => ({ ...prev, beliefs }))}
              />
            </Card>

            <Card className="bg-slate-900/50 border-purple-900/30 p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Hobbies & Interesses *</h3>
              <HobbySelector
                selected={formData.hobbies}
                onChange={(hobbies) => setFormData(prev => ({ ...prev, hobbies }))}
              />
            </Card>
          </TabsContent>

          {/* ABA OUTROS */}
          <TabsContent value="outros" className="space-y-6">
            <Card className="bg-slate-900/50 border-purple-900/30 p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Redes Sociais</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Instagram</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">instagram.com/</span>
                    <Input
                      value={formData.social_links.instagram}
                      onChange={(e) => setFormData(prev => ({ ...prev, social_links: { ...prev.social_links, instagram: e.target.value } }))}
                      className="bg-slate-800 border-purple-900/30 text-white flex-1"
                      placeholder="@seuusername"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Twitter / X</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">x.com/</span>
                    <Input
                      value={formData.social_links.twitter}
                      onChange={(e) => setFormData(prev => ({ ...prev, social_links: { ...prev.social_links, twitter: e.target.value } }))}
                      className="bg-slate-800 border-purple-900/30 text-white flex-1"
                      placeholder="@seuusername"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">TikTok</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">tiktok.com/@</span>
                    <Input
                      value={formData.social_links.tiktok}
                      onChange={(e) => setFormData(prev => ({ ...prev, social_links: { ...prev.social_links, tiktok: e.target.value } }))}
                      className="bg-slate-800 border-purple-900/30 text-white flex-1"
                      placeholder="seuusername"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Website Pessoal</label>
                  <Input
                    value={formData.social_links.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, social_links: { ...prev.social_links, website: e.target.value } }))}
                    className="bg-slate-800 border-purple-900/30 text-white"
                    placeholder="https://"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-purple-900/30 p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Endereço & Documentos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">CPF</label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => {
                      const cpf = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, cpf }));
                    }}
                    maxLength={11}
                    className="bg-slate-800 border-purple-900/30 text-white"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">CEP</label>
                  <Input
                    value={formData.address.cep}
                    onChange={(e) => {
                      const cep = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, address: { ...prev.address, cep } }));
                      if (cep.length === 8) fetchAddressByCEP(cep);
                    }}
                    maxLength={8}
                    className="bg-slate-800 border-purple-900/30 text-white"
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Rua</label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                    className="bg-slate-800 border-purple-900/30 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Número</label>
                  <Input
                    value={formData.address.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, number: e.target.value } }))}
                    className="bg-slate-800 border-purple-900/30 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Complemento</label>
                  <Input
                    value={formData.address.complement}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, complement: e.target.value } }))}
                    className="bg-slate-800 border-purple-900/30 text-white"
                    placeholder="Apto, bloco, etc"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Bairro</label>
                  <Input
                    value={formData.address.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, neighborhood: e.target.value } }))}
                    className="bg-slate-800 border-purple-900/30 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Cidade</label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                    className="bg-slate-800 border-purple-900/30 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Estado</label>
                  <Input
                    value={formData.address.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value.toUpperCase() } }))}
                    maxLength={2}
                    className="bg-slate-800 border-purple-900/30 text-white"
                    placeholder="SP"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 text-lg"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      {showColorModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowColorModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/30"
          >
            <h3 className="text-xl font-bold text-white mb-4">Escolha sua Cor de Aura</h3>
            <ColorPicker
              selected={formData.favorite_color}
              onSelect={(color) => {
                setFormData(prev => ({ ...prev, favorite_color: color }));
                setShowColorModal(false);
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}