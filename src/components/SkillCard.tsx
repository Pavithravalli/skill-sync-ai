import React, { useState } from 'react';
import { Skill, Milestone } from '../types';
import { Trash2, Plus, CheckCircle, Circle, Target, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SkillCardProps {
  key?: string | number | any;
  skill: Skill;
  onToggleMilestone: (skillId: string, milestoneId: string, currentStatus: boolean) => void;
  onAddMilestone: (skillId: string, title: string) => void;
  onDeleteSkill: (skillId: string) => void;
  onUpdateLevel: (skillId: string, newLevel: Skill['level']) => void;
}

export function SkillCard({ 
  skill, 
  onToggleMilestone, 
  onAddMilestone, 
  onDeleteSkill,
  onUpdateLevel
}: SkillCardProps) {
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  // Category specific styles
  const categoryColors = {
    'Technical': 'bg-blue-50 text-blue-700 border-blue-200',
    'Soft Skills': 'bg-teal-50 text-teal-700 border-teal-200',
    'Business': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Design': 'bg-violet-50 text-violet-700 border-violet-200',
    'Other': 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const levelColors = {
    'Beginner': 'text-amber-600 bg-amber-50',
    'Intermediate': 'text-blue-600 bg-blue-50',
    'Advanced': 'text-emerald-600 bg-emerald-50',
    'Expert': 'text-purple-600 bg-purple-50'
  };

  const levels: Skill['level'][] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleSubmitMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;
    onAddMilestone(skill.id, newMilestoneText.trim());
    setNewMilestoneText('');
    setShowAddMilestone(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Header: Name & category */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryColors[skill.category] || categoryColors['Other']} mb-2.5`}>
              {skill.category}
            </span>
            <h3 className="font-sans font-bold text-slate-800 text-lg tracking-tight leading-snug">
              {skill.name}
            </h3>
          </div>
          <button 
            onClick={() => onDeleteSkill(skill.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Delete skill"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Level selection */}
        <div className="flex items-center space-x-2 mt-3.5 mb-4">
          <span className="text-xs text-slate-500 font-medium">Level:</span>
          <div className="flex flex-wrap gap-1">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => onUpdateLevel(skill.id, lvl)}
                className={`px-2 py-0.5 text-xs rounded transition-all cursor-pointer ${
                  skill.level === lvl 
                    ? `${levelColors[lvl]} font-semibold ring-1 ring-blue-300` 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-normal'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {skill.description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2 italic h-8">
            {skill.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-5 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Overall Progress</span>
            <span className="font-mono text-blue-600">{skill.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${skill.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Milestones list */}
        <div className="space-y-2 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Checkpoint Milestones</span>
            <button 
              onClick={() => setShowAddMilestone(!showAddMilestone)}
              className="text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {showAddMilestone && (
            <form onSubmit={handleSubmitMilestone} className="mt-2 flex items-center gap-1">
              <input
                type="text"
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                placeholder="New milestone..."
                className="w-full text-xs px-2.5 py-1.5 border border-blue-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50 text-slate-800"
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white rounded-lg p-1.5 hover:bg-blue-700 cursor-pointer text-xs font-semibold px-3 elevation-sm"
              >
                Save
              </button>
            </form>
          )}

          <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
            {skill.milestones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No milestones set. Click 'Add' above structure.</p>
            ) : (
              skill.milestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  onClick={() => onToggleMilestone(skill.id, milestone.id, milestone.completed)}
                  className={`flex items-start gap-2.5 cursor-pointer p-2 rounded-lg transition-colors group ${
                    milestone.completed ? 'bg-emerald-50/20 text-slate-400 line-through' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <button className="flex-shrink-0 mt-0.5 cursor-pointer text-slate-400 focus:outline-hidden">
                    {milestone.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                  <span className="text-xs font-medium leading-relaxed">
                    {milestone.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer: Last Updated */}
      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 border-t border-slate-100 pt-3.5 mt-3.5 font-mono">
        <Calendar className="w-3.5 h-3.5" />
        <span>Updated: {new Date(skill.lastUpdated).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}
