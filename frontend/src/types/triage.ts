export interface TriageResult {
  category: string;
  severity: 'critical' | 'urgent' | 'standard' | 'info';
  confidence: number;
  suggestedActions: string[];
  reasoning?: string;
}

export interface TriageResponse {
  sessionId: string;
  sessionToken: string;
  triageResult: TriageResult;
  helplines: import('./helpline').Helpline[];
  immediateActions: string[];
}

export interface FollowUpResponse {
  response: string;
  sessionId: string;
  conversationLength: number;
}
