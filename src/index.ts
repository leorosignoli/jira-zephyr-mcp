import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { readJiraIssue } from './tools/jira-issues.js';
import { createTestPlan, listTestPlans } from './tools/test-plans.js';
import { createTestCycle, listTestCycles } from './tools/test-cycles.js';
import {
  executeTest,
  getTestExecutionStatus,
  linkTestsToIssues,
  generateTestReport,
} from './tools/test-execution.js';
import { createTestCase, searchTestCases, getTestCase } from './tools/test-cases.js';

const server = new Server(
  {
    name: 'jira-zephyr-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
  {
    name: 'read_jira_issue',
    description: 'Read JIRA issue details and metadata',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'JIRA issue key (e.g., ABC-123)' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Specific fields to retrieve (optional)' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'create_test_plan',
    description: 'Create a new test plan in Zephyr',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Test plan name' },
        description: { type: 'string', description: 'Test plan description (optional)' },
        projectKey: { type: 'string', description: 'JIRA project key' },
        startDate: { type: 'string', description: 'Planned start date (ISO format, optional)' },
        endDate: { type: 'string', description: 'Planned end date (ISO format, optional)' },
      },
      required: ['name', 'projectKey'],
    },
  },
  {
    name: 'list_test_plans',
    description: 'List existing test plans',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
        offset: { type: 'number', description: 'Number of results to skip (default: 0)' },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'create_test_cycle',
    description: 'Create a new test execution cycle',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Test cycle name' },
        description: { type: 'string', description: 'Test cycle description (optional)' },
        projectKey: { type: 'string', description: 'JIRA project key' },
        versionId: { type: 'string', description: 'JIRA version ID' },
        environment: { type: 'string', description: 'Test environment (optional)' },
        startDate: { type: 'string', description: 'Planned start date (ISO format, optional)' },
        endDate: { type: 'string', description: 'Planned end date (ISO format, optional)' },
      },
      required: ['name', 'projectKey', 'versionId'],
    },
  },
  {
    name: 'list_test_cycles',
    description: 'List existing test cycles with execution status',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        versionId: { type: 'string', description: 'JIRA version ID (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'execute_test',
    description: 'Update test execution results',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: { type: 'string', description: 'Test execution ID' },
        status: { type: 'string', enum: ['PASS', 'FAIL', 'WIP', 'BLOCKED'], description: 'Execution status' },
        comment: { type: 'string', description: 'Execution comment (optional)' },
        defects: { type: 'array', items: { type: 'string' }, description: 'Linked defect keys (optional)' },
      },
      required: ['executionId', 'status'],
    },
  },
  {
    name: 'get_test_execution_status',
    description: 'Get test execution progress and statistics',
    inputSchema: {
      type: 'object',
      properties: {
        cycleId: { type: 'string', description: 'Test cycle ID' },
      },
      required: ['cycleId'],
    },
  },
  {
    name: 'link_tests_to_issues',
    description: 'Associate test cases with JIRA issues',
    inputSchema: {
      type: 'object',
      properties: {
        testCaseId: { type: 'string', description: 'Test case ID' },
        issueKeys: { type: 'array', items: { type: 'string' }, description: 'JIRA issue keys to link' },
      },
      required: ['testCaseId', 'issueKeys'],
    },
  },
  {
    name: 'generate_test_report',
    description: 'Generate test execution report',
    inputSchema: {
      type: 'object',
      properties: {
        cycleId: { type: 'string', description: 'Test cycle ID' },
        format: { type: 'string', enum: ['JSON', 'HTML'], description: 'Report format (default: JSON)' },
      },
      required: ['cycleId'],
    },
  },
  {
    name: 'create_test_case',
    description: 'Create a new test case in Zephyr',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        name: { type: 'string', description: 'Test case name' },
        objective: { type: 'string', description: 'Test case objective/description (optional)' },
        precondition: { type: 'string', description: 'Test preconditions (optional)' },
        estimatedTime: { type: 'number', description: 'Estimated execution time in minutes (optional)' },
        priority: { type: 'string', description: 'Test case priority (optional)' },
        status: { type: 'string', description: 'Test case status (optional)' },
        folderId: { type: 'string', description: 'Folder ID to organize test case (optional)' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Test case labels (optional)' },
        componentId: { type: 'string', description: 'Component ID (optional)' },
        customFields: { type: 'object', description: 'Custom fields as key-value pairs (optional)' },
        testScript: {
          type: 'object',
          description: 'Test script with steps (optional)',
          properties: {
            type: { type: 'string', enum: ['STEP_BY_STEP', 'PLAIN_TEXT'], description: 'Script type' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: { type: 'number', description: 'Step number' },
                  description: { type: 'string', description: 'Step description' },
                  testData: { type: 'string', description: 'Test data (optional)' },
                  expectedResult: { type: 'string', description: 'Expected result' },
                },
                required: ['index', 'description', 'expectedResult'],
              },
              description: 'Test steps (for STEP_BY_STEP type)',
            },
            text: { type: 'string', description: 'Plain text script (for PLAIN_TEXT type)' },
          },
          required: ['type'],
        },
      },
      required: ['projectKey', 'name'],
    },
  },
  {
    name: 'search_test_cases',
    description: 'Search for test cases in a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        query: { type: 'string', description: 'Search query (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'get_test_case',
    description: 'Get detailed information about a specific test case',
    inputSchema: {
      type: 'object',
      properties: {
        testCaseId: { type: 'string', description: 'Test case ID or key' },
      },
      required: ['testCaseId'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'read_jira_issue':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await readJiraIssue(args as any), null, 2),
            },
          ],
        };

      case 'create_test_plan':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createTestPlan(args as any), null, 2),
            },
          ],
        };

      case 'list_test_plans':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await listTestPlans(args as any), null, 2),
            },
          ],
        };

      case 'create_test_cycle':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createTestCycle(args as any), null, 2),
            },
          ],
        };

      case 'list_test_cycles':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await listTestCycles(args as any), null, 2),
            },
          ],
        };

      case 'execute_test':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await executeTest(args as any), null, 2),
            },
          ],
        };

      case 'get_test_execution_status':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestExecutionStatus(args as any), null, 2),
            },
          ],
        };

      case 'link_tests_to_issues':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await linkTestsToIssues(args as any), null, 2),
            },
          ],
        };

      case 'generate_test_report':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await generateTestReport(args as any), null, 2),
            },
          ],
        };

      case 'create_test_case':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createTestCase(args as any), null, 2),
            },
          ],
        };

      case 'search_test_cases':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await searchTestCases(args as any), null, 2),
            },
          ],
        };

      case 'get_test_case':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestCase(args as any), null, 2),
            },
          ],
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira Zephyr MCP server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});