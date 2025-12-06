import React, { createContext, useContext, useState, useCallback } from "react";

interface ConversationContextType {
  projectId: number | null;
  setProjectId: (id: number | null) => void;
  resetConversation: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

const STORAGE_KEY = "requirement_bot_project_id";

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectIdState] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const setProjectId = useCallback((id: number | null) => {
    setProjectIdState(id);
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, String(id));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save projectId to localStorage:", error);
    }
  }, []);

  const resetConversation = useCallback(() => {
    setProjectIdState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        projectId,
        setProjectId,
        resetConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
}
