
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Clock, ArrowLeft, Video, CheckCircle, AlertCircle,
  CreditCard, User, Mail, Phone, MessageSquare, Sparkles, Crown, Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, isBefore, startOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const dayNames = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo"
};

export default function ConsultaEmelynPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1: Info, 2: Escolha data/hora, 3: Dados, 4: Pagamento
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    notes: ""
  });
  const [paymentLink, setPaymentLink] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  // Buscar configurações
  const { data: settings } = useQuery({
    queryKey: ['consultation-settings'],
    queryFn: async () => {
      const allSettings = await base44.entities.ConsultationSettings.list();
      return allSettings.length > 0 ? allSettings[0] : null;
    }
  });

  // Buscar consultas já agendadas do usuário
  const { data: myConsultations } = useQuery({
    queryKey: ['my-consultations', user?.id],
    queryFn: () => base44.entities.Consultation.filter({
      user_id: user.id
    }, "-scheduled_date"),
    enabled: !!user
  });

  // Buscar todas consultas confirmadas (para bloquear horários)
  const { data: bookedSlots } = useQuery({
    queryKey: ['booked-slots'],
    queryFn: () => base44.entities.Consultation.filter({
      status: { $in: ["confirmed", "in_progress"] }
    })
  });

  // Criar consulta e processar pagamento
  const createConsultationMutation = useMutation({
    mutationFn: async (consultationData) => {
      // Criar consulta
      const consultation = await base44.entities.Consultation.create(consultationData);

      // Criar pagamento MercadoPago (this block will be removed or changed later based on internal payment system)
      // The outline shows the paymentLink is still set, implying the external payment option still exists as data.
      // However, the UI for step 4 is changing to an internal payment system.
      const paymentResponse = await base44.functions.invoke('createConsultationPayment', {
        consultation_id: consultation.id,
        amount: settings.price,
        description: `Consulta com Emelyn Chotté - ${format(parseISO(consultationData.scheduled_date), "dd/MM/yyyy", { locale: ptBR })} às ${consultationData.scheduled_time}`,
        payer_email: user.email,
        payer_name: user.display_name || user.full_name
      });

      return {
        consultation,
        payment_link: paymentResponse.data.init_point
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-consultations'] });
      setPaymentLink(data.payment_link);
      setStep(4);
      toast.success("✨ Consulta criada! Complete o pagamento.");
    },
    onError: (error) => {
      toast.error("Erro ao criar consulta: " + error.message);
    }
  });

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Selecione uma data e horário");
      return;
    }

    if (!formData.phone) {
      toast.error("Preencha o telefone para contato");
      return;
    }

    createConsultationMutation.mutate({
      user_id: user.id,
      user_name: user.display_name || user.full_name,
      user_email: user.email,
      user_phone: formData.phone,
      scheduled_date: format(selectedDate, "yyyy-MM-dd"),
      scheduled_time: selectedTime,
      notes: formData.notes,
      price_paid: settings.price,
      status: "pending_payment"
    });
  };

  // Gerar próximos 30 dias
  const generateAvailableDates = () => {
    if (!settings?.available_days) return [];

    const dates = [];
    const today = startOfDay(new Date());

    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      const dayOfWeek = format(date, 'EEEE', { locale: ptBR }).toLowerCase();

      const dayMap = {
        'segunda-feira': 'monday',
        'terça-feira': 'tuesday',
        'quarta-feira': 'wednesday',
        'quinta-feira': 'thursday',
        'sexta-feira': 'friday',
        'sábado': 'saturday',
        'domingo': 'sunday'
      };

      const dayKey = dayMap[dayOfWeek];

      if (settings.available_days.includes(dayKey)) {
        dates.push(date);
      }
    }

    return dates;
  };

  // Verificar se horário está disponível
  const isTimeAvailable = (date, time) => {
    if (!bookedSlots) return true;

    const dateStr = format(date, "yyyy-MM-dd");
    return !bookedSlots.some(slot =>
      slot.scheduled_date === dateStr &&
      slot.scheduled_time === time
    );
  };

  if (!user || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  // Sistema desativado
  if (!settings.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => navigate(createPageUrl("AreaDoAluno"))}
            variant="ghost"
            className="text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Área do Aluno
          </Button>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/30 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Agendamentos Temporariamente Indisponíveis
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {settings.message || "Os agendamentos estão temporariamente indisponíveis. Voltamos em breve!"}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const availableDates = generateAvailableDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl("AreaDoAluno"))}
          variant="ghost"
          className="text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Área do Aluno
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-4 shadow-2xl shadow-purple-500/50 border-4 border-purple-500">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/d7838e0fb_ImagemdoWhatsAppde2025-11-13s131958_d191baad1.jpg"
              alt="Emelyn Chotté"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Consulta com Emelyn Chotté
          </h1>
          <p className="text-gray-400 text-xs md:text-sm lg:text-base">
            Sessão Individual de Tarot Profissional
          </p>
          <Badge className="bg-yellow-600 text-white mt-4 text-xs md:text-sm">
            R$ {settings.price.toFixed(2)} • {settings.duration_minutes} minutos
          </Badge>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Sobre a Consulta</h2>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <Video className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Videoconferência Online</h3>
                      <p className="text-gray-400 text-sm">
                        Sessão ao vivo por videoconferência, com privacidade total
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Duração: {settings.duration_minutes} minutos</h3>
                      <p className="text-gray-400 text-sm">
                        Tempo dedicado exclusivamente para você
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Atendimento Personalizado</h3>
                      <p className="text-gray-400 text-sm">
                        Leitura profunda com orientações práticas para seu momento
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-900 bg-white hover:bg-gray-100"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Agendar Consulta
                  </Button>
                </div>
              </Card>

              {/* Minhas Consultas */}
              {myConsultations && myConsultations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6"
                >
                  <h3 className="text-white font-bold mb-4">Minhas Consultas</h3>
                  <div className="space-y-3">
                    {myConsultations.map((consultation) => (
                      <Card key={consultation.id} className="bg-slate-900 border-purple-500/30 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">
                              {format(parseISO(consultation.scheduled_date), "dd/MM/yyyy", { locale: ptBR })} às {consultation.scheduled_time}
                            </p>
                            <Badge className={
                              consultation.status === 'confirmed' ? 'bg-green-600' :
                              consultation.status === 'pending_payment' ? 'bg-yellow-600' :
                              consultation.status === 'completed' ? 'bg-blue-600' :
                              'bg-gray-600'
                            }>
                              {consultation.status === 'confirmed' ? '✓ Confirmada' :
                               consultation.status === 'pending_payment' ? '⏳ Aguardando Pagamento' :
                               consultation.status === 'completed' ? '✓ Concluída' :
                               consultation.status}
                            </Badge>
                          </div>
                          {consultation.status === 'confirmed' && (
                            <Button
                              onClick={() => navigate(createPageUrl(`RoomConsulta?id=${consultation.id}`))}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Entrar
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Escolha Data e Horário</h2>

                {/* Datas */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4">Selecione o Dia</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableDates.slice(0, 12).map((date) => (
                      <button
                        key={date.toString()}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        className={`p-4 rounded-lg border-2 transition ${
                          selectedDate && format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                            ? 'border-purple-500 bg-purple-900/30'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                        <p className="text-white font-semibold text-sm">
                          {format(date, "dd MMM", { locale: ptBR })}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {format(date, "EEEE", { locale: ptBR })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horários */}
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-white font-semibold mb-4">Horários Disponíveis</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {settings.available_hours.map((time) => {
                        const available = isTimeAvailable(selectedDate, time);
                        return (
                          <button
                            key={time}
                            onClick={() => available && setSelectedTime(time)}
                            disabled={!available}
                            className={`p-3 rounded-lg border-2 transition ${
                              selectedTime === time
                                ? 'border-purple-500 bg-purple-900/30'
                                : available
                                ? 'border-slate-700 hover:border-slate-600'
                                : 'border-slate-800 opacity-30 cursor-not-allowed'
                            }`}
                          >
                            <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                            <p className="text-white text-sm font-semibold">{time}</p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col md:flex-row gap-3 mt-8">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-900 bg-white hover:bg-gray-100"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Continuar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Confirme seus Dados</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      <User className="w-4 h-4 inline mr-2" />
                      Nome Completo
                    </label>
                    <Input
                      value={user.display_name || user.full_name}
                      disabled
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-mail
                    </label>
                    <Input
                      value={user.email}
                      disabled
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefone/WhatsApp *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Observações (opcional)
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Alguma informação importante que queira compartilhar..."
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Resumo */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-3">Resumo do Agendamento</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data:</span>
                      <span className="text-white font-semibold">
                        {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Horário:</span>
                      <span className="text-white font-semibold">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duração:</span>
                      <span className="text-white font-semibold">{settings.duration_minutes} minutos</span>
                    </div>
                    <div className="border-t border-purple-500/30 pt-2 mt-2 flex justify-between">
                      <span className="text-gray-400">Valor:</span>
                      <span className="text-yellow-400 font-bold text-lg">R$ {settings.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-900 bg-white hover:bg-gray-100"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createConsultationMutation.isPending || !formData.phone}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {createConsultationMutation.isPending ? (
                      <>Processando...</>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Ir para Pagamento
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-green-500/30 p-6 md:p-8">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
                  Pagamento Interno
                </h2>
                <p className="text-gray-300 mb-8 leading-relaxed text-center text-sm md:text-base">
                  Use seus ouros ou compre mais para confirmar sua consulta.
                </p>
                <Button
                  onClick={() => navigate(createPageUrl("Carteira"))}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 py-6 text-lg font-bold text-slate-900"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  Pagar com Ouros
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
