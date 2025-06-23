# JIRA Zephyr MCP Server

A Model Context Protocol (MCP) server that provides comprehensive integration with JIRA's Zephyr test management system. This server enables seamless test management operations including creating test plans, managing test cycles, executing tests, and reading JIRA issues.

## Features

### Core Capabilities
- **Test Plan Management**: Create and list test plans in Zephyr
- **Test Cycle Management**: Create and manage test execution cycles
- **JIRA Integration**: Read JIRA issue details and metadata
- **Test Execution**: Update test execution results and status
- **Progress Tracking**: Monitor test execution progress and statistics
- **Issue Linking**: Associate test cases with JIRA issues
- **Reporting**: Generate comprehensive test execution reports

### Available Tools

1. **read_jira_issue** - Retrieve JIRA issue information
2. **create_test_plan** - Create new test plans in Zephyr
3. **list_test_plans** - Browse existing test plans
4. **create_test_cycle** - Create test execution cycles
5. **list_test_cycles** - View test cycles with execution status
6. **execute_test** - Update test execution results
7. **get_test_execution_status** - Check test execution progress
8. **link_tests_to_issues** - Associate tests with JIRA issues
9. **generate_test_report** - Create test execution reports

## Prerequisites

- Node.js 18.0.0 or higher
- JIRA instance with Zephyr Scale or Zephyr Squad
- Valid JIRA API credentials
- Zephyr API access token

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/jira-zephyr-mcp.git
cd jira-zephyr-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your JIRA and Zephyr credentials in `.env`:
```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
ZEPHYR_API_TOKEN=your-zephyr-api-token
```

### Getting API Tokens

#### JIRA API Token
1. Go to [Atlassian Account Settings](https://id.atlassian.com/profile)
2. Navigate to Security → API tokens
3. Create a new API token
4. Copy the token to your `.env` file

#### Zephyr API Token
1. In JIRA, go to Apps → Zephyr Scale → API Access Tokens
2. Generate a new token
3. Copy the token to your `.env` file

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Integration with Claude Desktop

Add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "jira-zephyr": {
      "command": "node",
      "args": ["/path/to/jira-zephyr-mcp/dist/index.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_USERNAME": "your-email@company.com",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "ZEPHYR_API_TOKEN": "your-zephyr-api-token"
      }
    }
  }
}
```

## Tool Usage Examples

### Reading JIRA Issues
```typescript
// Read basic issue information
await readJiraIssue({ issueKey: "ABC-123" });

// Read specific fields
await readJiraIssue({ 
  issueKey: "ABC-123", 
  fields: ["summary", "status", "assignee"] 
});
```

### Creating Test Plans
```typescript
await createTestPlan({
  name: "Release 2.0 Test Plan",
  description: "Comprehensive testing for release 2.0",
  projectKey: "ABC",
  startDate: "2024-01-15",
  endDate: "2024-01-30"
});
```

### Managing Test Cycles
```typescript
// Create a test cycle
await createTestCycle({
  name: "Sprint 10 Testing",
  description: "Testing for sprint 10 features",
  projectKey: "ABC",
  versionId: "10001",
  environment: "Production"
});

// List test cycles
await listTestCycles({
  projectKey: "ABC",
  limit: 25
});
```

### Test Execution
```typescript
// Update test execution status
await executeTest({
  executionId: "12345",
  status: "PASS",
  comment: "All tests passed successfully"
});

// Get execution status
await getTestExecutionStatus({ cycleId: "67890" });
```

### Generating Reports
```typescript
// Generate JSON report
await generateTestReport({
  cycleId: "67890",
  format: "JSON"
});

// Generate HTML report
await generateTestReport({
  cycleId: "67890",
  format: "HTML"
});
```

## Error Handling

The server implements comprehensive error handling:
- Input validation using Zod schemas
- API error mapping and user-friendly messages
- Network timeout handling
- Authentication error detection

## Development

### Scripts
- `npm run build` - Build the TypeScript project
- `npm run dev` - Run in development mode with file watching
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Project Structure
```
src/
├── index.ts              # Main MCP server entry point
├── clients/              # API clients
│   ├── jira-client.ts    # JIRA REST API client
│   └── zephyr-client.ts  # Zephyr API client
├── tools/                # MCP tool implementations
│   ├── jira-issues.ts    # JIRA issue tools
│   ├── test-plans.ts     # Test plan management
│   ├── test-cycles.ts    # Test cycle management
│   └── test-execution.ts # Test execution tools
├── types/                # TypeScript type definitions
│   ├── jira-types.ts     # JIRA API types
│   └── zephyr-types.ts   # Zephyr API types
└── utils/                # Utility functions
    ├── config.ts         # Configuration management
    └── validation.ts     # Input validation schemas
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Security

- Never commit API tokens or credentials to the repository
- Use environment variables for all sensitive configuration
- Regularly rotate API tokens
- Implement proper access controls in your JIRA instance

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the existing GitHub issues
2. Create a new issue with detailed information
3. Include error logs and configuration (without sensitive data)

## Roadmap

- [ ] Support for Zephyr Squad (in addition to Zephyr Scale)
- [ ] Bulk test execution operations
- [ ] Advanced reporting with charts and metrics
- [ ] Test case creation and management
- [ ] Integration with CI/CD pipelines
- [ ] Custom field support for test management
