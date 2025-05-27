# Pylon MCP Server
[![smithery badge](https://smithery.ai/badge/@marcinwyszynski/pylon-mcp)](https://smithery.ai/server/@marcinwyszynski/pylon-mcp)

An MCP (Model Context Protocol) server for integrating with the Pylon API.

## Features

This MCP server provides tools to interact with Pylon's API:

- **User Management**: Get current user information
- **Contacts**: List, search, and create contacts
- **Issues**: List, filter, and create issues
- **Knowledge Base**: Access and create knowledge base articles

## Setup

### Environment Variables

Set the following environment variable:

- `PYLON_API_TOKEN`: Your Pylon API token (required)

### Installing via Smithery

To install Pylon MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@marcinwyszynski/pylon-mcp):

```bash
npx -y @smithery/cli install @marcinwyszynski/pylon-mcp --client claude
```

### Installation

```bash
npm install
npm run build
```

### Development

```bash
npm run dev
```

## Available Tools

### User Tools

- `pylon_get_me`: Get current user information

### Contact Tools

- `pylon_get_contacts`: List contacts with optional search and limit
- `pylon_create_contact`: Create a new contact

### Issue Tools

- `pylon_get_issues`: List issues with optional filtering by assignee, status, and limit
- `pylon_create_issue`: Create a new issue

### Knowledge Base Tools

- `pylon_get_knowledge_bases`: List all knowledge bases
- `pylon_get_knowledge_base_articles`: Get articles from a specific knowledge base
- `pylon_create_knowledge_base_article`: Create a new article in a knowledge base

## Usage Examples

### Running Locally with Claude Desktop

1. **Setup Environment**:

   ```bash
   # Clone and install
   git clone <your-repo-url>
   cd pylon-mcp-server
   npm install
   npm run build
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env and add your PYLON_API_TOKEN
   ```

2. **Configure Claude Desktop**:

  Add this to your Claude Desktop MCP settings (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
  
  ```json
  {
    "mcpServers": {
      "pylon": {
        "command": "node",
        "args": ["/path/to/pylon-mcp-server/dist/index.js"],
        "env": {
          "PYLON_API_TOKEN": "your_pylon_api_token_here"
        }
      }
    }
  }
  ```

3. **Test the Connection**:

  Restart Claude Desktop and try these commands in a conversation:

  ```text
  Use the pylon_get_me tool to check my Pylon user info
  
  Use pylon_get_issues to show recent support tickets
  
  Search for contacts with pylon_search_contacts using "customer@example.com"
  ```

### Running via Smithery

1. **Deploy to Smithery**:
   - Upload your project to Smithery
   - Smithery will automatically use the `smithery.yaml` configuration
   - Set the `PYLON_API_TOKEN` environment variable in Smithery's deployment settings

2. **Configure in Claude Desktop**:

  ```json
  {
    "mcpServers": {
      "pylon": {
        "command": "npx",
        "args": ["-y", "@smithery/pylon-mcp-server"]
      }
    }
  }
  ```

### Example Tool Usage

Once connected, you can use any of the 23+ available tools:

```text
# User Management
"Get my user info" → uses pylon_get_me
"Search for users named John" → uses pylon_search_users

# Issue Management  
"Show all open issues" → uses pylon_get_issues
"Create a new bug report" → uses pylon_create_issue
"Add a comment to issue #123" → uses pylon_create_issue_message

# Knowledge Base
"List all knowledge bases" → uses pylon_get_knowledge_bases
"Create a new help article" → uses pylon_create_knowledge_base_article

# Team & Account Management
"Show all teams" → uses pylon_get_teams
"Get account details" → uses pylon_get_accounts
```

## Deployment to Smithery

This server is designed to be deployed to Smithery using the included `smithery.yaml` configuration. The deployment will automatically:

- Install dependencies with `npm install && npm run build`
- Configure the Node.js runtime with proper entrypoint
- Expose all 23 Pylon API tools
- Require the `PYLON_API_TOKEN` environment variable

## API Reference

For more information about the Pylon API, visit the [API reference](https://docs.usepylon.com/pylon-docs/developer/api/api-reference).
