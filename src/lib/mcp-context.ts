/**
 * MCP Context Loader
 *
 * Fetches company context data from the SeeZee Studios MCP GitHub repo
 * and builds a system prompt for the AI chatbot. Results are cached in
 * memory for 1 hour to avoid fetching on every chat message.
 */

const MCP_BASE_URL =
  "https://raw.githubusercontent.com/SeanSpon/seezeestudios-mcp/main/data";

const DATA_FILES = [
  "identity.json",
  "services.json",
  "tone.json",
  "rules.json",
] as const;

interface MCPIdentity {
  company: string;
  positioning: string;
  tagline: string;
  mission: string;
  description: string;
  founded: string;
  team: Array<{ name: string; role: string; focus: string; background: string }>;
  differentiators: string[];
  notWhoWeAre: string[];
  whoWeAre: string[];
}

interface MCPService {
  id: string;
  name: string;
  priority: string;
  order: number;
  description: string;
  details: string[];
  differentiator: string;
  techStack?: string[];
  // Pricing varies per service type — use any for flexibility
  projectTypes?: Record<string, { name: string; description: string; priceRange: string; timeline: string }>;
  pricingApproach?: string;
  minimums?: Record<string, string>;
  rushDelivery?: string;
  plans?: Record<string, { name: string; price: string; includes: string[] }>;
  hourPacks?: { packs: Array<{ name: string; hours: number; price: string; perHour: string }> };
  onDemandRate?: string;
  aiPricing?: Record<string, { name: string; price: string; includes: string[] }>;
  [key: string]: any;
}

interface MCPServices {
  overview: string;
  services: MCPService[];
  audiences: Array<{ id: string; name: string; description: string }>;
  paymentInfo?: Record<string, any>;
  timeline?: Record<string, any>;
}

interface MCPTone {
  overview: string;
  voice: { primary: string[]; secondary: string[] };
  coreMessage: string;
  preferredLanguage: { use: Array<{ instead_of: string; use: string }> };
  avoid: { words: string[]; patterns: string[] };
  guidelines: string[];
}

interface MCPRules {
  overview: string;
  positioning: { must: string[]; mustNot: string[] };
  services: { priority: string; ai_positioning: string; pricing_framing: string };
  agentBehavior: { mode: string; description: string; rules: string[] };
  absoluteConstraints: string[];
}

interface MCPData {
  identity: MCPIdentity;
  services: MCPServices;
  tone: MCPTone;
  rules: MCPRules;
}

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------
let cachedPrompt: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
async function fetchJSON<T>(filename: string): Promise<T> {
  const res = await fetch(`${MCP_BASE_URL}/${filename}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${filename}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function fetchAllMCPData(): Promise<MCPData> {
  const [identity, services, tone, rules] = await Promise.all([
    fetchJSON<MCPIdentity>("identity.json"),
    fetchJSON<MCPServices>("services.json"),
    fetchJSON<MCPTone>("tone.json"),
    fetchJSON<MCPRules>("rules.json"),
  ]);
  return { identity, services, tone, rules };
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
function buildPromptFromData(data: MCPData): string {
  const { identity, services, tone, rules } = data;

  // Team summary
  const teamLines = identity.team
    .map((t) => `- ${t.name} (${t.role}): ${t.focus}`)
    .join("\n");

  // Services summary -- ordered by priority
  const serviceLines = services.services
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      let line = `- **${s.name}** (${s.priority}): ${s.description}`;
      // Extract pricing from the actual nested structure
      const pricingParts: string[] = [];
      if (s.projectTypes) {
        Object.values(s.projectTypes).forEach((pt) => {
          if (pt.name && pt.priceRange) pricingParts.push(`${pt.name}: ${pt.priceRange}`);
        });
      }
      if (s.pricingApproach) pricingParts.push(s.pricingApproach);
      if (s.plans) {
        Object.values(s.plans).forEach((plan) => {
          if (plan.name && plan.price) pricingParts.push(`${plan.name}: ${plan.price}`);
        });
      }
      if (s.hourPacks?.packs) {
        s.hourPacks.packs.forEach((pack) => {
          pricingParts.push(`${pack.name}: ${pack.price} (${pack.hours}hrs)`);
        });
      }
      if (s.onDemandRate) pricingParts.push(`On-demand: ${s.onDemandRate}`);
      if (s.aiPricing) {
        Object.values(s.aiPricing).forEach((tier) => {
          if (tier.name && tier.price) pricingParts.push(`${tier.name}: ${tier.price}`);
        });
      }
      if (pricingParts.length > 0) {
        line += `\n  Pricing: ${pricingParts.join("; ")}`;
      }
      return line;
    })
    .join("\n");

  // Audiences
  const audienceLines = services.audiences
    .map((a) => `- ${a.name}: ${a.description}`)
    .join("\n");

  // Tone guidelines
  const voiceWords = [...tone.voice.primary, ...tone.voice.secondary].join(", ");
  const avoidWords = tone.avoid.words.join(", ");
  const toneGuidelines = tone.guidelines.map((g) => `- ${g}`).join("\n");
  const preferredLang = tone.preferredLanguage.use
    .map((p) => `Say "${p.use}" instead of "${p.instead_of}"`)
    .join("; ");

  // Rules -- absolute constraints
  const constraints = rules.absoluteConstraints.map((c) => `- ${c}`).join("\n");
  const positioningMust = rules.positioning.must.map((m) => `- ${m}`).join("\n");
  const positioningMustNot = rules.positioning.mustNot
    .map((m) => `- ${m}`)
    .join("\n");

  return `You are the AI assistant for ${identity.company} — "${identity.tagline}"

ROLE: You represent SeeZee Studios on our website. Help visitors understand our services, answer questions, and guide them toward scheduling a consultation or starting a project.

COMPANY IDENTITY:
${identity.description}
Positioning: ${identity.positioning}
Mission: ${identity.mission}
Founded: ${identity.founded}

TEAM:
${teamLines}

WHAT MAKES US DIFFERENT:
${identity.differentiators.map((d) => `- ${d}`).join("\n")}

WHO WE ARE: ${identity.whoWeAre.join(", ")}
WHO WE ARE NOT: ${identity.notWhoWeAre.join(", ")}

SERVICES (in priority order):
${serviceLines}

TARGET AUDIENCES:
${audienceLines}

SERVICE PRIORITY: ${rules.services.priority}
AI POSITIONING: ${rules.services.ai_positioning}
PRICING APPROACH: ${rules.services.pricing_framing}

VOICE & TONE:
Be: ${voiceWords}
Core message: "${tone.coreMessage}"
Guidelines:
${toneGuidelines}
Language preferences: ${preferredLang}

NEVER USE THESE WORDS: ${avoidWords}

POSITIONING RULES (MUST):
${positioningMust}

POSITIONING RULES (MUST NOT):
${positioningMustNot}

ABSOLUTE CONSTRAINTS:
${constraints}

RESPONSE GUIDELINES:
- Be concise and helpful. Keep responses under 150 words when possible.
- Use markdown formatting for lists and emphasis.
- When discussing services, lead with web development and systems first, ongoing partnership second, consulting third.
- If the visitor seems interested, guide them to /contact or /start.
- If asked about pricing, be transparent but note that exact pricing depends on scope.
- Never invent information not covered here. If unsure, suggest they reach out directly.
- Contact: sean@seezeestudios.com or visit /contact on the website.`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns a comprehensive system prompt built from the SeeZee MCP data files.
 * Results are cached in memory for 1 hour. Falls back to a minimal prompt if
 * the fetch fails.
 */
export async function getMCPSystemPrompt(): Promise<string> {
  const now = Date.now();

  if (cachedPrompt && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedPrompt;
  }

  try {
    const data = await fetchAllMCPData();
    cachedPrompt = buildPromptFromData(data);
    cacheTimestamp = now;
    return cachedPrompt;
  } catch (error) {
    console.error("Failed to fetch MCP data, using fallback prompt:", error);

    // If we have a stale cache, prefer it over the hardcoded fallback
    if (cachedPrompt) {
      return cachedPrompt;
    }

    // Minimal fallback so the chatbot still works
    return `You are a friendly AI assistant for SeeZee Studios, a community technology partner specializing in technical support, consulting, and web systems for schools, nonprofits, and community organizations.

Company info:
- Name: SeeZee Studios
- Team: Sean (Technical Lead) and Zach (Consulting Lead)
- Core services: Live Technical Support, Technology Consulting, Web & Software Systems, Automation & AI
- Focus: Schools, nonprofits, and community organizations
- Contact: sean@seezeestudios.com

Be helpful, concise, and guide users toward scheduling a consultation or starting a project.`;
  }
}
