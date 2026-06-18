import React from 'react';
import { Skill } from '../types.js';
import { Target, TrendingUp, CheckCircle, BarChart2, Star } from 'lucide-react';

interface StatsDashboardProps {
  skills: Skill[];
}

export function StatsDashboard({ skills }: StatsDashboardProps) {
  const totalSkills = skills.length;
  
  // Calculate average progress
  const averageProgress = totalSkills > 0 
    ? Math.round(skills.reduce((acc, curr) => acc + curr.progress, 0) / totalSkills) 
    : 0;

  // Calculate milestone stats
  const totalMilestones = skills.reduce((acc, curr) => acc + curr.milestones.length, 0);
  const completedMilestones = skills.reduce(
    (acc, curr) => acc + curr.milestones.filter(m => m.completed).length, 
    0
  );

  const milestoneRatio = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  // Level percentages
  const experts = skills.filter(s => s.level === 'Expert').length;
  const advanced = skills.filter(s => s.level === 'Advanced').length;
  const intermediate = skills.filter(s => s.level === 'Intermediate').length;
  const beginners = skills.filter(s => s.level === 'Beginner').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Stat 1: Total Tracking */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Skills</span>
          <span className="text-2xl font-black text-slate-800 font-mono">{totalSkills}</span>
          <span className="text-[10px] text-slate-500 block">Currently tracking</span>
        </div>
      </div>

      {/* Stat 2: Avg Progress */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Average Progress</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-800 font-mono">{averageProgress}%</span>
            <span className="text-[10px] text-indigo-500 font-semibold font-mono">Skill Index</span>
          </div>
          {/* Small visual bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${averageProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stat 3: Milestone completion */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Milestones Ratio</span>
          <span className="text-2xl font-black text-slate-800 font-mono">
            {completedMilestones}<span className="text-slate-300 font-normal">/{totalMilestones}</span>
          </span>
          <span className="text-[10px] text-emerald-600 block font-semibold">{milestoneRatio}% completed</span>
        </div>
      </div>

      {/* Stat 4: Expert status */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Star className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Expertise Level</span>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="text-sm font-semibold text-slate-700">Expert:</span>
            <span className="font-mono text-xs font-bold text-amber-600">{experts}</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
            <span>Adv:</span>
            <span className="font-semibold text-slate-600">{advanced}</span>
            <span>•</span>
            <span>Int:</span>
            <span className="font-semibold text-slate-600">{intermediate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
