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
10. **create_test_case** - Create a new test case in Zephyr
11. **create_multiple_test_cases** - Create multiple test cases at once
12. **search_test_cases** - Search for test cases in a project
13. **get_test_case** - Get detailed information about a specific test case
14. **get_test_steps** - Get all test steps for a specific test case

## Prerequisites

- Node.js 18.0.0 or higher
- JIRA instance with Zephyr Scale or Zephyr Squad
- Valid JIRA API credentials
- Zephyr API access token


### Integration with Claude Desktop

Add the following to your `claude_desktop_config.json` (located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "jira-zephyr": {
      "command": "/path/to/node",
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

> **Note:** Use the full path to your Node.js binary (e.g. `/Users/you/.nvm/versions/node/v22.22.0/bin/node`) to avoid issues with nvm version resolution. Requires Node.js 18+.

### Integration with Cursor

Clone the project, then add the following to your Cursor configuration:

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

#### Using Docker

Alternatively, you can configure Cursor to run the MCP server in Docker (ensure the image is built first):

```json
{
  "mcpServers": {
    "jira-zephyr": {
      "command": "docker",
      "args": ["run", "--rm", "-i","-e","JIRA_BASE_URL","-e","JIRA_USERNAME","-e","JIRA_API_TOKEN","-e","ZEPHYR_API_TOKEN", "jira-zephyr-mcp"],
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

## Installation (for development)

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


## Running with Docker

You can containerize and run the MCP server using Docker.

### Prerequisites
- Docker installed on your system
- The project cloned locally

### Building the Docker Image
1. Navigate to the project directory:

```bash
cd /path/to/jira-zephyr-mcp
```

2. Build the Docker image:

```bash
docker build -t jira-zephyr-mcp:latest .
```

You can specify a different tag if desired, e.g., `-t jira-zephyr-mcp:v1.0.0`.

### Running the Container
1. Run the container with required environment variables:

```bash
docker run -d --name jira-zephyr-mcp \
  -e JIRA_BASE_URL=https://your-domain.atlassian.net \
  -e JIRA_USERNAME=your-email@company.com \
  -e JIRA_API_TOKEN=your-jira-api-token \
  -e ZEPHYR_API_TOKEN=your-zephyr-api-token \
  jira-zephyr-mcp:latest
```

Note: For integration with systems like Cursor, use the Docker configuration shown in the 'Integration with Cursor' section above. Ensure the image is built with the desired tag that matches your Cursor config. The server communicates via stdio, so ensure your setup supports this when running in a container.

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

### Managing Test Cases
```typescript
// Create a test case with steps
await createTestCase({
  projectKey: "ABC",
  name: "Login flow test",
  objective: "Verify user can log in successfully",
  testScript: {
    type: "STEP_BY_STEP",
    steps: [
      { index: 1, description: "Open login page", expectedResult: "Login form is displayed" },
      { index: 2, description: "Enter valid credentials", expectedResult: "User is redirected to dashboard" }
    ]
  }
});

// Search test cases
await searchTestCases({ projectKey: "ABC", query: "login" });

// Get test steps for a specific test case
await getTestSteps({ testCaseId: "ABC-T42" });
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
- [x] Test case creation and management
- [x] Get test steps for a test case
- [ ] Integration with CI/CD pipelines
- [ ] Custom field support for test management
