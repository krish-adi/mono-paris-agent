import { ChatSession, Message } from "./types";

// In-memory storage (replace with your database in production)
const sessions = new Map<string, ChatSession>();

export const storage = {
  getSession: (id: string): ChatSession | undefined => {
    return sessions.get(id);
  },

  createSession: (id: string): ChatSession => {
    const session: ChatSession = {
      id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    sessions.set(id, session);
    return session;
  },

  updateSession: (id: string, messages: Message[]): ChatSession => {
    const session = sessions.get(id);
    if (!session) throw new Error("Session not found");

    session.messages = messages;
    session.updatedAt = new Date();
    sessions.set(id, session);
    return session;
  },
};
