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
  id: string;
  key: string;
  name: string;
  description?: string;
  projectId: string;
  status: string;
  priority: string;
  estimatedTime?: number;
  createdOn: string;
  updatedOn: string;
  testSteps: Array<{
    step: string;
    data?: string;
    result?: string;
  }>;
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