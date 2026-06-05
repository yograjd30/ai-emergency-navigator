export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface EmergencySession {
  _id: string;
  userId?: string;
  sessionToken: string;
  category: string;
  severity: string;
  userMessage: string;
  language: string;
  triageResult: {
    category: string;
    severity: string;
    confidence: number;
    suggestedActions: string[];
    matchedHelplines: import('./helpline').Helpline[];
  };
  conversation: ConversationMessage[];
  location?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  resolved: boolean;
  bookmarked: boolean;
  createdAt: string;
}

export interface SessionsResponse {
  sessions: EmergencySession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
