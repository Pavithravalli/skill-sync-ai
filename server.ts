import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  getUsers, 
  saveUsers, 
  getUserByEmail, 
  getUserById, 
  hashPassword, 
  verifyPassword,
  DEFAULT_SKILLS
} from './server/db.js';
import { User, Skill, Milestone } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory sessions sessionToken -> userId
const SESSIONS = new Map<string, string>();

// Initialize Gemini SDK with User-Agent and key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Seed data function to ensure a gorgeous experience out-of-the-box
async function ensureSeedUser() {
  const users = await getUsers();
  const demoEmail = 'pavithravalli0903@gmail.com';
  const existing = users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());
  
  if (!existing) {
    const { hash, salt } = hashPassword('Password123!');
    const demoUser: User = {
      id: 'demo-user-1',
      email: demoEmail,
      fullName: 'Pavithra Valli',
      passwordHash: hash,
      salt: salt,
      currentRole: 'Frontend Developer',
      targetRole: 'Full Stack AI Architect',
      primaryFocus: 'React, Node.js, and GenAI Integrations',
      skills: DEFAULT_SKILLS('Frontend Developer'),
      createdAt: new Date().toISOString()
    };
    users.push(demoUser);
    await saveUsers(users);
    console.log('Seeded demo user:', demoEmail);
  }
}

// Ensure database is ready and seeded
ensureSeedUser().catch(err => console.error('Seeding error:', err));

// Middleware to authenticate requests via Authorization header
interface AuthenticatedRequest extends Request {
  user?: User;
}

async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }
  const token = authHeader.substring(7);
  const userId = SESSIONS.get(token);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }
  const user = await getUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not found' });
    return;
  }
  req.user = user;
  next();
}

/** 
 * API ROUTES
 */

// Health & Config Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Authentication: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, fullName, password, currentRole, targetRole, primaryFocus } = req.body;
    if (!email || !fullName || !password || !currentRole || !targetRole) {
      res.status(400).json({ error: 'Please provide all required fields' });
      return;
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const { hash, salt } = hashPassword(password);
    const users = await getUsers();
    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email,
      fullName,
      passwordHash: hash,
      salt,
      currentRole,
      targetRole,
      primaryFocus: primaryFocus || '',
      skills: DEFAULT_SKILLS(currentRole),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    const token = 'tok-' + crypto.randomUUID();
    SESSIONS.set(token, newUser.id);

    const { passwordHash, salt: s, ...profile } = newUser;
    res.status(201).json({ user: profile, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error registering user' });
  }
});

// Authentication: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please enter your email and password' });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const matches = verifyPassword(password, user.passwordHash, user.salt);
    if (!matches) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const token = 'tok-' + crypto.randomUUID();
    SESSIONS.set(token, user.id);

    const { passwordHash, salt, ...profile } = user;
    res.json({ user: profile, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error logging in' });
  }
});

// Authentication: Log Out
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    SESSIONS.delete(token);
  }
  res.json({ success: true });
});

// Get Current Logged-In User Details
app.get('/api/auth/me', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash, salt, ...profile } = req.user!;
  res.json({ user: profile });
});

// Get User Skills
app.get('/api/skills', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ skills: req.user!.skills });
});

// Add New Skill
app.post('/api/skills', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, level, description, milestones } = req.body;
    if (!name || !category || !level) {
      res.status(400).json({ error: 'Skill name, category and initial level are required' });
      return;
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === req.user!.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newSkill: Skill = {
      id: 'skl-' + Math.random().toString(36).substring(2, 9),
      name,
      category,
      level,
      progress: 0,
      lastUpdated: new Date().toISOString(),
      description: description || '',
      milestones: (milestones || []).map((m: any, idx: number) => ({
        id: 'mst-' + Math.random().toString(36).substring(2, 9) + '-' + idx,
        title: typeof m === 'string' ? m : m.title,
        completed: false
      }))
    };

    users[userIndex].skills.push(newSkill);
    await saveUsers(users);

    res.status(201).json(newSkill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error inserting skill' });
  }
});

// Update Existing Skill (Progress, Level, milestones)
app.put('/api/skills/:id', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { level, progress, description, name, category } = req.body;

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === req.user!.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const skillIndex = users[userIndex].skills.findIndex(s => s.id === id);
    if (skillIndex === -1) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    const skill = users[userIndex].skills[skillIndex];
    if (level !== undefined) skill.level = level;
    if (progress !== undefined) skill.progress = Math.min(100, Math.max(0, parseInt(progress)));
    if (description !== undefined) skill.description = description;
    if (name !== undefined) skill.name = name;
    if (category !== undefined) skill.category = category;
    skill.lastUpdated = new Date().toISOString();

    await saveUsers(users);
    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating skill' });
  }
});

// Delete Skill
app.delete('/api/skills/:id', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === req.user!.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    users[userIndex].skills = users[userIndex].skills.filter(s => s.id !== id);
    await saveUsers(users);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error deleting skill' });
  }
});

// Toggle Milestone Complete
app.post('/api/skills/:id/milestones/:mid', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, mid } = req.params;
    const { completed } = req.body;

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === req.user!.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const skillIndex = users[userIndex].skills.findIndex(s => s.id === id);
    if (skillIndex === -1) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    const skill = users[userIndex].skills[skillIndex];
    const mIndex = skill.milestones.findIndex(m => m.id === mid);
    if (mIndex === -1) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    skill.milestones[mIndex].completed = completed;
    
    // Auto calculate progress based on percentage of completed milestones
    if (skill.milestones.length > 0) {
      const completedCount = skill.milestones.filter(m => m.completed).length;
      skill.progress = Math.round((completedCount / skill.milestones.length) * 100);
    }
    
    skill.lastUpdated = new Date().toISOString();
    await saveUsers(users);

    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error toggling milestone' });
  }
});

// Add custom Milestone to a skill
app.post('/api/skills/:id/milestones', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Milestone title is required' });
      return;
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === req.user!.id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const skillIndex = users[userIndex].skills.findIndex(s => s.id === id);
    if (skillIndex === -1) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    const skill = users[userIndex].skills[skillIndex];
    const newMilestone: Milestone = {
      id: 'mst-' + Math.random().toString(36).substring(2, 9),
      title,
      completed: false
    };

    skill.milestones.push(newMilestone);
    
    // Update progress percentage
    const completedCount = skill.milestones.filter(m => m.completed).length;
    skill.progress = Math.round((completedCount / skill.milestones.length) * 100);
    skill.lastUpdated = new Date().toISOString();

    await saveUsers(users);
    res.status(201).json(skill);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error adding milestone' });
  }
});

// AI Skill Suggestion Engine using Gemini
app.post('/api/ai/suggestions', authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentRole, targetRole, primaryFocus, currentSkills } = req.body;
    
    if (!currentRole || !targetRole) {
      res.status(400).json({ error: 'Current Role and Target Role are required to generate recommendations.' });
      return;
    }

    if (!apiKey) {
      // Return beautiful fallback suggestions to ensure the application works elegantly even if Gemini API Key is missing.
      console.warn('GEMINI_API_KEY is not configured. Utilizing high-fidelity backup suggestion engine.');
      res.json(getFallbackSuggestions(currentRole, targetRole, primaryFocus, currentSkills || []));
      return;
    }

    const currentSkillsStr = (currentSkills || []).map((s: any) => s.name).join(', ');

    const prompt = `You are an elite corporate AI career coach on Skill Sync AI. 
The user is professional transitioning from a Current Role of "${currentRole}" to a Target Role of "${targetRole}".
Focus keyword/details: "${primaryFocus || 'None specification'}".
The skills they currently possess and have tracked in the system: "${currentSkillsStr || 'No skills added yet'}".

Generate exactly 4 critical skill suggestions that are missing or require deeper focus to bridge the technical/soft gap between standard roles.

Provide your output precisely conforming to the following structured JSON schema:
An array of objects, where each object has:
1. "skillName": short name of the suggested skill.
2. "description": short, clear action-oriented overview.
3. "category": must be exactly one of: "Technical", "Soft Skills", "Business", "Design", or "Other".
4. "estimatedHours": estimated hours needed to master the basics of this skill (integer between 10 and 150).
5. "importanceReason": compelling 1-sentence career advice on why this bridges their specific transition gap.
6. "milestones": an array of 3 actionable, sequential, short checklists to achieve/track this skill.

Avoid proposing skills that are identical to their pre-existing skills (${currentSkillsStr}).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an career mentoring coach on Skill Sync AI that generates actionable, highly relevant corporate and technological skill gap analyses in JSON structure.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING, description: "Small, concise skill title" },
              description: { type: Type.STRING, description: "Concrete description of the skill" },
              category: { 
                type: Type.STRING, 
                description: "The primary skill categories: Technical, Soft Skills, Business, Design, or Other" 
              },
              estimatedHours: { type: Type.INTEGER, description: "Estimated practice time in hours" },
              importanceReason: { type: Type.STRING, description: "Why this bridges the direct gap to their target role" },
              milestones: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 3 specific, short, actionable milestones"
              }
            },
            required: ['skillName', 'description', 'category', 'estimatedHours', 'importanceReason', 'milestones']
          }
        }
      }
    });

    const suggestionsText = response.text || '[]';
    res.json(JSON.parse(suggestionsText.trim()));
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    // Return high fidelity fallback responses in case of rate limits or transient errors
    const transitionRole = req.body.currentRole || 'User Role';
    const transitionTarget = req.body.targetRole || 'Dream Role';
    res.json(getFallbackSuggestions(transitionRole, transitionTarget, req.body.primaryFocus || '', req.body.currentSkills || []));
  }
});

// High-fidelity fallback suggested skills engine
function getFallbackSuggestions(currentRole: string, targetRole: string, primaryFocus: string, currentSkills: any[]): any[] {
  const normalizedTarget = targetRole.toLowerCase();
  const currentNames = currentSkills.map(s => s.name.toLowerCase());

  const pool = [
    {
      skillName: 'Enterprise Cloud Architecture',
      description: 'Design highly available, distributed scalable applications on AWS, GCP and Azure.',
      category: 'Technical',
      estimatedHours: 45,
      importanceReason: 'Transitioning into scalable full-stack development requires cloud operations expertise.',
      milestones: [
        'Deploy simple load-balanced services using containers',
        'Configure secure IAM users/roles and routing gates',
        'Analyze system costs and architectural bottlenecks'
      ]
    },
    {
      skillName: 'AI Integration & Prompt Engineering',
      description: 'Implement Large Language Models (LLMs) like Gemini via SDKs for rich interactive UI layers.',
      category: 'Technical',
      estimatedHours: 30,
      importanceReason: 'Full Stack AI Architects must know standard orchestration patterns and secure keys handlers.',
      milestones: [
        'Connect server-side routes to Gemini API models safely',
        'Apply system directives & JSON output response schemas',
        'Debug streaming and token limits effectively'
      ]
    },
    {
      skillName: 'Technical Writing & Documentation',
      description: 'Express complex system logic clearly via robust Markdown diagrams and RFC schemas.',
      category: 'Soft Skills',
      estimatedHours: 15,
      importanceReason: 'As you scale your career, communicating tech designs clearly is more critical than code itself.',
      milestones: [
        'Write an RFC (Request for Comments) for an API service change',
        'Create interactive sequence diagrams of standard user flows',
        'Publish self-documenting API reference pages'
      ]
    },
    {
      skillName: 'Agile Product Backlog Management',
      description: 'Prioritizing user stories and features using impact mapping and user validation loops.',
      category: 'Business',
      estimatedHours: 25,
      importanceReason: 'Leading technical architectures requires strong alignment with user value and timeline maps.',
      milestones: [
        'Draft a comprehensive User Story Map for a core feature',
        'Prioritize backlog sprint tickets using ICE prioritization matrix',
        'Evaluate feature releases with real behavioral user metrics'
      ]
    }
  ];

  // Return the pool, filtering out already tracked names
  return pool.filter(p => !currentNames.some(cn => cn.includes(p.skillName.toLowerCase())));
}

/**
 * DEVELOPMENT AND PRODUCTION VITE MIDDLEWARE HANDLING
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Skill Sync AI Backend] Service running on http://0.0.0.0:${PORT}`);
    console.log(`[Skill Sync AI Backend] Developer Environment running successfully.`);
  });
}

startServer();
