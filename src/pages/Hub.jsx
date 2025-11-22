import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Zap } from "lucide-react";

export default function MysticInfo({ user }) {
  if (!user) return null;

  const currentLevel = user.level || 1;
  const currentXP = user.xp || 0;
  const xpToNextLevel = currentLevel * 100;
  const progress = Math.min((currentXP / xpToNextLevel) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center border border-purple-500/50">
          <Crown className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-white">Nível {currentLevel}</span>
            <span className="text-xs text-purple-300">{currentXP}/{xpToNextLevel} XP</span>
          </div>
          <Progress value={progress} className="h-2 bg-purple-950" indicatorClassName="bg-purple-500" />
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border-yellow-500/30 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-yellow-600/20 flex items-center justify-center border border-yellow-500/50">
          <Star className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs text-yellow-200 uppercase font-bold tracking-wider">Seus Ouros</p>
          <p className="text-2xl font-bold text-white">{user.ouros || 0}</p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30 p-4 flex items-center gap-4 md:col-span-1 col-span-2 md:col-auto">
        <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/50">
          <Zap className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Ofensiva</p>
          <p className="text-xl font-bold text-white">{user.daily_streak || 0} dias</p>
        </div>
      </Card>
    </div>
  );
} 