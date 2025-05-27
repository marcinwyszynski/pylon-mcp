#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PylonClient } from './pylon-client.js';

const PYLON_API_TOKEN = process.env.PYLON_API_TOKEN;

// Initialize client only when token is available
let pylonClient: PylonClient | null = null;

if (PYLON_API_TOKEN) {
  pylonClient = new PylonClient({
    apiToken: PYLON_API_TOKEN,
  });
}

const server = new Server(
  {
    name: 'pylon-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: 'pylon_get_me',
    description: 'Get current user information from Pylon. Returns your user profile including name, email, role, and permissions. Use this to verify your authentication and see what access level you have.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_contacts',
    description: 'Get customer contacts from Pylon. Use this to find customers who have submitted support tickets or inquiries. Returns contact details like name, email, company, and contact history.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search contacts by name, email, or company. Examples: "john@example.com", "Acme Corp", "John Smith"' },
        limit: { type: 'number', description: 'Maximum number of contacts to return (1-100). Default is 20. Example: 50' },
      },
    },
  },
  {
    name: 'pylon_create_contact',
    description: 'Create a new customer contact in Pylon. Use this when adding a new customer who will submit support requests or access your customer portal.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Contact email address. Must be valid email format. Example: "sarah@company.com"' },
        name: { type: 'string', description: 'Full name of the contact. Example: "Sarah Johnson"' },
        portal_role: { type: 'string', description: 'Role in customer portal: "admin", "member", "viewer". Determines access level. Example: "member"' },
      },
      required: ['email', 'name'],
    },
  },
  {
    name: 'pylon_get_issues',
    description: 'Get support issues/tickets from Pylon. Returns a list of customer support requests with details like title, status, priority, and assigned team member. Use this to see your workload or find specific issues.',
    inputSchema: {
      type: 'object',
      properties: {
        assignee: { type: 'string', description: 'Filter by assigned team member. Use email or user ID. Examples: "john@support.com", "user_123"' },
        status: { type: 'string', description: 'Filter by issue status. Options: "open", "in_progress", "pending", "resolved", "closed". Example: "open"' },
        limit: { type: 'number', description: 'Maximum number of issues to return (1-100). Default is 50. Example: 25' },
      },
    },
  },
  {
    name: 'pylon_create_issue',
    description: 'Create a new support issue/ticket in Pylon. Use this to log customer problems, bug reports, or feature requests that need to be tracked and resolved.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Brief title describing the issue. Examples: "Login page not loading", "Cannot upload files", "Billing question"' },
        description: { type: 'string', description: 'Detailed description of the issue, including steps to reproduce and impact. Example: "User reports that clicking login button shows error message. Affects all Chrome users on Windows."' },
        status: { type: 'string', description: 'Initial status: "open", "in_progress", "pending", "resolved", "closed". Usually "open" for new issues. Example: "open"' },
        priority: { type: 'string', description: 'Priority level: "low", "medium", "high", "urgent". Example: "high"' },
        assignee: { type: 'string', description: 'Team member to assign (optional). Use email or user ID. Example: "support@company.com"' },
      },
      required: ['title', 'description', 'status', 'priority'],
    },
  },
  {
    name: 'pylon_get_knowledge_bases',
    description: 'Get all knowledge bases from Pylon. Knowledge bases contain help articles, FAQs, and documentation that customers can access. Returns list of available knowledge bases with their names and article counts.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_knowledge_base_articles',
    description: 'Get help articles from a specific knowledge base. Use this to find existing documentation that might help resolve customer issues or to see what self-service content is available.',
    inputSchema: {
      type: 'object',
      properties: {
        knowledge_base_id: { type: 'string', description: 'ID of the knowledge base to get articles from. Get this from pylon_get_knowledge_bases first. Example: "kb_123abc"' },
      },
      required: ['knowledge_base_id'],
    },
  },
  {
    name: 'pylon_create_knowledge_base_article',
    description: 'Create a new help article in a knowledge base. Use this to add new documentation, FAQs, or troubleshooting guides that customers can access for self-service support.',
    inputSchema: {
      type: 'object',
      properties: {
        knowledge_base_id: { type: 'string', description: 'ID of the knowledge base to add article to. Example: "kb_123abc"' },
        title: { type: 'string', description: 'Article title that clearly describes the topic. Examples: "How to Reset Your Password", "Troubleshooting Login Issues", "Billing FAQ"' },
        content: { type: 'string', description: 'Full article content in markdown or HTML format. Include step-by-step instructions, screenshots, and links. Example: "## Steps to Reset Password\n1. Go to login page\n2. Click Forgot Password..."' },
      },
      required: ['knowledge_base_id', 'title', 'content'],
    },
  },
  {
    name: 'pylon_get_teams',
    description: 'Get all support teams from Pylon. Teams are groups of support agents that handle different types of issues (e.g., Technical, Billing, Sales). Returns team names, member counts, and specializations.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_team',
    description: 'Get detailed information about a specific support team. Returns team members, their roles, current workload, and team performance metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        team_id: { type: 'string', description: 'ID of the team to get details for. Get this from pylon_get_teams first. Example: "team_456def"' },
      },
      required: ['team_id'],
    },
  },
  {
    name: 'pylon_create_team',
    description: 'Create a new support team in Pylon. Use this to organize support agents into specialized groups for handling different types of customer issues (e.g., Technical Support, Billing, Enterprise accounts).',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Team name that describes their specialization. Examples: "Technical Support", "Billing Team", "Enterprise Support", "Level 2 Support"' },
        description: { type: 'string', description: 'Description of team responsibilities and expertise. Example: "Handles complex technical issues, API questions, and integration support"' },
        members: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs or emails of team members. Example: ["john@company.com", "user_123", "sarah@company.com"]' },
      },
      required: ['name'],
    },
  },
  {
    name: 'pylon_get_accounts',
    description: 'Get all customer accounts from Pylon. Accounts represent companies or organizations that use your service. Returns account details like company name, subscription level, and contact information.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_account',
    description: 'Get detailed information about a specific customer account. Returns company details, subscription info, billing status, and associated contacts and issues.',
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'ID of the account to get details for. Get this from pylon_get_accounts or customer records. Example: "acc_789xyz"' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'pylon_search_users',
    description: 'Search for team members and support agents in Pylon. Use this to find colleagues by name, email, or department when assigning issues or checking availability.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term to find users by name, email, or department. Examples: "john", "support@company.com", "technical team"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'pylon_get_users',
    description: 'Get all team members and support agents in your Pylon workspace. Returns user profiles including names, roles, teams, and availability status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_search_contacts',
    description: 'Search for customer contacts in Pylon by name, email, company, or other details. Use this to quickly find a specific customer when you need to view their information or create an issue for them.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term to find contacts. Can search by name, email, company, or phone. Examples: "alice@example.com", "Acme Corporation", "John Smith", "+1-555-0123"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'pylon_search_issues',
    description: 'Search for support issues/tickets in Pylon by keywords, customer name, or issue content. Use this to find related issues, check for duplicates, or research similar problems.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term to find issues. Can search in titles, descriptions, and customer names. Examples: "login error", "billing question", "API timeout", "John Smith"' },
        filters: { type: 'object', description: 'Additional filters as key-value pairs. Examples: {"status": "open", "priority": "high"}, {"assignee": "john@company.com", "created_after": "2024-01-01"}' },
      },
      required: ['query'],
    },
  },
  {
    name: 'pylon_get_issue',
    description: 'Get complete details of a specific support issue/ticket. Returns full issue information including title, description, status, priority, assignee, customer info, and conversation history.',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'ID of the issue to retrieve. Get this from pylon_get_issues or pylon_search_issues. Example: "issue_abc123"' },
      },
      required: ['issue_id'],
    },
  },
  {
    name: 'pylon_update_issue',
    description: 'Update an existing support issue/ticket. Use this to change status (e.g., mark as resolved), reassign to different team members, update priority, or modify details as you work on the issue.',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'ID of the issue to update. Example: "issue_abc123"' },
        title: { type: 'string', description: 'New title for the issue. Example: "RESOLVED: Login page not loading"' },
        description: { type: 'string', description: 'Updated description with new information or resolution details. Example: "Fixed CSS conflict causing login button to not render properly."' },
        status: { type: 'string', description: 'New status: "open", "in_progress", "pending", "resolved", "closed". Example: "resolved"' },
        priority: { type: 'string', description: 'New priority level: "low", "medium", "high", "urgent". Example: "medium"' },
        assignee: { type: 'string', description: 'New assignee email or user ID. Example: "tech-lead@company.com"' },
      },
      required: ['issue_id'],
    },
  },
  {
    name: 'pylon_snooze_issue',
    description: 'Temporarily hide an issue until a future date/time. Use this for issues that cannot be worked on now but need follow-up later (e.g., waiting for customer response, scheduled maintenance, feature release).',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'ID of the issue to snooze. Example: "issue_abc123"' },
        until: { type: 'string', description: 'Date and time when issue should reappear (ISO 8601 format). Examples: "2024-01-15T09:00:00Z" (specific date/time), "2024-01-20T00:00:00Z" (beginning of day)' },
      },
      required: ['issue_id', 'until'],
    },
  },
  {
    name: 'pylon_get_issue_messages',
    description: 'Get the conversation history for a specific support issue. Returns all messages between customer and support team, including timestamps and sender information. Use this to understand the context and progress of an issue.',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'ID of the issue to get messages for. Example: "issue_abc123"' },
      },
      required: ['issue_id'],
    },
  },
  {
    name: 'pylon_create_issue_message',
    description: 'Add a new message/reply to a support issue conversation. Use this to respond to customers, add internal notes, or provide updates on issue progress.',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'ID of the issue to add message to. Example: "issue_abc123"' },
        content: { type: 'string', description: 'Message text to send. Can include formatting and links. Examples: "Hi John, I\'ve escalated this to our dev team. You should see a fix by tomorrow.", "**Internal note:** This appears to be related to the server migration last week."' },
      },
      required: ['issue_id', 'content'],
    },
  },
  {
    name: 'pylon_get_tags',
    description: 'Get all available tags for categorizing issues and contacts. Tags help organize and filter support tickets by topic, urgency, or type (e.g., "bug", "feature-request", "billing", "urgent").',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_create_tag',
    description: 'Create a new tag for categorizing issues and contacts. Use this to add new categories that help organize and filter your support tickets effectively.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tag name that describes the category. Examples: "billing-question", "feature-request", "bug-report", "urgent", "enterprise-customer"' },
        color: { type: 'string', description: 'Color for the tag in hex format or color name. Examples: "#FF0000", "red", "#00AA00", "blue"' },
      },
      required: ['name'],
    },
  },
  {
    name: 'pylon_get_ticket_forms',
    description: 'Get all ticket submission forms available to customers. Forms define what information customers provide when creating new support requests (e.g., bug report form, billing inquiry form).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_create_ticket_form',
    description: 'Create a new ticket submission form for customers. Use this to customize what information customers provide when creating different types of support requests (bug reports, feature requests, billing questions).',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Form name that describes its purpose. Examples: "Bug Report Form", "Billing Inquiry", "Feature Request", "Technical Support"' },
        description: { type: 'string', description: 'Description shown to customers explaining when to use this form. Example: "Use this form to report bugs or technical issues with our software."' },
        fields: { type: 'array', description: 'Array of form field objects defining what information to collect. Example: [{"type": "text", "name": "summary", "required": true}, {"type": "textarea", "name": "steps_to_reproduce"}, {"type": "select", "name": "browser", "options": ["Chrome", "Firefox", "Safari"]}]' },
      },
      required: ['name', 'fields'],
    },
  },
  {
    name: 'pylon_get_webhooks',
    description: 'Get all configured webhooks in Pylon. Webhooks automatically send notifications to external systems when events occur (e.g., new issues created, status changes, messages added).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_create_webhook',
    description: 'Create a new webhook to automatically notify external systems when events occur in Pylon. Use this to integrate with Slack, Discord, email systems, or custom applications.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'HTTPS URL where webhook payloads will be sent. Must be publicly accessible. Examples: "https://hooks.slack.com/services/...", "https://api.myapp.com/webhooks/pylon"' },
        events: { type: 'array', items: { type: 'string' }, description: 'Array of events to trigger webhook. Examples: ["issue.created", "issue.updated", "issue.resolved"], ["message.created"], ["contact.created", "team.assigned"]' },
        active: { type: 'boolean', description: 'Whether webhook should start active immediately. Default is true. Example: true' },
      },
      required: ['url', 'events'],
    },
  },
  {
    name: 'pylon_delete_webhook',
    description: 'Delete an existing webhook to stop sending notifications to an external system. Use this when removing integrations or cleaning up unused webhooks.',
    inputSchema: {
      type: 'object',
      properties: {
        webhook_id: { type: 'string', description: 'ID of the webhook to delete. Get this from pylon_get_webhooks. Example: "webhook_xyz789"' },
      },
      required: ['webhook_id'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!pylonClient) {
    throw new Error('PYLON_API_TOKEN environment variable is required');
  }

  try {
    switch (name) {
      case 'pylon_get_me': {
        const user = await pylonClient.getMe();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(user, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_contacts': {
        const contacts = await pylonClient.getContacts(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contacts, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_contact': {
        if (!args) throw new Error('Arguments required for creating contact');
        const contact = await pylonClient.createContact(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contact, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_issues': {
        const issues = await pylonClient.getIssues(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issues, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_issue': {
        if (!args) throw new Error('Arguments required for creating issue');
        const issue = await pylonClient.createIssue(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_knowledge_bases': {
        const knowledgeBases = await pylonClient.getKnowledgeBases();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(knowledgeBases, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_knowledge_base_articles': {
        if (!args || !('knowledge_base_id' in args)) {
          throw new Error('knowledge_base_id is required');
        }
        const articles = await pylonClient.getKnowledgeBaseArticles(args.knowledge_base_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(articles, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_knowledge_base_article': {
        if (!args || !('knowledge_base_id' in args) || !('title' in args) || !('content' in args)) {
          throw new Error('knowledge_base_id, title, and content are required');
        }
        const article = await pylonClient.createKnowledgeBaseArticle(
          args.knowledge_base_id as string,
          { title: args.title as string, content: args.content as string }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(article, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_teams': {
        const teams = await pylonClient.getTeams();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(teams, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_team': {
        if (!args || !('team_id' in args)) {
          throw new Error('team_id is required');
        }
        const team = await pylonClient.getTeam(args.team_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(team, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_team': {
        if (!args) throw new Error('Arguments required for creating team');
        const team = await pylonClient.createTeam(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(team, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_accounts': {
        const accounts = await pylonClient.getAccounts();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(accounts, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_account': {
        if (!args || !('account_id' in args)) {
          throw new Error('account_id is required');
        }
        const account = await pylonClient.getAccount(args.account_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(account, null, 2),
            },
          ],
        };
      }

      case 'pylon_search_users': {
        if (!args || !('query' in args)) {
          throw new Error('query is required');
        }
        const users = await pylonClient.searchUsers(args.query as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_users': {
        const users = await pylonClient.getUsers();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      }

      case 'pylon_search_contacts': {
        if (!args || !('query' in args)) {
          throw new Error('query is required');
        }
        const contacts = await pylonClient.searchContacts(args.query as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contacts, null, 2),
            },
          ],
        };
      }

      case 'pylon_search_issues': {
        if (!args || !('query' in args)) {
          throw new Error('query is required');
        }
        const issues = await pylonClient.searchIssues(args.query as string, args.filters as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issues, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_issue': {
        if (!args || !('issue_id' in args)) {
          throw new Error('issue_id is required');
        }
        const issue = await pylonClient.getIssue(args.issue_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      }

      case 'pylon_update_issue': {
        if (!args || !('issue_id' in args)) {
          throw new Error('issue_id is required');
        }
        const { issue_id, ...updates } = args;
        const issue = await pylonClient.updateIssue(issue_id as string, updates as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      }

      case 'pylon_snooze_issue': {
        if (!args || !('issue_id' in args) || !('until' in args)) {
          throw new Error('issue_id and until are required');
        }
        await pylonClient.snoozeIssue(args.issue_id as string, args.until as string);
        return {
          content: [
            {
              type: 'text',
              text: 'Issue snoozed successfully',
            },
          ],
        };
      }

      case 'pylon_get_issue_messages': {
        if (!args || !('issue_id' in args)) {
          throw new Error('issue_id is required');
        }
        const messages = await pylonClient.getIssueMessages(args.issue_id as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_issue_message': {
        if (!args || !('issue_id' in args) || !('content' in args)) {
          throw new Error('issue_id and content are required');
        }
        const message = await pylonClient.createIssueMessage(args.issue_id as string, args.content as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(message, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_tags': {
        const tags = await pylonClient.getTags();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tags, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_tag': {
        if (!args) throw new Error('Arguments required for creating tag');
        const tag = await pylonClient.createTag(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tag, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_ticket_forms': {
        const forms = await pylonClient.getTicketForms();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(forms, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_ticket_form': {
        if (!args) throw new Error('Arguments required for creating ticket form');
        const form = await pylonClient.createTicketForm(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(form, null, 2),
            },
          ],
        };
      }

      case 'pylon_get_webhooks': {
        const webhooks = await pylonClient.getWebhooks();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(webhooks, null, 2),
            },
          ],
        };
      }

      case 'pylon_create_webhook': {
        if (!args) throw new Error('Arguments required for creating webhook');
        const webhook = await pylonClient.createWebhook(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(webhook, null, 2),
            },
          ],
        };
      }

      case 'pylon_delete_webhook': {
        if (!args || !('webhook_id' in args)) {
          throw new Error('webhook_id is required');
        }
        await pylonClient.deleteWebhook(args.webhook_id as string);
        return {
          content: [
            {
              type: 'text',
              text: 'Webhook deleted successfully',
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Pylon MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});