import { ZephyrClient } from '../clients/zephyr-client.js';
import {
  executeTestSchema,
  getTestExecutionStatusSchema,
  linkTestsToIssuesSchema,
  generateTestReportSchema,
  ExecuteTestInput,
  GetTestExecutionStatusInput,
  LinkTestsToIssuesInput,
  GenerateTestReportInput,
} from '../utils/validation.js';

let zephyrClient: ZephyrClient | null = null;

const getZephyrClient = (): ZephyrClient => {
  if (!zephyrClient) {
    zephyrClient = new ZephyrClient();
  }
  return zephyrClient;
};

export const executeTest = async (input: ExecuteTestInput) => {
  const validatedInput = executeTestSchema.parse(input);
  
  try {
    const execution = await getZephyrClient().updateTestExecution({
      executionId: validatedInput.executionId,
      status: validatedInput.status,
      comment: validatedInput.comment,
      defects: validatedInput.defects,
    });
    
    return {
      success: true,
      data: {
        id: execution.id,
        key: execution.key,
        cycleId: execution.cycleId,
        testCaseId: execution.testCaseId,
        status: execution.status,
        comment: execution.comment,
        executedOn: execution.executedOn,
        executedBy: execution.executedBy?.displayName,
        defects: execution.defects.map(defect => ({
          key: defect.key,
          summary: defect.summary,
        })),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getTestExecutionStatus = async (input: GetTestExecutionStatusInput) => {
  const validatedInput = getTestExecutionStatusSchema.parse(input);
  
  try {
    const summary = await getZephyrClient().getTestExecutionSummary(validatedInput.cycleId);
    
    return {
      success: true,
      data: {
        cycleId: validatedInput.cycleId,
        summary: {
          total: summary.total,
          passed: summary.passed,
          failed: summary.failed,
          blocked: summary.blocked,
          inProgress: summary.inProgress,
          notExecuted: summary.notExecuted,
          passRate: Math.round(summary.passRate),
        },
        progress: {
          completed: summary.passed + summary.failed + summary.blocked,
          remaining: summary.notExecuted + summary.inProgress,
          completionPercentage: summary.total > 0 
            ? Math.round(((summary.passed + summary.failed + summary.blocked) / summary.total) * 100)
            : 0,
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

export const linkTestsToIssues = async (input: LinkTestsToIssuesInput) => {
  const validatedInput = linkTestsToIssuesSchema.parse(input);
  
  try {
    const results = [];
    
    for (const issueKey of validatedInput.issueKeys) {
      try {
        await getZephyrClient().linkTestCaseToIssue(validatedInput.testCaseId, issueKey);
        results.push({
          issueKey,
          success: true,
        });
      } catch (error: any) {
        results.push({
          issueKey,
          success: false,
          error: error.response?.data?.message || error.message,
        });
      }
    }
    
    return {
      success: true,
      data: {
        testCaseId: validatedInput.testCaseId,
        linkResults: results,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const generateTestReport = async (input: GenerateTestReportInput) => {
  const validatedInput = generateTestReportSchema.parse(input);
  
  try {
    const report = await getZephyrClient().generateTestReport(validatedInput.cycleId);
    
    if (validatedInput.format === 'HTML') {
      const htmlReport = generateHtmlReport(report);
      return {
        success: true,
        data: {
          format: 'HTML',
          content: htmlReport,
          generatedOn: report.generatedOn,
        },
      };
    }
    
    return {
      success: true,
      data: {
        format: 'JSON',
        content: report,
        generatedOn: report.generatedOn,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

const generateHtmlReport = (report: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Execution Report - ${report.cycleName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background-color: #e8f4f8; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .executions { margin-top: 30px; }
        .execution { padding: 10px; border-left: 4px solid #ddd; margin: 10px 0; }
        .execution.pass { border-left-color: #4caf50; }
        .execution.fail { border-left-color: #f44336; }
        .execution.blocked { border-left-color: #ff9800; }
        .execution.progress { border-left-color: #2196f3; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Test Execution Report</h1>
        <h2>${report.cycleName}</h2>
        <p>Project: ${report.projectKey}</p>
        <p>Generated: ${new Date(report.generatedOn).toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <div class="metric">
          <h3>Total Tests</h3>
          <div class="value">${report.summary.total}</div>
        </div>
        <div class="metric">
          <h3>Passed</h3>
          <div class="value">${report.summary.passed}</div>
        </div>
        <div class="metric">
          <h3>Failed</h3>
          <div class="value">${report.summary.failed}</div>
        </div>
        <div class="metric">
          <h3>Blocked</h3>
          <div class="value">${report.summary.blocked}</div>
        </div>
        <div class="metric">
          <h3>Pass Rate</h3>
          <div class="value">${Math.round(report.summary.passRate)}%</div>
        </div>
      </div>
      
      <div class="executions">
        <h3>Test Executions</h3>
        ${report.executions.map((exec: any) => `
          <div class="execution ${exec.status.toLowerCase()}">
            <strong>${exec.key}</strong> - ${exec.status}
            ${exec.comment ? `<p>${exec.comment}</p>` : ''}
            ${exec.defects.length > 0 ? `<p>Defects: ${exec.defects.map((d: any) => d.key).join(', ')}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
};