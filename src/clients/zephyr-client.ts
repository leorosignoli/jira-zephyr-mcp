import axios, { AxiosInstance } from 'axios';
import { appConfig, getZephyrHeaders } from '../utils/config.js';
import {
  ZephyrTestPlan,
  ZephyrTestCycle,
  ZephyrTestExecution,
  ZephyrTestCase,
  ZephyrTestReport,
  ZephyrExecutionSummary,
} from '../types/zephyr-types.js';

export class ZephyrClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://prod-api.zephyr4jiracloud.com/connect',
      headers: getZephyrHeaders(),
      timeout: 30000,
    });
  }

  async createTestPlan(data: {
    name: string;
    description?: string;
    projectKey: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ZephyrTestPlan> {
    const payload = {
      name: data.name,
      objective: data.description,
      projectKey: data.projectKey,
      plannedStartDate: data.startDate,
      plannedEndDate: data.endDate,
    };

    const response = await this.client.post('/public/rest/api/1.0/testplan', payload);
    return response.data;
  }

  async getTestPlans(projectKey: string, limit = 50, offset = 0): Promise<{
    testPlans: ZephyrTestPlan[];
    total: number;
  }> {
    const params = {
      projectKey,
      maxResults: limit,
      startAt: offset,
    };

    const response = await this.client.get('/public/rest/api/1.0/testplans', { params });
    return {
      testPlans: response.data.values || response.data,
      total: response.data.total || response.data.length,
    };
  }

  async createTestCycle(data: {
    name: string;
    description?: string;
    projectKey: string;
    versionId: string;
    environment?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ZephyrTestCycle> {
    const payload = {
      name: data.name,
      description: data.description,
      projectKey: data.projectKey,
      versionId: data.versionId,
      environment: data.environment,
      plannedStartDate: data.startDate,
      plannedEndDate: data.endDate,
    };

    const response = await this.client.post('/public/rest/api/1.0/testcycles', payload);
    return response.data;
  }

  async getTestCycles(projectKey: string, versionId?: string, limit = 50): Promise<{
    testCycles: ZephyrTestCycle[];
    total: number;
  }> {
    const params = {
      projectKey,
      versionId,
      maxResults: limit,
    };

    const response = await this.client.get('/public/rest/api/1.0/testcycles', { params });
    return {
      testCycles: response.data.values || response.data,
      total: response.data.total || response.data.length,
    };
  }

  async getTestExecution(executionId: string): Promise<ZephyrTestExecution> {
    const response = await this.client.get(`/public/rest/api/1.0/testexecutions/${executionId}`);
    return response.data;
  }

  async updateTestExecution(data: {
    executionId: string;
    status: 'Pass' | 'Fail' | 'In Progress' | 'Blocked';
    comment?: string;
    defects?: string[];
  }): Promise<ZephyrTestExecution> {
    const payload = {
      status: data.status,
      comment: data.comment,
      issues: data.defects?.map(key => ({ key })),
    };

    const response = await this.client.put(`/public/rest/api/1.0/testexecutions/${data.executionId}`, payload);
    return response.data;
  }

  async getTestExecutionSummary(cycleId: string): Promise<ZephyrExecutionSummary> {
    const response = await this.client.get(`/public/rest/api/1.0/testcycles/${cycleId}/testexecutions`);
    const executions = response.data.values;

    const summary = executions.reduce(
      (acc: any, execution: any) => {
        acc.total++;
        switch (execution.status) {
          case 'Pass':
            acc.passed++;
            break;
          case 'Fail':
            acc.failed++;
            break;
          case 'Blocked':
            acc.blocked++;
            break;
          case 'In Progress':
            acc.inProgress++;
            break;
          default:
            acc.notExecuted++;
        }
        return acc;
      },
      { total: 0, passed: 0, failed: 0, blocked: 0, inProgress: 0, notExecuted: 0 }
    );

    summary.passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    return summary;
  }

  async linkTestCaseToIssue(testCaseId: string, issueKey: string): Promise<void> {
    const payload = {
      issueKeys: [issueKey],
    };

    await this.client.post(`/public/rest/api/1.0/testcases/${testCaseId}/links`, payload);
  }

  async generateTestReport(cycleId: string): Promise<ZephyrTestReport> {
    const cycleResponse = await this.client.get(`/public/rest/api/1.0/testcycles/${cycleId}`);
    const cycle = cycleResponse.data;

    const executionsResponse = await this.client.get(`/public/rest/api/1.0/testcycles/${cycleId}/testexecutions`);
    const executions = executionsResponse.data.values || executionsResponse.data;

    const summary = await this.getTestExecutionSummary(cycleId);

    return {
      cycleId,
      cycleName: cycle.name,
      projectKey: cycle.projectKey,
      summary,
      executions,
      generatedOn: new Date().toISOString(),
    };
  }

  async getTestCase(testCaseId: string): Promise<ZephyrTestCase> {
    const response = await this.client.get(`/public/rest/api/1.0/testcases/${testCaseId}`);
    return response.data;
  }

  async searchTestCases(projectKey: string, query?: string, limit = 50): Promise<{
    testCases: ZephyrTestCase[];
    total: number;
  }> {
    const params = {
      projectKey,
      query,
      maxResults: limit,
    };

    const response = await this.client.get('/public/rest/api/1.0/testcases/search', { params });
    return {
      testCases: response.data.values || response.data,
      total: response.data.total || response.data.length,
    };
  }

  async createTestCase(data: {
    projectKey: string;
    name: string;
    objective?: string;
    precondition?: string;
    estimatedTime?: number;
    priority?: string;
    status?: string;
    folderId?: string;
    labels?: string[];
    componentId?: string;
    customFields?: Record<string, any>;
    testScript?: {
      type: 'STEP_BY_STEP' | 'PLAIN_TEXT';
      steps?: Array<{
        index: number;
        description: string;
        testData?: string;
        expectedResult: string;
      }>;
      text?: string;
    };
  }): Promise<ZephyrTestCase> {
    const payload: any = {
      projectKey: data.projectKey,
      name: data.name,
      objective: data.objective,
      precondition: data.precondition,
      estimatedTime: data.estimatedTime,
    };

    if (data.priority) {
      payload.priority = data.priority;
    }

    if (data.status) {
      payload.status = data.status;
    }

    if (data.folderId) {
      payload.folderId = data.folderId;
    }

    if (data.labels && data.labels.length > 0) {
      payload.labels = data.labels;
    }

    if (data.componentId) {
      payload.componentId = data.componentId;
    }

    if (data.customFields) {
      payload.customFields = data.customFields;
    }

    if (data.testScript) {
      payload.testScript = data.testScript;
    }

    const response = await this.client.post('/testcases', payload);
    return response.data;
  }
}