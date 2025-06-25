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


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request



## License

MIT License - see LICENSE file for details
