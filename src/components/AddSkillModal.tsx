import React, { useState } from 'react';
import { Skill } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface AddSkillModalProps {
  onClose: () => void;
  onSave: (skillData: {
    name: string;
    category: Skill['category'];
    level: Skill['level'];
    description: string;
    milestones: string[];
  }) => void;
}

export function AddSkillModal({ onClose, onSave }: AddSkillModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Skill['category']>('Technical');
  const [level, setLevel] = useState<Skill['level']>('Beginner');
  const [description, setDescription] = useState('');
  const [milestoneInput, setMilestoneInput] = useState('');
  const [milestonesList, setMilestonesList] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAddMilestone = () => {
    if (!milestoneInput.trim()) return;
    if (milestonesList.includes(milestoneInput.trim())) {
      setError('Milestone already added!');
      return;
    }
    setMilestonesList([...milestonesList, milestoneInput.trim()]);
    setMilestoneInput('');
    setError('');
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestonesList(milestonesList.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMilestone();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a skill name.');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      level,
      description: description.trim(),
      milestones: milestonesList
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Absolute Close */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-sans font-bold text-slate-800 text-xl tracking-tight mb-1.5 text-left">
          Track New Skill
        </h3>
        <p className="text-xs text-slate-500 mb-6 text-left">
          Configure a core competency to log your checkpoints, hours of mastery, and targets.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-3 text-xs font-semibold mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Skill Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Skill Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Docker Containerization, Python Automation"
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Skill['category'])}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 cursor-pointer"
              >
                <option value="Technical">Technical</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Level dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Starting Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Skill['level'])}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Overview Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief outline summary of why this skill is being logged..."
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Milestones Planner */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Roadmap Checkpoint Milestones
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              Add individual checkpoint targets (e.g. "Read course manual", "Deploy production test app") and hit Add.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add actionable checkpoint..."
                className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* List Preview */}
            <div className="mt-3.5 space-y-2 max-h-32 overflow-y-auto pr-1">
              {milestonesList.length === 0 ? (
                <span className="text-[11px] text-slate-400 italic block">No checkpoints specified yet. Feel free to skip and add more on cards.</span>
              ) : (
                milestonesList.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
                    <span className="truncate">{m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-95 text-sm font-bold rounded-xl shadow-md cursor-pointer shadow-blue-200"
            >
              Create Tracked Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
