import React from 'react';
import { AISuggestion } from '../types';
import { Sparkles, ArrowRight, Clock, Award, CheckSquare, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface SuggestionsSectionProps {
  suggestions: AISuggestion[];
  onGenerate: () => void;
  loading: boolean;
  onAddSkill: (suggestion: AISuggestion) => void;
  addedSuggestions: string[]; // Keep track of suggested names added
}

export function SuggestionsSection({
  suggestions,
  onGenerate,
  loading,
  onAddSkill,
  addedSuggestions
}: SuggestionsSectionProps) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8">
      {/* Header info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm tracking-wide uppercase mb-1">
            <Sparkles className="w-4 h-4 animate-pulse text-indigo-500 fill-indigo-100" />
            <span>AI Transition Copilot</span>
          </div>
          <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-800 tracking-tight">
            Personalized Skill Gap Suggestions
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Our Gemini-powered analysis compares your current skillset against your target role, identifying the most impactful missing skills required to bridge your transition.
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className={`flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer ${
            loading 
              ? 'bg-blue-300 text-blue-50 cursor-not-allowed border border-blue-200' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-750 text-white hover:opacity-95 shadow-blue-200 hover:shadow-lg'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Analyzing Gap...' : 'Query Gemini suggestions'}</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-xl space-y-3.5 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 w-24 rounded-md"></div>
                <div className="h-4 bg-slate-200 w-16 rounded-md"></div>
              </div>
              <div className="h-5 bg-slate-200 w-3/4 rounded-md"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 w-full rounded-md"></div>
                <div className="h-3 bg-slate-200 w-5/6 rounded-md"></div>
              </div>
              <div className="h-8 bg-slate-200 w-full rounded-md pt-1"></div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestion Empty State */}
      {!loading && suggestions.length === 0 && (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center max-w-xl mx-auto">
          <Sparkles className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <h3 className="font-sans font-bold text-slate-700 text-base">Generate Career Gap Suggestions</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Click the analyzer button above. The Skill Sync engine will read your Target Role and current listed strengths, then formulate a personalized recommendation profile.
          </p>
          <button
            onClick={onGenerate}
            className="mt-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Run Deep Analysis Now
          </button>
        </div>
      )}

      {/* Suggestions Results */}
      {!loading && suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((sug, idx) => {
            const isAdded = addedSuggestions.includes(sug.skillName);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white border border-slate-100 shadow-xs hover:border-blue-150 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Category & Hours */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                      {sug.category}
                    </span>
                    <div className="flex items-center text-xs text-slate-400 font-medium font-mono">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{sug.estimatedHours} hrs</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-sans font-bold text-slate-800 text-base tracking-tight mb-1.5 group-hover:text-blue-600 transition-colors">
                    {sug.skillName}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {sug.description}
                  </p>

                  {/* Core Milestones Previews */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Suggested Roadmap</span>
                    {sug.milestones && sug.milestones.slice(0, 3).map((milestone, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-2 text-slate-650 text-xs text-left">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="font-medium text-slate-600 text-[11px] leading-tight">{milestone}</span>
                      </div>
                    ))}
                  </div>

                  {/* Why it is important */}
                  <div className="border-t border-slate-100 pt-3.5 mb-4">
                    <p className="text-[11px] text-slate-500 leading-normal italic">
                      <strong className="text-blue-600 font-semibold not-italic mr-1">Gap Impact:</strong>
                      {sug.importanceReason}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button */}
                <button
                  onClick={() => !isAdded && onAddSkill(sug)}
                  disabled={isAdded}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to Active Board</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sync into Active Track</span>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
