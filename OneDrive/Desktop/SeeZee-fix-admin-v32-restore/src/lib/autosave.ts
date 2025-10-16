/**
 * LocalStorage autosave helpers for questionnaire
 */

const STORAGE_KEY = 'seezee_questionnaire_draft';

export function loadLocal(): Record<string, any> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function saveLocal(data: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function clearLocal(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

export function mergeLocalWithServer(serverData: Record<string, any>): Record<string, any> {
  const localData = loadLocal();
  if (!localData) return serverData;
  
  // Merge with server data taking precedence for completed steps
  return { ...localData, ...serverData };
}
