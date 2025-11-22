import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Activity, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function QuizzesTab() {
  const { data: quizAttempts } = useQuery({
    queryKey: ['admin-quiz-attempts'],
    queryFn: async () => {
      // Como não temos entidade de quiz attempts, vamos mostrar stats dos usuários
      const users = await base44.entities.User.list("-xp", 100);
      return users.filter(u => u.xp > 0);
    },
    refetchInterval: 10000
  });

  const topPerformers = quizAttempts?.slice(0, 10) || [];
  const avgXP = quizAttempts?.reduce((sum, u) => sum + (u.xp || 0), 0) / (quizAttempts?.length || 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Quizzes Místicos</h2>
        <p className="text-slate-600">Acompanhe o desempenho dos usuários</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-slate-900">{quizAttempts?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">XP Médio</p>
              <p className="text-2xl font-bold text-slate-900">{Math.floor(avgXP || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Top Performers</p>
              <p className="text-2xl font-bold text-slate-900">{topPerformers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top 10 */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Top 10 Usuários por XP
        </h3>
        <div className="space-y-3">
          {topPerformers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-amber-700 text-white' :
                'bg-slate-300 text-slate-700'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {user.display_name || user.full_name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-purple-600">
                  {user.xp?.toLocaleString()} XP
                </p>
                <Badge variant="outline" className="text-xs">
                  Nv {user.level || 1}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 p-6">
        <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Sobre os Quizzes
        </h4>
        <ul className="text-sm text-purple-800 space-y-1.5">
          <li>✨ Usuários ganham 0.5% de XP ao acertar 80%+ das questões</li>
          <li>🧠 Quizzes gerados por IA sobre temas holísticos</li>
          <li>📊 Sistema de progresso com 10 perguntas por quiz</li>
          <li>⏱️ Timer de 60 segundos por quiz completo</li>
        </ul>
      </Card>
    </div>
  );
}