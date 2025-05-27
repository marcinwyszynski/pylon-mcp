import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface PylonConfig {
  apiToken: string;
  baseUrl?: string;
}

export interface PylonUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface PylonContact {
  id: string;
  email: string;
  name: string;
  portal_role?: string;
}

export interface PylonIssue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: string;
}

export interface PylonKnowledgeBase {
  id: string;
  name: string;
  description?: string;
}

export interface PylonArticle {
  id: string;
  title: string;
  content: string;
  knowledge_base_id: string;
}

export interface PylonTeam {
  id: string;
  name: string;
  description?: string;
  members?: string[];
}

export interface PylonAccount {
  id: string;
  name: string;
  domain?: string;
  plan?: string;
}

export interface PylonMessage {
  id: string;
  content: string;
  author_id: string;
  issue_id: string;
  created_at: string;
}

export interface PylonTag {
  id: string;
  name: string;
  color?: string;
}

export interface PylonTicketForm {
  id: string;
  name: string;
  description?: string;
  fields: any[];
}

export interface PylonWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
}

export class PylonClient {
  private client: AxiosInstance;

  constructor(config: PylonConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.usepylon.com',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getMe(): Promise<PylonUser> {
    const response: AxiosResponse<PylonUser> = await this.client.get('/me');
    return response.data;
  }

  async getContacts(params?: { search?: string; limit?: number }): Promise<PylonContact[]> {
    const response: AxiosResponse<PylonContact[]> = await this.client.get('/contacts', { params });
    return response.data;
  }

  async createContact(contact: Omit<PylonContact, 'id'>): Promise<PylonContact> {
    const response: AxiosResponse<PylonContact> = await this.client.post('/contacts', contact);
    return response.data;
  }

  async getIssues(params?: { assignee?: string; status?: string; limit?: number }): Promise<PylonIssue[]> {
    const response: AxiosResponse<PylonIssue[]> = await this.client.get('/issues', { params });
    return response.data;
  }

  async createIssue(issue: Omit<PylonIssue, 'id'>): Promise<PylonIssue> {
    const response: AxiosResponse<PylonIssue> = await this.client.post('/issues', issue);
    return response.data;
  }

  async getKnowledgeBases(): Promise<PylonKnowledgeBase[]> {
    const response: AxiosResponse<PylonKnowledgeBase[]> = await this.client.get('/knowledge-bases');
    return response.data;
  }

  async getKnowledgeBaseArticles(knowledgeBaseId: string): Promise<PylonArticle[]> {
    const response: AxiosResponse<PylonArticle[]> = await this.client.get(`/knowledge-bases/${knowledgeBaseId}/articles`);
    return response.data;
  }

  async createKnowledgeBaseArticle(knowledgeBaseId: string, article: Omit<PylonArticle, 'id' | 'knowledge_base_id'>): Promise<PylonArticle> {
    const response: AxiosResponse<PylonArticle> = await this.client.post(`/knowledge-bases/${knowledgeBaseId}/articles`, article);
    return response.data;
  }

  // Teams API
  async getTeams(): Promise<PylonTeam[]> {
    const response: AxiosResponse<PylonTeam[]> = await this.client.get('/teams');
    return response.data;
  }

  async getTeam(teamId: string): Promise<PylonTeam> {
    const response: AxiosResponse<PylonTeam> = await this.client.get(`/teams/${teamId}`);
    return response.data;
  }

  async createTeam(team: Omit<PylonTeam, 'id'>): Promise<PylonTeam> {
    const response: AxiosResponse<PylonTeam> = await this.client.post('/teams', team);
    return response.data;
  }

  // Accounts API
  async getAccounts(): Promise<PylonAccount[]> {
    const response: AxiosResponse<PylonAccount[]> = await this.client.get('/accounts');
    return response.data;
  }

  async getAccount(accountId: string): Promise<PylonAccount> {
    const response: AxiosResponse<PylonAccount> = await this.client.get(`/accounts/${accountId}`);
    return response.data;
  }

  // Users API (search)
  async searchUsers(query: string): Promise<PylonUser[]> {
    const response: AxiosResponse<PylonUser[]> = await this.client.post('/users/search', { query });
    return response.data;
  }

  async getUsers(): Promise<PylonUser[]> {
    const response: AxiosResponse<PylonUser[]> = await this.client.get('/users');
    return response.data;
  }

  // Contacts API (search)
  async searchContacts(query: string): Promise<PylonContact[]> {
    const response: AxiosResponse<PylonContact[]> = await this.client.post('/contacts/search', { query });
    return response.data;
  }

  // Issues API (search and additional operations)
  async searchIssues(query: string, filters?: any): Promise<PylonIssue[]> {
    const response: AxiosResponse<PylonIssue[]> = await this.client.post('/issues/search', { query, ...filters });
    return response.data;
  }

  async getIssue(issueId: string): Promise<PylonIssue> {
    const response: AxiosResponse<PylonIssue> = await this.client.get(`/issues/${issueId}`);
    return response.data;
  }

  async updateIssue(issueId: string, updates: Partial<PylonIssue>): Promise<PylonIssue> {
    const response: AxiosResponse<PylonIssue> = await this.client.patch(`/issues/${issueId}`, updates);
    return response.data;
  }

  async snoozeIssue(issueId: string, until: string): Promise<void> {
    await this.client.post(`/issues/${issueId}/snooze`, { until });
  }

  // Messages API
  async getIssueMessages(issueId: string): Promise<PylonMessage[]> {
    const response: AxiosResponse<PylonMessage[]> = await this.client.get(`/issues/${issueId}/messages`);
    return response.data;
  }

  async createIssueMessage(issueId: string, content: string): Promise<PylonMessage> {
    const response: AxiosResponse<PylonMessage> = await this.client.post(`/issues/${issueId}/messages`, { content });
    return response.data;
  }

  // Tags API
  async getTags(): Promise<PylonTag[]> {
    const response: AxiosResponse<PylonTag[]> = await this.client.get('/tags');
    return response.data;
  }

  async createTag(tag: Omit<PylonTag, 'id'>): Promise<PylonTag> {
    const response: AxiosResponse<PylonTag> = await this.client.post('/tags', tag);
    return response.data;
  }

  // Ticket Forms API
  async getTicketForms(): Promise<PylonTicketForm[]> {
    const response: AxiosResponse<PylonTicketForm[]> = await this.client.get('/ticket-forms');
    return response.data;
  }

  async createTicketForm(form: Omit<PylonTicketForm, 'id'>): Promise<PylonTicketForm> {
    const response: AxiosResponse<PylonTicketForm> = await this.client.post('/ticket-forms', form);
    return response.data;
  }

  // Webhooks API
  async getWebhooks(): Promise<PylonWebhook[]> {
    const response: AxiosResponse<PylonWebhook[]> = await this.client.get('/webhooks');
    return response.data;
  }

  async createWebhook(webhook: Omit<PylonWebhook, 'id'>): Promise<PylonWebhook> {
    const response: AxiosResponse<PylonWebhook> = await this.client.post('/webhooks', webhook);
    return response.data;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.client.delete(`/webhooks/${webhookId}`);
  }
}