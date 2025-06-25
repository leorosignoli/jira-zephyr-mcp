export interface ZephyrTestPlan {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectId: string;
  status: string;
  createdOn: string;
  updatedOn: string;
  createdBy: {
    accountId: string;
    displayName: string;
  };
}

export interface ZephyrTestCycle {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectId: string;
  versionId: string;
  environment?: string;
  status: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  createdOn: string;
  updatedOn: string;
  executionSummary: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    inProgress: number;
    notExecuted: number;
  };
}

export interface ZephyrTestExecution {
  id: string;
  key: string;
  cycleId: string;
  testCaseId: string;
  status: 'PASS' | 'FAIL' | 'WIP' | 'BLOCKED' | 'NOT_EXECUTED';
  comment?: string;
  executedOn?: string;
  executedBy?: {
    accountId: string;
    displayName: string;
  };
  defects: Array<{
    key: string;
    summary: string;
  }>;
}

export interface ZephyrTestCase {
  id: number;
  key: string;
  name: string;
  objective?: string;
  precondition?: string;
  estimatedTime?: number;
  labels?: string[];
  createdOn: string;
  project?: {
    id: number;
    self: string;
  };
  component?: {
    id: number;
    self: string;
  };
  priority?: {
    id: number;
    self: string;
  };
  status?: {
    id: number;
    self: string;
  };
  folder?: {
    id: number;
    self: string;
  };
  owner?: {
    self: string;
    accountId: string;
  };
  testScript?: {
    self: string;
  };
  customFields?: Record<string, any>;
  links?: {
    self: string;
    issues?: Array<{
      self: string;
      issueId: number;
      id: number;
      target: string;
      type: string;
    }>;
    webLinks?: any[];
  };
}

export interface ZephyrExecutionSummary {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  inProgress: number;
  notExecuted: number;
  passRate: number;
}

export interface ZephyrTestReport {
  cycleId: string;
  cycleName: string;
  projectKey: string;
  summary: ZephyrExecutionSummary;
  executions: ZephyrTestExecution[];
  generatedOn: string;
}