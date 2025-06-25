import { ZephyrClient } from '../clients/zephyr-client.js';
import {
  createTestCaseSchema,
  searchTestCasesSchema,
  CreateTestCaseInput,
  SearchTestCasesInput,
} from '../utils/validation.js';

let zephyrClient: ZephyrClient | null = null;

const getZephyrClient = (): ZephyrClient => {
  if (!zephyrClient) {
    zephyrClient = new ZephyrClient();
  }
  return zephyrClient;
};

export const createTestCase = async (input: CreateTestCaseInput) => {
  const validatedInput = createTestCaseSchema.parse(input);
  
  try {
    const testCase = await getZephyrClient().createTestCase({
      projectKey: validatedInput.projectKey,
      name: validatedInput.name,
      objective: validatedInput.objective,
      precondition: validatedInput.precondition,
      estimatedTime: validatedInput.estimatedTime,
      priority: validatedInput.priority,
      status: validatedInput.status,
      folderId: validatedInput.folderId,
      labels: validatedInput.labels,
      componentId: validatedInput.componentId,
      customFields: validatedInput.customFields,
      testScript: validatedInput.testScript,
    });
    
    return {
      success: true,
      data: {
        id: testCase.id,
        key: testCase.key,
        name: testCase.name,
        projectKey: testCase.project?.id,
        objective: testCase.objective,
        precondition: testCase.precondition,
        estimatedTime: testCase.estimatedTime,
        priority: testCase.priority?.id,
        status: testCase.status?.id,
        folder: testCase.folder?.id,
        labels: testCase.labels || [],
        component: testCase.component?.id,
        owner: testCase.owner?.accountId,
        createdOn: testCase.createdOn,
        links: {
          self: `https://api.zephyrscale.smartbear.com/v2/testcases/${testCase.key}`,
          issues: testCase.links?.issues?.length || 0,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const searchTestCases = async (input: SearchTestCasesInput) => {
  const validatedInput = searchTestCasesSchema.parse(input);
  
  try {
    const result = await getZephyrClient().searchTestCases(
      validatedInput.projectKey,
      validatedInput.query,
      validatedInput.limit
    );
    
    return {
      success: true,
      data: {
        testCases: result.testCases.map(testCase => ({
          id: testCase.id,
          key: testCase.key,
          name: testCase.name,
          objective: testCase.objective,
          precondition: testCase.precondition,
          estimatedTime: testCase.estimatedTime,
          priority: testCase.priority?.id,
          status: testCase.status?.id,
          folder: testCase.folder?.id,
          labels: testCase.labels || [],
          component: testCase.component?.id,
          owner: testCase.owner?.accountId,
          createdOn: testCase.createdOn,
          linkedIssues: testCase.links?.issues?.length || 0,
        })),
        total: result.total,
        projectKey: validatedInput.projectKey,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getTestCase = async (input: { testCaseId: string }) => {
  try {
    const testCase = await getZephyrClient().getTestCase(input.testCaseId);
    
    return {
      success: true,
      data: {
        id: testCase.id,
        key: testCase.key,
        name: testCase.name,
        projectKey: testCase.project?.id,
        objective: testCase.objective,
        precondition: testCase.precondition,
        estimatedTime: testCase.estimatedTime,
        priority: testCase.priority,
        status: testCase.status,
        folder: testCase.folder,
        labels: testCase.labels || [],
        component: testCase.component,
        owner: testCase.owner,
        createdOn: testCase.createdOn,
        customFields: testCase.customFields,
        links: testCase.links,
        testScript: testCase.testScript,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};