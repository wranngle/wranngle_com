import { type User, type InsertUser, type Lead, type InsertLead } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead management
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private userId: number;
  private leadId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.userId = 1;
    this.leadId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, isAdmin: insertUser.isAdmin ?? false };
    this.users.set(id, user);
    return user;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.leadId++;
    const lead: Lead = { 
      ...insertLead, 
      id, 
      status: insertLead.status ?? "pending" 
    };
    this.leads.set(id, lead);

    // Optional: Send to n8n if needed in the future
    // try {
    //   await fetch("https://n8n.wranngle.com/webhook/...", { method: "POST", body: JSON.stringify(lead) });
    // } catch (e) {}

    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }
}

export const storage = new MemStorage();