import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { User, Skill } from '../src/types.js'; // Use .js extension or rely on compilation. We can use clean Ts imports!

const isProduction = process.env.NODE_ENV === 'production';
const DB_DIR = isProduction ? '/tmp' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Helper to hash passwords securely using PBKDF2
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Read current database of users
export async function getUsers(): Promise<User[]> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    // If file doesn't exist, return empty array and seeds.
    return [];
  }
}

// Save database of users
export async function saveUsers(users: User[]): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

// Initial skills to populate for test developers or new registration examples
export const DEFAULT_SKILLS = (role: string): Skill[] => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('developer') || roleLower.includes('engineer') || roleLower.includes('tech')) {
    return [
      {
        id: 'tech-1',
        name: 'TypeScript & Modern ES6',
        category: 'Technical',
        level: 'Intermediate',
        progress: 60,
        lastUpdated: new Date().toISOString(),
        description: 'Advanced types, generics, and core JavaScript concepts.',
        milestones: [
          { id: 'm1', title: 'Learn Type Assertions & Guards', completed: true },
          { id: 'm2', title: 'Understand Promise/Async Flow', completed: true },
          { id: 'm3', title: 'Implement Decorators & Advanced Generics', completed: false },
        ]
      },
      {
        id: 'tech-2',
        name: 'Technical Architecture & API Design',
        category: 'Technical',
        level: 'Beginner',
        progress: 30,
        lastUpdated: new Date().toISOString(),
        description: 'RESTful API practices, database queries, and modular services design.',
        milestones: [
          { id: 'm4', title: 'Build Express routes & Error Handling', completed: true },
          { id: 'm5', title: 'Integrate relational or document schemas', completed: false },
          { id: 'm6', title: 'Implement JWT session security and CORS', completed: false },
        ]
      },
      {
        id: 'soft-1',
        name: 'Effective Team Collaboration',
        category: 'Soft Skills',
        level: 'Advanced',
        progress: 80,
        lastUpdated: new Date().toISOString(),
        description: 'Active listening, agile standups participation, and constructive feedback.',
        milestones: [
          { id: 'm7', title: 'Conduct structured peer code reviews', completed: true },
          { id: 'm8', title: 'Present standard design documentation to team', completed: true },
          { id: 'm9', title: 'Mentor junior engineers or peers on key stack', completed: false },
        ]
      }
    ];
  } else if (roleLower.includes('product') || roleLower.includes('manager') || roleLower.includes('business')) {
    return [
      {
        id: 'biz-1',
        name: 'Product Strategy & Roadmap Planning',
        category: 'Business',
        level: 'Intermediate',
        progress: 55,
        lastUpdated: new Date().toISOString(),
        description: 'Defining key outcomes, customer research, and managing feature backlog.',
        milestones: [
          { id: 'm1', title: 'Conduct competitor business analysis', completed: true },
          { id: 'm2', title: 'Build interactive quarterly roadmaps', completed: false },
          { id: 'm3', title: 'Define quantitative SLA/KPI matrices', completed: false },
        ]
      },
      {
        id: 'soft-2',
        name: 'Public Presentation & Pitching',
        category: 'Soft Skills',
        level: 'Intermediate',
        progress: 50,
        lastUpdated: new Date().toISOString(),
        description: 'Crafting persuasive decks, managing audience feedback, and clear articulation.',
        milestones: [
          { id: 'm4', title: 'Present features to stakeholders', completed: true },
          { id: 'm5', title: 'Record a product launch video demo', completed: false },
        ]
      }
    ];
  } else {
    // Default generic starting skills
    return [
      {
        id: 'gen-1',
        name: 'Modern Web Navigation',
        category: 'Technical',
        level: 'Intermediate',
        progress: 70,
        lastUpdated: new Date().toISOString(),
        description: 'Utilize search engines and directories to locate accurate data rapidly.',
        milestones: [
          { id: 'm1', title: 'Setup local workspace configurations', completed: true },
          { id: 'm2', title: 'Understand browser security settings', completed: false },
        ]
      },
      {
        id: 'soft-3',
        name: 'Structured Problem Solving',
        category: 'Soft Skills',
        level: 'Beginner',
        progress: 40,
        lastUpdated: new Date().toISOString(),
        description: 'Analyzing complex requirements by breaking them down into manageable phases.',
        milestones: [
          { id: 'm3', title: 'Outline core goals & obstacles', completed: true },
          { id: 'm4', title: 'Execute incremental resolution plans', completed: false },
        ]
      }
    ];
  }
};
