export interface ChatContext {
  mentorId?: string;
  sessionId?: string;
  planId?: string;
}

/**
 * Extrai contexto da rota atual (mentorId, sessionId, planId) da URL
 * para ser usado no userCtx das requisições de chat
 */
export function getChatContextFromRoute(): ChatContext {
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  const context: ChatContext = {};
  
  // Extrai mentorId de /agendar/:id ou /mentor/:id
  const mentorMatch = pathname.match(/\/(?:agendar|mentor)\/([^/]+)/);
  if (mentorMatch) {
    context.mentorId = mentorMatch[1];
  }
  
  // Extrai sessionId de /sessao/:id
  const sessionMatch = pathname.match(/\/sessao\/([^/]+)/);
  if (sessionMatch) {
    context.sessionId = sessionMatch[1];
  }
  
  // Extrai planId de query params (se disponível)
  const planId = searchParams.get('planId');
  if (planId) {
    context.planId = planId;
  }
  
  return context;
}
