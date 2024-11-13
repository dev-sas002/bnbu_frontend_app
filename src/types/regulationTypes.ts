// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/types/regulationTypes.ts
export interface Regulation {
  id: number;
  date: string;
  search: string;
  status: 'STR Allowed' | 'STR Not Allowed' | 'STR Allowed with Restrictions';
  gpt_response: any;
  chat_history: ChatMessage[];
}

export interface RegulationCreate {
  search: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
