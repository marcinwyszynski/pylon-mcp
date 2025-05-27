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

if (!PYLON_API_TOKEN) {
  console.error('PYLON_API_TOKEN environment variable is required');
  process.exit(1);
}

const pylonClient = new PylonClient({
  apiToken: PYLON_API_TOKEN,
});

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
    description: 'Get current user information from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_contacts',
    description: 'Get contacts from Pylon with optional search and limit',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term for contacts' },
        limit: { type: 'number', description: 'Maximum number of contacts to return' },
      },
    },
  },
  {
    name: 'pylon_create_contact',
    description: 'Create a new contact in Pylon',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Contact email address' },
        name: { type: 'string', description: 'Contact name' },
        portal_role: { type: 'string', description: 'Portal role for the contact' },
      },
      required: ['email', 'name'],
    },
  },
  {
    name: 'pylon_get_issues',
    description: 'Get issues from Pylon with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        assignee: { type: 'string', description: 'Filter by assignee' },
        status: { type: 'string', description: 'Filter by status' },
        limit: { type: 'number', description: 'Maximum number of issues to return' },
      },
    },
  },
  {
    name: 'pylon_create_issue',
    description: 'Create a new issue in Pylon',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Issue title' },
        description: { type: 'string', description: 'Issue description' },
        status: { type: 'string', description: 'Issue status' },
        priority: { type: 'string', description: 'Issue priority' },
        assignee: { type: 'string', description: 'Issue assignee' },
      },
      required: ['title', 'description', 'status', 'priority'],
    },
  },
  {
    name: 'pylon_get_knowledge_bases',
    description: 'Get all knowledge bases from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_knowledge_base_articles',
    description: 'Get articles from a specific knowledge base',
    inputSchema: {
      type: 'object',
      properties: {
        knowledge_base_id: { type: 'string', description: 'Knowledge base ID' },
      },
      required: ['knowledge_base_id'],
    },
  },
  {
    name: 'pylon_create_knowledge_base_article',
    description: 'Create a new article in a knowledge base',
    inputSchema: {
      type: 'object',
      properties: {
        knowledge_base_id: { type: 'string', description: 'Knowledge base ID' },
        title: { type: 'string', description: 'Article title' },
        content: { type: 'string', description: 'Article content' },
      },
      required: ['knowledge_base_id', 'title', 'content'],
    },
  },
  {
    name: 'pylon_get_teams',
    description: 'Get all teams from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_team',
    description: 'Get a specific team by ID',
    inputSchema: {
      type: 'object',
      properties: {
        team_id: { type: 'string', description: 'Team ID' },
      },
      required: ['team_id'],
    },
  },
  {
    name: 'pylon_create_team',
    description: 'Create a new team',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Team name' },
        description: { type: 'string', description: 'Team description' },
        members: { type: 'array', items: { type: 'string' }, description: 'Team member IDs' },
      },
      required: ['name'],
    },
  },
  {
    name: 'pylon_get_accounts',
    description: 'Get all accounts from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_get_account',
    description: 'Get a specific account by ID',
    inputSchema: {
      type: 'object',
      properties: {
        account_id: { type: 'string', description: 'Account ID' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'pylon_search_users',
    description: 'Search for users in Pylon',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for users' },
      },
      required: ['query'],
    },
  },
  {
    name: 'pylon_get_users',
    description: 'Get all users from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_search_contacts',
    description: 'Search for contacts in Pylon',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for contacts' },
      },
      required: ['query'],
    },
  },
  {
    name: 'pylon_search_issues',
    description: 'Search for issues in Pylon',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for issues' },
        filters: { type: 'object', description: 'Additional search filters' },
      },
      required: ['query'],
    },
  },
  {
    name: 'pylon_get_issue',
    description: 'Get a specific issue by ID',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'Issue ID' },
      },
      required: ['issue_id'],
    },
  },
  {
    name: 'pylon_update_issue',
    description: 'Update an existing issue',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'Issue ID' },
        title: { type: 'string', description: 'Issue title' },
        description: { type: 'string', description: 'Issue description' },
        status: { type: 'string', description: 'Issue status' },
        priority: { type: 'string', description: 'Issue priority' },
        assignee: { type: 'string', description: 'Issue assignee' },
      },
      required: ['issue_id'],
    },
  },
  {
    name: 'pylon_snooze_issue',
    description: 'Snooze an issue until a specified time',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'Issue ID' },
        until: { type: 'string', description: 'Snooze until date/time (ISO format)' },
      },
      required: ['issue_id', 'until'],
    },
  },
  {
    name: 'pylon_get_issue_messages',
    description: 'Get messages for a specific issue',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'Issue ID' },
      },
      required: ['issue_id'],
    },
  },
  {
    name: 'pylon_create_issue_message',
    description: 'Create a new message for an issue',
    inputSchema: {
      type: 'object',
      properties: {
        issue_id: { type: 'string', description: 'Issue ID' },
        content: { type: 'string', description: 'Message content' },
      },
      required: ['issue_id', 'content'],
    },
  },
  {
    name: 'pylon_get_tags',
    description: 'Get all tags from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_create_tag',
    description: 'Create a new tag',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tag name' },
        color: { type: 'string', description: 'Tag color' },
      },
      required: ['name'],
    },
  },
  {
    name: 'pylon_get_ticket_forms',
    description: 'Get all ticket forms from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_create_ticket_form',
    description: 'Create a new ticket form',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Form name' },
        description: { type: 'string', description: 'Form description' },
        fields: { type: 'array', description: 'Form fields configuration' },
      },
      required: ['name', 'fields'],
    },
  },
  {
    name: 'pylon_get_webhooks',
    description: 'Get all webhooks from Pylon',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pylon_create_webhook',
    description: 'Create a new webhook',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Webhook URL' },
        events: { type: 'array', items: { type: 'string' }, description: 'Events to listen for' },
        active: { type: 'boolean', description: 'Whether webhook is active' },
      },
      required: ['url', 'events'],
    },
  },
  {
    name: 'pylon_delete_webhook',
    description: 'Delete a webhook',
    inputSchema: {
      type: 'object',
      properties: {
        webhook_id: { type: 'string', description: 'Webhook ID' },
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