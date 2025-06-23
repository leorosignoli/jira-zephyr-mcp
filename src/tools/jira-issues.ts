import { JiraClient } from '../clients/jira-client.js';
import { readJiraIssueSchema, ReadJiraIssueInput } from '../utils/validation.js';

const jiraClient = new JiraClient();

export const readJiraIssue = async (input: ReadJiraIssueInput) => {
  const validatedInput = readJiraIssueSchema.parse(input);
  
  try {
    const issue = await jiraClient.getIssue(validatedInput.issueKey, validatedInput.fields);
    
    return {
      success: true,
      data: {
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: {
          name: issue.fields.status.name,
          category: issue.fields.status.statusCategory.name,
        },
        priority: issue.fields.priority.name,
        assignee: issue.fields.assignee ? {
          name: issue.fields.assignee.displayName,
          email: issue.fields.assignee.emailAddress,
        } : null,
        reporter: {
          name: issue.fields.reporter.displayName,
          email: issue.fields.reporter.emailAddress,
        },
        created: issue.fields.created,
        updated: issue.fields.updated,
        issueType: issue.fields.issuetype.name,
        project: {
          key: issue.fields.project.key,
          name: issue.fields.project.name,
        },
        labels: issue.fields.labels,
        components: issue.fields.components.map(c => c.name),
        fixVersions: issue.fields.fixVersions.map(v => v.name),
        customFields: Object.entries(issue.fields)
          .filter(([key]) => key.startsWith('customfield_'))
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value,
          }), {}),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.errorMessages?.[0] || error.message,
    };
  }
};

export const searchJiraIssues = async (input: {
  jql: string;
  fields?: string[];
  maxResults?: number;
}) => {
  try {
    const result = await jiraClient.searchIssues(
      input.jql,
      input.fields,
      input.maxResults || 50
    );
    
    return {
      success: true,
      data: {
        total: result.total,
        issues: result.issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          assignee: issue.fields.assignee?.displayName || 'Unassigned',
          project: issue.fields.project.key,
          issueType: issue.fields.issuetype.name,
          updated: issue.fields.updated,
        })),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.errorMessages?.[0] || error.message,
    };
  }
};