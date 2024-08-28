// src/utils/errorHandling.ts
export const logError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  // In a production environment, you might want to send this to an error tracking service
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};