import React, { useState, useEffect } from 'react';
import { UserProfile, Skill, AISuggestion } from './types';
import { Navbar } from './components/Navbar';
import { StatsDashboard } from './components/StatsDashboard';
import { SkillCard } from './components/SkillCard';
import { SuggestionsSection } from './components/SuggestionsSection';
import { AddSkillModal } from './components/AddSkillModal';
import { AuthLayout } from './components/AuthLayout';
import { Sparkles, Plus, Search, Filter, RefreshCw, Star, Info, MessageSquareCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('skill_sync_token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [addedSuggestions, setAddedSuggestions] = useState<string[]>([]);
  
  // App UX state
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [aiConnected, setAiConnected] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Recover session on mount
  useEffect(() => {
    async function recoverSession() {
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setSkills(data.user.skills || []);
        } else {
          // Bad token or expired
          handleLogout();
        }
      } catch (err) {
        console.error('Session recovery failed:', err);
      } finally {
        setLoadingUser(false);
      }
    }
    
    recoverSession();
    checkAiAvailability();
  }, [token]);

  const checkAiAvailability = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const body = await res.json();
        setAiConnected(body.aiConfigured);
      }
    } catch {
      setAiConnected(false);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    setErrorNotice(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }
    localStorage.setItem('skill_sync_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSkills(data.user.skills || []);
  };

  const handleRegister = async (regData: {
    email: string;
    fullName: string;
    pass: string;
    currentRole: string;
    targetRole: string;
    primaryFocus: string;
  }) => {
    setErrorNotice(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: regData.email,
        fullName: regData.fullName,
        password: regData.pass,
        currentRole: regData.currentRole,
        targetRole: regData.targetRole,
        primaryFocus: regData.primaryFocus
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error setting up account');
    }
    localStorage.setItem('skill_sync_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setSkills(data.user.skills || []);
  };

  const handleLogout = async () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error(err));
    }
    localStorage.removeItem('skill_sync_token');
    setToken(null);
    setUser(null);
    setSkills([]);
    setSuggestions([]);
    setAddedSuggestions([]);
  };

  // Milestone toggling: completed/incomplete
  const handleToggleMilestone = async (skillId: string, milestoneId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/skills/${skillId}/milestones/${milestoneId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (res.ok) {
        const updatedSkill = await res.json();
        setSkills(skills.map(s => s.id === skillId ? updatedSkill : s));
      } else {
        const errData = await res.json();
        setErrorNotice(errData.error || 'Failed to update milestone status');
      }
    } catch (err) {
      setErrorNotice('Error updating milestone checkpoint.');
    }
  };

  // Inline milestone creation
  const handleAddMilestone = async (skillId: string, title: string) => {
    try {
      const res = await fetch(`/api/skills/${skillId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        const updatedSkill = await res.json();
        setSkills(skills.map(s => s.id === skillId ? updatedSkill : s));
      } else {
        const errData = await res.json();
        setErrorNotice(errData.error || 'Failed to insert milestone');
      }
    } catch (err) {
      setErrorNotice('Error creating milestone.');
    }
  };

  // Manual save of fully custom skill
  const handleSaveCustomSkill = async (skillData: {
    name: string;
    category: Skill['category'];
    level: Skill['level'];
    description: string;
    milestones: string[];
  }) => {
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(skillData)
      });
      if (res.ok) {
        const newSkill = await res.json();
        setSkills([...skills, newSkill]);
        setShowAddModal(false);
      } else {
        const errData = await res.json();
        setErrorNotice(errData.error || 'Failed to construct skill');
      }
    } catch (err) {
      setErrorNotice('Network error building tracked skill.');
    }
  };

  // Update Level in-place from cards
  const handleUpdateLevel = async (skillId: string, newLevel: Skill['level']) => {
    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ level: newLevel })
      });
      if (res.ok) {
        const updatedSkill = await res.json();
        setSkills(skills.map(s => s.id === skillId ? updatedSkill : s));
      }
    } catch {
      setErrorNotice('Error updating skill proficiency level.');
    }
  };

  // Skill removal
  const handleDeleteSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSkills(skills.filter(s => s.id !== skillId));
      }
    } catch {
      setErrorNotice('Error executing skill removal.');
    }
  };

  // AI Suggestion Handler: queries Gemini
  const handleGenerateSuggestions = async () => {
    if (!user) return;
    setLoadingSuggestions(true);
    setErrorNotice(null);

    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentRole: user.currentRole,
          targetRole: user.targetRole,
          primaryFocus: user.primaryFocus,
          currentSkills: skills
        })
      });
      if (res.ok) {
        const recs = await res.json();
        setSuggestions(recs);
      } else {
        const errData = await res.json();
        setErrorNotice(errData.error || 'Failed to run AI gap mapping.');
      }
    } catch (err) {
      setErrorNotice('Error calling AI suggestion endpoints.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Adding suggested AI skill into active tracked set
  const handleAddAIRecommendation = async (suggestion: AISuggestion) => {
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: suggestion.skillName,
          category: suggestion.category,
          level: 'Beginner', // recommended start at beginner level
          description: suggestion.description,
          milestones: recommendationToMilestones(suggestion.milestones)
        })
      });

      if (res.ok) {
        const addedSkill = await res.json();
        setSkills([...skills, addedSkill]);
        setAddedSuggestions([...addedSuggestions, suggestion.skillName]);
      } else {
        setErrorNotice('Error synchronizing recommended skill.');
      }
    } catch {
      setErrorNotice('Failed to synchronize recommended skill.');
    }
  };

  const recommendationToMilestones = (milestones: string[]) => {
    if (!milestones || milestones.length === 0) {
      return ['Read foundational manuals', 'Build sandbox prototype', 'Deploy and review metrics'];
    }
    return milestones;
  };

  // Filter and search computation
  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Global Loading State
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-sans font-bold text-slate-700">Checking credentials...</h2>
          <p className="text-xs text-slate-400 mt-1">Skill Sync is configuring secure local session caches.</p>
        </div>
      </div>
    );
  }

  // Not Logged In
  if (!user || !token) {
    return <AuthLayout onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* App Nav */}
      <Navbar user={user} onLogout={handleLogout} aiConnected={aiConnected} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error notification header */}
        {errorNotice && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs font-semibold text-red-600 mb-6 flex justify-between items-center animate-in slide-in-from-top duration-300">
            <span className="text-left">{errorNotice}</span>
            <button 
              onClick={() => setErrorNotice(null)} 
              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-bold cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Career Transition Header banner */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Star className="w-4 h-4 fill-blue-50" />
              <span>Career Transition Roadmap Matrix</span>
            </div>
            <h1 className="font-sans font-black text-2xl md:text-3xl tracking-tight text-slate-800">
              {user.fullName}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Transition path: Let's synchronize your strengths from <strong className="text-blue-600 font-semibold">{user.currentRole}</strong> to the standard competency framework of a <strong className="text-indigo-650 font-semibold">{user.targetRole}</strong>.
            </p>
            {user.primaryFocus && (
              <div className="mt-3.5 flex items-center space-x-2 text-slate-500 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider font-mono text-[9px] bg-slate-100 px-2 py-0.5 rounded-md">Topic Scope:</span>
                <span className="italic">{user.primaryFocus}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Custom Skill</span>
          </button>
        </div>

        {/* Statistical Overview grid */}
        <StatsDashboard skills={skills} />

        {/* Interactive suggestions banner block */}
        <div className="mb-10">
          <SuggestionsSection
            suggestions={suggestions}
            onGenerate={handleGenerateSuggestions}
            loading={loadingSuggestions}
            onAddSkill={handleAddAIRecommendation}
            addedSuggestions={addedSuggestions}
          />
        </div>

        {/* Grid Management: active filters & search */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-sans font-extrabold text-slate-800 text-lg tracking-tight">Active Competency Tracks</h2>
              <p className="text-xs text-slate-400">View progress checklists, increase skill proficiency levels, and toggle milestone checkpoints.</p>
            </div>

            {/* In-place search field */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search competencies..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-700"
                />
              </div>

              {/* Category segments filters */}
              <div className="flex bg-slate-50 border border-slate-150 rounded-xl p-1 gap-1">
                {['All', 'Technical', 'Soft Skills', 'Business', 'Design'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-450 hover:text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid output */}
          <AnimatePresence mode="popLayout">
            {filteredSkills.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center max-w-sm mx-auto"
              >
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-bold text-slate-600 text-base">No competencies matched search</h3>
                <p className="text-xs text-slate-400 mt-1">Try resetting the segment filter tab or typing another keyword. Or click 'Track New Custom Skill' to create one manually.</p>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredSkills.map((s) => (
                  <SkillCard
                    key={s.id}
                    skill={s}
                    onToggleMilestone={handleToggleMilestone}
                    onAddMilestone={handleAddMilestone}
                    onDeleteSkill={handleDeleteSkill}
                    onUpdateLevel={handleUpdateLevel}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Dynamic Popups */}
      {showAddModal && (
        <AddSkillModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveCustomSkill}
        />
      )}
    </div>
  );
}

