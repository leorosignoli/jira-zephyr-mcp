# Jira Zephyr MCP Server

## MCP Server Configuration

This is an MCP (Model Context Protocol) server that provides integration with JIRA's Zephyr test management system.

### Environment Variables

The following environment variables are required:

- `JIRA_BASE_URL`: Your JIRA instance URL (e.g., https://yourcompany.atlassian.net)
- `JIRA_USERNAME`: Your JIRA email address
- `JIRA_API_TOKEN`: Your JIRA API token (generate from Account Settings > Security > API tokens)
- `ZEPHYR_API_TOKEN`: Your Zephyr Scale API token

### Available Tools

- `read_jira_issue`: Read JIRA issue details and metadata
- `create_test_plan`: Create a new test plan in Zephyr
- `list_test_plans`: List existing test plans
- `create_test_cycle`: Create a new test execution cycle
- `list_test_cycles`: List existing test cycles with execution status
- `execute_test`: Update test execution results
- `get_test_execution_status`: Get test execution progress and statistics
- `link_tests_to_issues`: Associate test cases with JIRA issues
- `generate_test_report`: Generate test execution report
- `create_test_case`: Create a new test case in Zephyr
- `search_test_cases`: Search for test cases in a project
- `get_test_case`: Get detailed information about a specific test case

### Setup Instructions

1. Build the project: `npm run build`
2. Set your environment variables
3. Run: `node dist/index.js`

### Development

- `npm run dev`: Watch mode for development
- `npm run build`: Build the project
- `npm run typecheck`: Check TypeScript types
- `npm run lint`: Lint the code