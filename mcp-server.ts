/**
 * SeeZee MCP (Model Context Protocol) Server
 * Exposes SeeZee platform data & actions to Claude Desktop, Cline, and other MCP clients
 * 
 * Setup:
 * 1. npm install @modelcontextprotocol/sdk
 * 2. Add to claude_desktop_config.json:
 *    "seezee": {
 *      "command": "node",
 *      "args": ["C:\\Users\\Sean\\Desktop\\steezee\\mcp-server.js"],
 *      "env": {
 *        "DATABASE_URL": "postgresql://..."
 *      }
 *    }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new Server(
  {
    name: "seezee-platform",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_projects",
        description: "Get all projects from SeeZee CRM",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["ACTIVE", "COMPLETED", "ON_HOLD"],
              description: "Filter by project status",
            },
          },
        },
      },
      {
        name: "list_leads",
        description: "Get leads/prospects from marketing system",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Max results (default 50)",
            },
          },
        },
      },
      {
        name: "create_workflow_node",
        description: "Create a new WorkflowNode for distributed processing",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["GIT_AGENT", "AI_AGENT", "BUILD_RUNNER"] },
            capabilities: {
              type: "object",
              properties: {
                git: { type: "boolean" },
                build: { type: "boolean" },
                ai: { type: "boolean" },
              },
            },
          },
          required: ["name", "type"],
        },
      },
      {
        name: "query_analytics",
        description: "Run analytics queries on SeeZee data",
        inputSchema: {
          type: "object",
          properties: {
            metric: {
              type: "string",
              enum: ["revenue", "active_projects", "lead_conversion"],
            },
            timeframe: {
              type: "string",
              enum: ["7d", "30d", "90d"],
            },
          },
          required: ["metric"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_projects": {
        const projects = await prisma.project.findMany({
          where: args?.status ? { status: args.status } : undefined,
          include: {
            client: { select: { name: true, email: true } },
            organization: { select: { name: true } },
          },
          take: 50,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      }

      case "list_leads": {
        const leads = await prisma.lead.findMany({
          take: args?.limit || 50,
          orderBy: { createdAt: "desc" },
          include: {
            project: { select: { name: true, status: true } },
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(leads, null, 2),
            },
          ],
        };
      }

      case "create_workflow_node": {
        const bcrypt = require("bcryptjs");
        const crypto = require("crypto");

        const secret = crypto.randomBytes(32).toString("hex");
        const apiKeyId = `node_${crypto.randomBytes(16).toString("hex")}`;
        const apiKeyHash = await bcrypt.hash(secret, 10);

        const node = await prisma.workflowNode.create({
          data: {
            name: args.name,
            type: args.type,
            apiKeyId,
            apiKeyHash,
            capabilities: args.capabilities || { git: false, build: false },
            status: "OFFLINE",
          },
        });

        return {
          content: [
            {
              type: "text",
              text: `Node created successfully!\n\nNode ID: ${node.id}\nAPI Key: ${apiKeyId}.${secret}\n\nCopy this API key - it won't be shown again!`,
            },
          ],
        };
      }

      case "query_analytics": {
        let result;
        
        if (args.metric === "active_projects") {
          const count = await prisma.project.count({
            where: { status: "ACTIVE" },
          });
          result = { activeProjects: count };
        } else if (args.metric === "revenue") {
          const invoices = await prisma.invoice.aggregate({
            _sum: { total: true },
            where: {
              paidAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          });
          result = { revenue30d: invoices._sum.total };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SeeZee MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
