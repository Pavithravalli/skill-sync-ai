export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Business' | 'Design' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number; // 0 to 100
  lastUpdated: string; // ISO string
  description?: string;
  milestones: Milestone[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  currentRole: string;
  targetRole: string;
  primaryFocus?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  currentRole: string;
  targetRole: string;
  primaryFocus?: string;
  skills: Skill[];
  createdAt: string;
}

export interface AISuggestion {
  skillName: string;
  description: string;
  category: 'Technical' | 'Soft Skills' | 'Business' | 'Design' | 'Other';
  estimatedHours: number;
  importanceReason: string;
  milestones: string[];
}
