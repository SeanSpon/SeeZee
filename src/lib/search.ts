/**
 * Command palette search system
 */

export interface SearchCommand {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  action: () => void;
  category?: "navigation" | "action" | "entity";
  icon?: string;
}

/**
 * Fuzzy search implementation
 */
export function fuzzySearch(query: string, text: string): boolean {
  const pattern = query
    .toLowerCase()
    .split("")
    .map((c) => `${c}.*`)
    .join("");
  const regex = new RegExp(pattern);
  return regex.test(text.toLowerCase());
}

/**
 * Score search results
 */
export function scoreMatch(query: string, command: SearchCommand): number {
  const q = query.toLowerCase();
  const label = command.label.toLowerCase();
  const desc = command.description?.toLowerCase() || "";
  const keywords = command.keywords?.join(" ").toLowerCase() || "";

  let score = 0;

  // Exact match = highest score
  if (label === q) score += 100;
  // Starts with query
  else if (label.startsWith(q)) score += 50;
  // Contains query
  else if (label.includes(q)) score += 25;
  // Fuzzy match in label
  else if (fuzzySearch(q, label)) score += 10;

  // Check description
  if (desc.includes(q)) score += 15;
  else if (fuzzySearch(q, desc)) score += 5;

  // Check keywords
  if (keywords.includes(q)) score += 20;
  else if (fuzzySearch(q, keywords)) score += 5;

  return score;
}

/**
 * Filter and sort commands by search query
 */
export function searchCommands(
  query: string,
  commands: SearchCommand[]
): SearchCommand[] {
  if (!query.trim()) return commands;

  const results = commands
    .map((cmd) => ({
      command: cmd,
      score: scoreMatch(query, cmd),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.command);

  return results;
}
