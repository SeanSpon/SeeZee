/**
 * OpenAI Integration
 * Analyzes Git commits and generates suggested change requests
 */

interface GitHubCommit {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
}

interface SuggestedRequest {
  title: string;
  details: string;
}

/**
 * Use OpenAI to analyze recent commits and suggest 1-3 change requests
 */
export async function summarizeCommitsLLM(
  commits: GitHubCommit[]
): Promise<SuggestedRequest[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set, returning empty suggestions");
    return [];
  }

  if (!commits || commits.length === 0) {
    return [];
  }

  // Build a summary of commits
  const commitSummary = commits
    .map(
      (c) =>
        `[${c.commit.author.date.split("T")[0]}] ${c.commit.message.split("\n")[0]}`
    )
    .join("\n");

  const systemPrompt = `You are an AI assistant for a web agency client dashboard. 
Analyze the following Git commits and suggest 1-3 actionable change requests or feature ideas 
that would benefit the client. Keep suggestions concise and business-focused.

Return ONLY a JSON array of objects with this exact structure:
[
  {
    "title": "Brief title (max 60 chars)",
    "details": "2-3 sentence description of the suggested change"
  }
]

Recent commits:
${commitSummary}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "Analyze these commits and suggest change requests.",
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse JSON response
    const suggestions = JSON.parse(content) as SuggestedRequest[];
    return suggestions.slice(0, 3); // Max 3 suggestions
  } catch (error) {
    console.error("Failed to generate AI suggestions:", error);
    return [];
  }
}
