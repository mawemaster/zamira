import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, Video, FileText, Award, Eye, Play, BookOpen, Activity, Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function PortalTarotTab() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    proStudents: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    avgProgress: 0,
    totalVideoViews: 0,
    totalPDFViews: 0,
    mostWatchedLesson: null,
    mostReadPDF: null
  });

  const { data: allUsers } = useQuery({
    queryKey: ['portal-users'],
    queryFn: () => base44.entities.User.list("-created_date", 1000),
  });

  const { data: orders } = useQuery({
    queryKey: ['portal-orders'],
    queryFn: () => base44.entities.Order.list("-created_date", 1000),
  });

  const { data: courseProgress } = useQuery({
    queryKey: ['portal-progress'],
    queryFn: () => base44.entities.CourseProgress.list("-updated_date", 1000),
  });

  const { data: courses } = useQuery({
    queryKey: ['portal-courses'],
    queryFn: () => base44.entities.TarotCourse.list("lesson_number", 100),
  });

  const { data: pdfs } = useQuery({
    queryKey: ['portal-pdfs'],
    queryFn: () => base44.entities.PDFLibrary.filter({ category: 'tarot' }, "-views_count", 100),
  });

  useEffect(() => {
    if (allUsers && orders && courseProgress && courses && pdfs) {
      calculateStats();
    }
  }, [allUsers, orders, courseProgress, courses, pdfs]);

  const calculateStats = () => {
    const proStudents = allUsers?.filter(u => u.is_pro_subscriber).length || 0;
    const completedOrders = orders?.filter(o => o.status === 'approved').length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    const totalProgress = courseProgress?.reduce((sum, p) => {
      const progress = (p.video_progress || 0) / (p.video_duration || 1);
      return sum + progress;
    }, 0) || 0;
    const avgProgress = courseProgress?.length > 0 ? (totalProgress / courseProgress.length) * 100 : 0;

    const totalVideoViews = courses?.reduce((sum, c) => sum + (c.views_count || 0), 0) || 0;
    const totalPDFViews = pdfs?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;

    const mostWatchedLesson = courses?.reduce((max, c) => 
      (c.views_count || 0) > (max?.views_count || 0) ? c : max, null
    );

    const mostReadPDF = pdfs?.[0] || null;

    setStats({
      totalStudents: allUsers?.length || 0,
      proStudents,
      totalOrders: orders?.length || 0,
      completedOrders,
      totalRevenue,
      avgProgress: Math.round(avgProgress),
      totalVideoViews,
      totalPDFViews,
      mostWatchedLesson,
      mostReadPDF
    });
  };

  const lessonViewsData = courses?.slice(0, 10).map(c => ({
    name: `Lição ${c.lesson_number}`,
    views: c.views_count || 0
  })) || [];

  const pdfViewsData = pdfs?.slice(0, 5).map(p => ({
    name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
    views: p.views_count || 0
  })) || [];

  const progressDistribution = [
    { name: '0-25%', value: courseProgress?.filter(p => {
      const prog = (p.video_progress / p.video_duration) * 100;
      return prog < 25;
    }).length || 0 },
    { name: '25-50%', value: courseProgress?.filter(p => {
      const prog = (p.video_progress / p.video_duration) * 100;
      return prog >= 25 && prog < 50;
    }).length || 0 },
    { name: '50-75%', value: courseProgress?.filter(p => {
      const prog = (p.video_progress / p.video_duration) * 100;
      return prog >= 50 && prog < 75;
    }).length || 0 },
    { name: '75-100%', value: courseProgress?.filter(p => {
      const prog = (p.video_progress / p.video_duration) * 100;
      return prog >= 75;
    }).length || 0 },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Portal Tarot - Área do Aluno</h2>
        <p className="text-slate-600">Estatísticas e métricas completas do curso</p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-medium">Total Alunos</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-yellow-600 font-medium">Alunos PRO</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.proStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium">Progresso Médio</p>
              <p className="text-2xl font-bold text-green-900">{stats.avgProgress}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Pedidos</p>
              <p className="text-2xl font-bold text-blue-900">{stats.completedOrders}/{stats.totalOrders}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Visualizações */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            Total de Visualizações de Vídeos
          </h3>
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {stats.totalVideoViews}
          </div>
          {stats.mostWatchedLesson && (
            <p className="text-sm text-slate-600">
              Mais assistida: <strong>{stats.mostWatchedLesson.title}</strong> ({stats.mostWatchedLesson.views_count} views)
            </p>
          )}
        </Card>

        <Card className="bg-white border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-600" />
            Total de Leituras de PDFs
          </h3>
          <div className="text-4xl font-bold text-pink-600 mb-2">
            {stats.totalPDFViews}
          </div>
          {stats.mostReadPDF && (
            <p className="text-sm text-slate-600">
              Mais lido: <strong>{stats.mostReadPDF.title}</strong> ({stats.mostReadPDF.views_count} leituras)
            </p>
          )}
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de Views por Lição */}
        <Card className="bg-white border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Views por Lição (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lessonViewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '12px' }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#9333EA" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição de Progresso */}
        <Card className="bg-white border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Distribuição de Progresso dos Alunos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={progressDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {progressDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* PDFs Mais Lidos */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          PDFs Mais Lidos
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pdfViewsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="views" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4">
          💰 Resumo Financeiro
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-green-600 mb-1">Receita Total</p>
            <p className="text-3xl font-bold text-green-900">
              R$ {stats.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-600 mb-1">Pedidos Aprovados</p>
            <p className="text-3xl font-bold text-green-900">
              {stats.completedOrders}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-600 mb-1">Taxa de Aprovação</p>
            <p className="text-3xl font-bold text-green-900">
              {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
            </p>
          </div>
        </div>
      </Card>

      {/* Engajamento */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Alunos Ativos (últimos 7 dias)
          </h4>
          <p className="text-3xl font-bold text-purple-600">
            {allUsers?.filter(u => {
              const lastSeen = new Date(u.last_seen);
              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return lastSeen > sevenDaysAgo;
            }).length || 0}
          </p>
        </Card>

        <Card className="bg-white border-slate-200 p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Certificados Gerados
          </h4>
          <p className="text-3xl font-bold text-yellow-600">
            {allUsers?.filter(u => u.certificate_url).length || 0}
          </p>
        </Card>

        <Card className="bg-white border-slate-200 p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Aulas Completadas
          </h4>
          <p className="text-3xl font-bold text-green-600">
            {courseProgress?.filter(p => p.is_completed).length || 0}
          </p>
        </Card>
      </div>

      {/* Top Alunos por Progresso */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          🏆 Top 10 Alunos por Progresso
        </h3>
        <div className="space-y-3">
          {allUsers?.slice(0, 10).map((user, index) => {
            const userProgress = courseProgress?.filter(p => p.user_id === user.id) || [];
            const avgUserProgress = userProgress.length > 0
              ? userProgress.reduce((sum, p) => {
                  return sum + ((p.video_progress || 0) / (p.video_duration || 1));
                }, 0) / userProgress.length * 100
              : 0;

            return (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{user.display_name || user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{Math.round(avgUserProgress)}%</p>
                  <p className="text-xs text-slate-500">completo</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}