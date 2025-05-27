# Claude Development Guide

This document provides context for Claude when working on the Pylon MCP Server project.

## Project Overview

This is an MCP (Model Context Protocol) server that provides comprehensive integration with the Pylon API. Pylon is a customer support and helpdesk platform, and this server exposes 23+ tools covering all major API functionality.

## Architecture

- **Language**: TypeScript with Node.js runtime
- **MCP Framework**: `@modelcontextprotocol/sdk`
- **HTTP Client**: Axios for API communication
- **Build System**: TypeScript compiler
- **Deployment**: Smithery platform

## Key Files

- `src/pylon-client.ts` - Pylon API client with authentication and all endpoint methods
- `src/index.ts` - MCP server implementation with tool definitions and handlers
- `smithery.yaml` - Smithery deployment configuration
- `package.json` - Dependencies and build scripts

## API Coverage

The server implements comprehensive Pylon API coverage:

### Authentication

- Base URL: `https://api.usepylon.com`
- Authentication: Bearer JWT tokens
- Environment variable: `PYLON_API_TOKEN`

### Implemented Endpoints

**User Management** (`/me`, `/users`, `/users/search`)
**Contact Management** (`/contacts`, `/contacts/search`)
**Issue Management** (`/issues`, `/issues/search`, `/issues/{id}`, `/issues/{id}/snooze`, `/issues/{id}/messages`)
**Knowledge Base** (`/knowledge-bases`, `/knowledge-bases/{id}/articles`)
**Team Management** (`/teams`, `/teams/{id}`)
**Account Management** (`/accounts`, `/accounts/{id}`)
**Tag Management** (`/tags`)
**Ticket Forms** (`/ticket-forms`)
**Webhook Management** (`/webhooks`)

## Development Commands

```bash
npm install          # Install dependencies
npm run build        # Build TypeScript
npm run dev         # Run in development mode
npm start           # Run built version
```

## Testing

To test the MCP server:

1. Build the project: `npm run build`
2. Configure Claude Desktop with the server
3. Use natural language to test tools:
   - "Get my Pylon user info" → `pylon_get_me`
   - "Show recent issues" → `pylon_get_issues`
   - "Search for contacts" → `pylon_search_contacts`

## Deployment

### Local Development

- Requires `PYLON_API_TOKEN` environment variable
- Configure in Claude Desktop MCP settings
- Use built `dist/index.js` as entrypoint

### Smithery Production

- Uses `smithery.yaml` configuration
- Automatic dependency installation and build
- Environment variable configuration through Smithery UI

## Code Patterns

### Adding New API Endpoints

1. **Add interface** in `pylon-client.ts`:

   ```typescript
   export interface PylonNewResource {
     id: string;
     name: string;
   }
   ```

2. **Add client method** in `PylonClient` class:

   ```typescript
   async getNewResources(): Promise<PylonNewResource[]> {
     const response = await this.client.get('/new-resources');
     return response.data;
   }
   ```

3. **Add MCP tool** in `tools` array:

   ```typescript
   {
     name: 'pylon_get_new_resources',
     description: 'Get new resources from Pylon',
     inputSchema: {
       type: 'object',
       properties: {},
     },
   }
   ```

4. **Add handler** in switch statement:

   ```typescript
   case 'pylon_get_new_resources': {
     const resources = await pylonClient.getNewResources();
     return {
       content: [{ type: 'text', text: JSON.stringify(resources, null, 2) }],
     };
   }
   ```

5. **Update smithery.yaml** tools list

## Error Handling

- All API calls are wrapped in try/catch
- Axios errors are converted to MCP error responses
- Required parameters are validated before API calls
- Type assertions used for request arguments (`args as any`)

## Security

- API tokens stored in environment variables
- Sensitive files excluded in `.gitignore`
- No secrets committed to repository

## Common Issues

1. **TypeScript errors**: Use type assertions (`as any`) for MCP arguments
2. **Missing parameters**: Validate required fields before API calls
3. **Authentication**: Ensure `PYLON_API_TOKEN` is properly set
4. **Build failures**: Check TypeScript configuration and imports

## Future Enhancements

- Add response type validation
- Implement proper TypeScript types for all API responses
- Add retry logic for failed API calls
- Implement rate limiting
- Add comprehensive error codes mapping
