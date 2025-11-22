import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, Eye, CheckCircle, X, Activity, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const reasonLabels = {
  spam: "Spam",
  harassment: "Assédio",
  hate_speech: "Discurso de Ódio",
  violence: "Violência",
  nudity: "Nudez",
  misinformation: "Desinformação",
  other: "Outro"
};

export default function ReportsTab() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.PostReport.list("-created_date", 100)
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.PostReport.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelectedReport(null);
      toast.success("✓ Denúncia atualizada!");
    }
  });

  const handleResolve = (report, action) => {
    updateReportMutation.mutate({
      id: report.id,
      data: {
        status: action === 'dismiss' ? 'dismissed' : 'action_taken',
        admin_notes: adminNotes,
        action_taken: actionTaken
      }
    });
  };

  const pendingCount = reports?.filter(r => r.status === 'pending').length || 0;
  const reviewedCount = reports?.filter(r => r.status === 'reviewed').length || 0;
  const actionTakenCount = reports?.filter(r => r.status === 'action_taken').length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <TrendingUp className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{pendingCount}</p>
          <p className="text-xs text-yellow-300">Pendentes</p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{reviewedCount}</p>
          <p className="text-xs text-blue-300">Em Análise</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{actionTakenCount}</p>
          <p className="text-xs text-green-300">Resolvidas</p>
        </Card>
      </div>

      {/* Lista de Denúncias */}
      <Card className="bg-white border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Denúncias de Publicações</h2>
        
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Carregando denúncias...</p>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border-2 p-4 ${
                  report.status === 'pending' ? 'bg-yellow-50 border-yellow-300' :
                  report.status === 'reviewed' ? 'bg-blue-50 border-blue-300' :
                  report.status === 'action_taken' ? 'bg-green-50 border-green-300' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={
                          report.status === 'pending' ? 'bg-yellow-600' :
                          report.status === 'reviewed' ? 'bg-blue-600' :
                          report.status === 'action_taken' ? 'bg-green-600' :
                          'bg-gray-600'
                        }>
                          {report.status === 'pending' ? 'Pendente' :
                           report.status === 'reviewed' ? 'Em Análise' :
                           report.status === 'action_taken' ? 'Ação Tomada' :
                           'Arquivada'}
                        </Badge>
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          {reasonLabels[report.reason]}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(report.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Denunciante</p>
                          <p className="text-sm font-semibold text-slate-900">{report.reporter_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Autor do Post</p>
                          <p className="text-sm font-semibold text-slate-900">{report.post_author_name}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-lg mb-3">
                        <p className="text-xs text-slate-500 mb-1">Conteúdo do Post:</p>
                        <p className="text-sm text-slate-700 line-clamp-3">{report.post_content}</p>
                      </div>

                      {report.details && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <p className="text-xs text-blue-600 mb-1">Detalhes da Denúncia:</p>
                          <p className="text-sm text-slate-700">{report.details}</p>
                        </div>
                      )}

                      {report.admin_notes && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-xs text-purple-600 mb-1">Notas do Admin:</p>
                          <p className="text-sm text-slate-700">{report.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-3 h-3 mr-2" />
                          Analisar
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedReport?.id === report.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-slate-300 pt-4 mt-4 space-y-3"
                    >
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Notas do admin..."
                        className="bg-white"
                        rows={3}
                      />
                      <Textarea
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="Ação tomada..."
                        className="bg-white"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleResolve(report, 'action')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ação Tomada
                        </Button>
                        <Button
                          onClick={() => handleResolve(report, 'dismiss')}
                          variant="outline"
                          className="border-gray-300"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Arquivar
                        </Button>
                        <Button
                          onClick={() => setSelectedReport(null)}
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600">Nenhuma denúncia no momento</p>
          </div>
        )}
      </Card>
    </div>
  );
}