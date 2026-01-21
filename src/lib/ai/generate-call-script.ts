/**
 * AI Cold Call Script Generator
 * Uses Claude 3.5 Sonnet to generate personalized cold call scripts
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ProspectInfo {
  name: string;
  company: string;
  category?: string;
  city?: string;
  state?: string;
  websiteUrl?: string;
  hasWebsite: boolean;
  leadScore: number;
  googleRating?: number;
  googleReviews?: number;
  opportunities?: string[];
  redFlags?: string[];
}

export async function generateCallScript(
  prospect: ProspectInfo
): Promise<{ script: string; error?: string }> {
  try {
    const prompt = buildPrompt(prospect);

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return {
      script: content.text,
    };
  } catch (error: any) {
    console.error("Error generating call script:", error);
    return {
      script: "",
      error: error.message || "Failed to generate call script",
    };
  }
}

function buildPrompt(prospect: ProspectInfo): string {
  const {
    name,
    company,
    category,
    city,
    state,
    websiteUrl,
    hasWebsite,
    leadScore,
    googleRating,
    googleReviews,
    opportunities,
    redFlags,
  } = prospect;

  let prompt = `Generate a professional, warm cold call script for reaching out to a prospect.

PROSPECT INFORMATION:
- Organization: ${company}
- Contact Name: ${name}
- Industry: ${category || "Unknown"}
- Location: ${city && state ? `${city}, ${state}` : "Unknown"}
- Website: ${websiteUrl || "None"}
- Has Website: ${hasWebsite ? "Yes" : "No"}
- Lead Score: ${leadScore}/100 (${leadScore >= 80 ? "Hot lead" : leadScore >= 60 ? "Warm lead" : "Cold lead"})
`;

  if (googleRating && googleReviews) {
    prompt += `- Google Rating: ${googleRating} stars (${googleReviews} reviews)\n`;
  }

  if (opportunities && opportunities.length > 0) {
    prompt += `\nOPPORTUNITIES IDENTIFIED:\n${opportunities.map((o) => `- ${o}`).join("\n")}\n`;
  }

  if (redFlags && redFlags.length > 0) {
    prompt += `\nPOTENTIAL CONCERNS:\n${redFlags.map((r) => `- ${r}`).join("\n")}\n`;
  }

  prompt += `

ABOUT SEEZEE STUDIO:
- We're a student-run web development studio at Trinity High School in Louisville, KY
- We specialize in building professional, affordable websites for nonprofits and small businesses
- Our mission is to help organizations establish a strong online presence while training the next generation of developers
- We offer full-stack web development, hosting, maintenance, and ongoing support
- Pricing is significantly more affordable than traditional agencies (30-50% less)
- We focus on modern, mobile-responsive, accessible websites

SCRIPT REQUIREMENTS:
1. Start with a warm, professional introduction
2. Acknowledge their organization specifically (use their name, location, or category)
3. Identify 1-2 specific pain points based on the opportunities listed above
4. Present SeeZee's services as a solution without being pushy
5. Include objection handling for common concerns:
   - "We already have a website" → Offer free audit, talk about improvements
   - "We don't have budget" → Mention affordability, flexible payment options
   - "We're too busy" → Emphasize that we handle everything, minimal time commitment
   - "Why students?" → Explain mentorship model, professional results, affordable pricing
6. End with a clear, soft call-to-action (schedule a brief call, send more info, etc.)
7. Keep the script natural and conversational (2-3 minutes max)
8. Use "I" statements and be authentic
9. Show genuine interest in helping their mission

FORMAT:
Provide the script in clear sections:
- Opening
- Pain Point Discussion
- Value Proposition
- Objection Handling
- Call-to-Action
- Closing

Make it sound natural and warm, not scripted or salesy. The goal is to start a conversation, not close a deal immediately.`;

  return prompt;
}

/**
 * Generate multiple script variations
 */
export async function generateScriptVariations(
  prospect: ProspectInfo,
  count: number = 3
): Promise<{ scripts: string[]; error?: string }> {
  try {
    const scripts: string[] = [];

    for (let i = 0; i < count; i++) {
      const result = await generateCallScript(prospect);
      if (result.error) {
        throw new Error(result.error);
      }
      scripts.push(result.script);
    }

    return { scripts };
  } catch (error: any) {
    console.error("Error generating script variations:", error);
    return {
      scripts: [],
      error: error.message || "Failed to generate script variations",
    };
  }
}
