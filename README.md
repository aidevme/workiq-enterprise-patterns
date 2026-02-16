# Work IQ Enterprise Patterns

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PowerPlatform](https://img.shields.io/badge/PowerPlatform-Dataverse-742774)](https://powerplatform.microsoft.com/)
[![M365](https://img.shields.io/badge/M365-Copilot-0078D4)](https://www.microsoft.com/microsoft-365/copilot)

Complete code samples, templates, and documentation for implementing Microsoft Work IQ with Power Platform and Dataverse.

This repository accompanies the **4-part blog series** on implementing Work IQ:
- [Part 1: Understanding Work IQ Architecture](blog-links)
- [Part 2: Hands-On Setup Guide](blog-links)
- [Part 3: Building Copilot Studio Agents](blog-links)
- [Part 4: Enterprise Patterns](blog-links)

## 🎯 What's Included

### 📁 Code Samples
- Work IQ CLI automation scripts
- Copilot Studio agent templates
- Power Automate flow definitions
- Dataverse schemas and sample data
- Integration examples

### 📊 Templates
- Dataverse table schemas
- Power BI dashboards
- Agent configurations
- Security role templates

### 📖 Documentation
- Setup guides
- Best practices
- Architecture diagrams
- Troubleshooting guides

## 🚀 Quick Start

### Prerequisites

- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ Microsoft 365 Copilot license
- ✅ Power Platform environment with Dataverse
- ✅ Admin consent for Work IQ (see [Admin Guide](./docs/admin-setup.md))

### 1. Install Work IQ CLI

```bash
npm install -g @microsoft/workiq
workiq version
```

### 2. Clone This Repository

```bash
git clone https://github.com/yourusername/workiq-implementation-guide.git
cd workiq-implementation-guide
```

### 3. Run Setup Script

```bash
# PowerShell
.\setup\setup-environment.ps1

# Bash
./setup/setup-environment.sh
```

### 4. Test Your Setup

```bash
# Test Work IQ connection
workiq ask -q "What meetings do I have today?"

# Run sample queries
node samples/basic-queries.js
```

## 📚 Repository Structure

```
workiq-implementation-guide/
│
├── setup/                          # Setup and installation scripts
│   ├── setup-environment.ps1       # PowerShell setup script
│   ├── setup-environment.sh        # Bash setup script
│   └── admin-consent.ps1           # Admin consent script
│
├── samples/                        # Working code samples
│   ├── cli-automation/             # CLI automation examples
│   │   ├── basic-queries.js        # Basic Work IQ queries
│   │   ├── daily-briefing.js       # Daily briefing automation
│   │   ├── meeting-prep.js         # Meeting preparation
│   │   └── project-context.js      # Project context gathering
│   │
│   ├── dataverse/                  # Dataverse integration
│   │   ├── schemas/                # Table schemas
│   │   ├── sample-data/            # Sample data scripts
│   │   └── queries/                # Common query patterns
│   │
│   ├── copilot-studio/             # Copilot Studio agents
│   │   ├── project-assistant/      # Project Status Assistant
│   │   ├── meeting-analyzer/       # Meeting Analyzer agent
│   │   └── task-manager/           # Task Manager agent
│   │
│   └── power-automate/             # Power Automate flows
│       ├── daily-briefing-flow.json
│       ├── meeting-action-items.json
│       └── decision-tracker.json
│
├── templates/                      # Reusable templates
│   ├── dataverse/                  # Dataverse schemas
│   │   ├── projects-table.json
│   │   ├── tasks-table.json
│   │   └── decisions-table.json
│   │
│   ├── copilot-studio/             # Agent templates
│   │   └── base-agent-template.json
│   │
│   └── power-bi/                   # Power BI dashboards
│       ├── agent-analytics.pbix
│       └── workiq-usage.pbix
│
├── docs/                           # Documentation
│   ├── setup/                      # Setup guides
│   │   ├── admin-setup.md
│   │   ├── developer-setup.md
│   │   └── user-guide.md
│   │
│   ├── architecture/               # Architecture docs
│   │   ├── system-design.md
│   │   ├── data-flow.md
│   │   └── security.md
│   │
│   ├── best-practices/             # Best practices
│   │   ├── agent-design.md
│   │   ├── performance.md
│   │   └── governance.md
│   │
│   └── troubleshooting/            # Troubleshooting
│       ├── common-issues.md
│       └── faq.md
│
├── tools/                          # Utility scripts
│   ├── cache-manager.js            # Work IQ cache management
│   ├── migration-helper.js         # Environment migration
│   └── monitoring-setup.js         # Monitoring configuration
│
├── tests/                          # Test suites
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # End-to-end tests
│
├── .github/                        # GitHub configuration
│   ├── workflows/                  # CI/CD workflows
│   └── ISSUE_TEMPLATE/             # Issue templates
│
├── LICENSE                         # MIT License
├── README.md                       # This file
└── CONTRIBUTING.md                 # Contribution guidelines
```

## 🛠️ Sample Projects

### 1. CLI Automation

Automate your daily workflows with Work IQ CLI:

```javascript
// samples/cli-automation/daily-briefing.js
const { execSync } = require('child_process');

function getDailyBriefing() {
  console.log('📅 Generating Daily Briefing...\n');
  
  // Get today's meetings
  const meetings = execSync(
    'workiq ask -q "What meetings do I have today?"'
  ).toString();
  
  console.log('MEETINGS:\n', meetings);
  
  // Get important emails
  const emails = execSync(
    'workiq ask -q "Show unread emails from my manager"'
  ).toString();
  
  console.log('\nEMAILS:\n', emails);
  
  // Get recent documents
  const docs = execSync(
    'workiq ask -q "What documents did I work on yesterday?"'
  ).toString();
  
  console.log('\nDOCUMENTS:\n', docs);
}

getDailyBriefing();
```

Run it:
```bash
node samples/cli-automation/daily-briefing.js
```

### 2. Dataverse Integration

Set up Dataverse tables for Work IQ context:

```bash
# Import Dataverse schema
cd samples/dataverse/schemas
pac solution import --path ProjectManagement.zip

# Load sample data
node samples/dataverse/sample-data/load-data.js
```

### 3. Copilot Studio Agent

Deploy the Project Status Assistant:

```bash
# Export from samples
cd samples/copilot-studio/project-assistant

# Import to your environment
pac copilot import --path ProjectAssistant_1_0_0_0.zip
```

## 📖 Usage Examples

### Example 1: Meeting Context Extraction

```javascript
// samples/cli-automation/meeting-prep.js
const { extractMeetingContext } = require('./lib/workiq-helper');

async function prepareMeeting(meetingId) {
  const context = await extractMeetingContext(meetingId);
  
  console.log(`
    Meeting: ${context.subject}
    Participants: ${context.participants.join(', ')}
    
    Previous Discussions:
    ${context.previousMeetings}
    
    Related Emails:
    ${context.relatedEmails}
    
    Relevant Documents:
    ${context.documents}
    
    Suggested Agenda:
    ${context.suggestedAgenda}
  `);
}

prepareMeeting('meeting-id-from-calendar');
```

### Example 2: Dataverse + Work IQ Integration

```javascript
// samples/dataverse/queries/project-status.js
const { WebApi } = require('dynamics-web-api');
const { queryWorkIQ } = require('./lib/workiq-client');

async function getProjectStatus(projectId) {
  // Get structured data from Dataverse
  const api = new WebApi({ /* config */ });
  const project = await api.retrieve('cr_project', projectId);
  
  // Get context from Work IQ
  const context = await queryWorkIQ(
    `What was discussed about ${project.cr_name} in the last week?`
  );
  
  return {
    project,
    recentDiscussions: context.meetings,
    emailActivity: context.emails,
    documentUpdates: context.documents,
    teamSentiment: context.sentiment
  };
}
```

### Example 3: Power Automate Flow

```json
// samples/power-automate/meeting-action-items.json
{
  "name": "Extract Meeting Action Items",
  "trigger": {
    "type": "When a calendar event ends",
    "inputs": {
      "calendarId": "primary"
    }
  },
  "actions": [
    {
      "type": "HTTP",
      "name": "Call Work IQ",
      "inputs": {
        "method": "POST",
        "uri": "workiq-mcp-endpoint",
        "body": {
          "query": "Extract action items from meeting: @{triggerBody()?['subject']}"
        }
      }
    },
    {
      "type": "Parse JSON",
      "name": "Parse Action Items",
      "inputs": {
        "content": "@body('Call_Work_IQ')",
        "schema": { /* schema */ }
      }
    },
    {
      "type": "Apply to each",
      "inputs": {
        "forEach": "@body('Parse_Action_Items')?['items']",
        "actions": [
          {
            "type": "Create record",
            "inputs": {
              "entityName": "cr_projecttask",
              "item": {
                "cr_name": "@{items('Apply_to_each')?['title']}",
                "cr_description": "@{items('Apply_to_each')?['description']}",
                "cr_sourcetype": "Meeting",
                "cr_status": "To Do"
              }
            }
          }
        ]
      }
    }
  ]
}
```

## 🧪 Testing

Run the test suite:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Work IQ Integration"

# Run with coverage
npm run test:coverage
```

## 📊 Monitoring

Set up monitoring for your Work IQ implementation:

```bash
# Configure Application Insights
node tools/monitoring-setup.js --environment prod

# View real-time metrics
node tools/monitor-dashboard.js
```

## 🔒 Security

### Authentication

Work IQ uses OAuth 2.0 with Azure AD:

```javascript
// samples/lib/auth.js
const msal = require('@azure/msal-node');

const config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientSecret: process.env.CLIENT_SECRET
  }
};

const cca = new msal.ConfidentialClientApplication(config);

async function getToken() {
  const tokenResponse = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default']
  });
  return tokenResponse.accessToken;
}
```

### Data Protection

- All data encrypted in transit (TLS 1.2+)
- Encryption at rest in Dataverse
- Work IQ doesn't store data
- Audit logging enabled

See [Security Guide](./docs/architecture/security.md) for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Microsoft Work IQ team
- Power Platform community
- All contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/workiq-implementation-guide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/workiq-implementation-guide/discussions)
- **Blog Series**: [Link to blog]
- **LinkedIn**: [Your LinkedIn]

## 🗺️ Roadmap

- [ ] Additional Copilot Studio agent templates
- [ ] More Power Automate flow examples
- [ ] Advanced analytics dashboards
- [ ] Multi-language support
- [ ] Video tutorials
- [ ] Community showcase

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/workiq-implementation-guide&type=Date)](https://star-history.com/#yourusername/workiq-implementation-guide&Date)

---

**Built with ❤️ by the Power Platform Community**

[⬆ back to top](#microsoft-work-iq-complete-implementation-guide)
