import axios, { AxiosInstance } from 'axios';
import { appConfig, getJiraAuth } from '../utils/config.js';
import { JiraIssue, JiraProject, JiraVersion } from '../types/jira-types.js';

export class JiraClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${appConfig.JIRA_BASE_URL}/rest/api/3`,
      auth: getJiraAuth(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
  }

  async getIssue(issueKey: string, fields?: string[]): Promise<JiraIssue> {
    const params = fields ? { fields: fields.join(',') } : {};
    const response = await this.client.get(`/issue/${issueKey}`, { params });
    return response.data;
  }

  async getProject(projectKey: string): Promise<JiraProject> {
    const response = await this.client.get(`/project/${projectKey}`);
    return response.data;
  }

  async getProjectVersions(projectKey: string): Promise<JiraVersion[]> {
    const response = await this.client.get(`/project/${projectKey}/versions`);
    return response.data;
  }

  async searchIssues(jql: string, fields?: string[], maxResults = 50): Promise<{
    issues: JiraIssue[];
    total: number;
  }> {
    const params = {
      jql,
      fields: fields?.join(',') || '*all',
      maxResults,
    };
    
    const response = await this.client.get('/search', { params });
    return {
      issues: response.data.issues,
      total: response.data.total,
    };
  }

  async createIssue(issueData: {
    projectKey: string;
    summary: string;
    description?: string;
    issueType: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
    components?: string[];
  }): Promise<JiraIssue> {
    const payload = {
      fields: {
        project: { key: issueData.projectKey },
        summary: issueData.summary,
        description: issueData.description ? {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: issueData.description,
            }],
          }],
        } : undefined,
        issuetype: { name: issueData.issueType },
        priority: issueData.priority ? { name: issueData.priority } : undefined,
        assignee: issueData.assignee ? { accountId: issueData.assignee } : undefined,
        labels: issueData.labels,
        components: issueData.components?.map(name => ({ name })),
      },
    };

    const response = await this.client.post('/issue', payload);
    return this.getIssue(response.data.key);
  }

  async linkIssues(inwardIssueKey: string, outwardIssueKey: string, linkType: string): Promise<void> {
    const payload = {
      type: { name: linkType },
      inwardIssue: { key: inwardIssueKey },
      outwardIssue: { key: outwardIssueKey },
    };

    await this.client.post('/issueLink', payload);
  }
}