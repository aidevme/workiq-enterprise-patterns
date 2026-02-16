# Hands-On: Setting Up Microsoft Work IQ CLI and Testing Your First Queries

*Part 2 of 4: Microsoft Work IQ Series*

## Introduction

In [Part 1](link-to-part-1), we explored the architecture and concepts behind Work IQ. Now it's time to get our hands dirty. In this tutorial, we'll install the Work IQ CLI, configure it, and run our first intelligent queries against your Microsoft 365 data.

By the end of this article, you'll have a working Work IQ setup and understand how to leverage it in your development workflow.

## Prerequisites

Before we start, make sure you have:

- **Node.js**: Version 18.x or higher ([Download here](https://nodejs.org/))
- **Microsoft 365 Account**: With access to email, calendar, Teams
- **Microsoft 365 Copilot License**: Required for Work IQ access
- **Admin Consent**: You'll need tenant admin approval (we'll cover this)
- **Terminal/Command Line**: Bash, PowerShell, or Command Prompt

**Platform Support**: Windows (x64/ARM64), Linux (x64/ARM64), macOS (x64/ARM64), WSL

## Understanding the Installation Options

Work IQ can be installed in two ways:

### Option 1: GitHub Copilot CLI Plugin (Recommended for Copilot Users)
- Integrates directly into Copilot CLI
- Auto-invokes Work IQ as a tool
- Best for AI-assisted coding workflows

### Option 2: Standalone MCP Server (Recommended for Developers)
- Run Work IQ independently
- Direct CLI access
- Better for scripting and automation
- What we'll use in this tutorial

## Step 1: Verify Node.js Installation

Open your terminal and check Node.js version:

```bash
node --version
```

You should see something like `v18.17.0` or higher. If not, install Node.js first.

## Step 2: Install Work IQ CLI

Install Work IQ globally using npm:

```bash
npm install -g @microsoft/workiq
```

**Expected Output**:
```
added 1 package in 3s
```

Verify installation:

```bash
workiq version
```

**Expected Output**:
```
@microsoft/workiq version 1.x.x
```

## Step 3: Accept the EULA

On first use, you must accept the End User License Agreement:

```bash
workiq accept-eula
```

**Expected Output**:
```
EULA accepted successfully.
```

This creates a configuration file in your home directory that stores the acceptance.

## Step 4: Understanding Admin Consent

Work IQ requires permissions to access your Microsoft 365 data. These permissions need **admin consent** at the tenant level.

### Required Permissions

Work IQ requests these **delegated** (read-only) permissions:

| Permission | Purpose |
|------------|---------|
| `Sites.Read.All` | Access SharePoint documents |
| `Mail.Read` | Read emails |
| `People.Read.All` | Access organizational directory |
| `OnlineMeetingTranscript.Read.All` | Read meeting transcripts |
| `Chat.Read` | Read Teams chats |
| `ChannelMessage.Read.All` | Read Teams channel messages |
| `ExternalItem.Read.All` | Read external content |

### For Tenant Administrators

If you're a tenant admin, you can grant consent using this PowerShell script:

```powershell
# Connect to Microsoft Graph
Connect-MgGraph -Scopes "Application.ReadWrite.All", "DelegatedPermissionGrant.ReadWrite.All"

# Get the Work IQ service principal
$workIqApp = Get-MgServicePrincipal -Filter "displayName eq 'Work IQ CLI'"

# Get Microsoft Graph service principal
$graphSp = Get-MgServicePrincipal -Filter "displayName eq 'Microsoft Graph'"

# Define required scopes
$requiredScopes = "Sites.Read.All Mail.Read People.Read.All OnlineMeetingTranscript.Read.All Chat.Read ChannelMessage.Read.All ExternalItem.Read.All"

# Grant consent
$params = @{
    ClientId = $workIqApp.Id
    ConsentType = "AllPrincipals"
    ResourceId = $graphSp.Id
    Scope = $requiredScopes
}

New-MgOauth2PermissionGrant -BodyParameter $params

# Verify
Get-MgOauth2PermissionGrant -Filter "clientId eq '$($workIqApp.Id)'"
```

**Quick One-Click Consent URL**:
```
https://login.microsoftonline.com/{your-tenant-id}/adminconsent?client_id=ba081686-5d24-4bc6-a0d6-d034ecffed87
```

Replace `{your-tenant-id}` with your actual tenant ID or domain name (e.g., `contoso.onmicrosoft.com`).

### For Non-Administrators

If you're not an admin, send this request to your IT department:

```
Subject: Request for Work IQ CLI Admin Consent

Hi IT Team,

I need admin consent for the Work IQ CLI tool to access my Microsoft 365 data for development purposes.

Application ID: ba081686-5d24-4bc6-a0d6-d034ecffed87
Documentation: https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/workiq-overview

Required Permissions (all read-only):
- Sites.Read.All
- Mail.Read
- People.Read.All
- OnlineMeetingTranscript.Read.All
- Chat.Read
- ChannelMessage.Read.All
- ExternalItem.Read.All

Please grant tenant-wide admin consent using the PowerShell script in the documentation.

Thank you!
```

## Step 5: Your First Work IQ Query

Now let's run your first query! Work IQ will prompt for authentication on first use.

### Basic Interactive Mode

```bash
workiq ask
```

This starts interactive mode. You'll see:

```
Opening browser for authentication...
```

**What Happens**:
1. Your default browser opens
2. You sign in with your Microsoft 365 account
3. You're asked to grant permissions (if not already admin-consented)
4. Browser shows "Authentication complete"
5. Terminal returns to interactive prompt

Now you can ask questions:

```
> What meetings do I have today?
```

**Expected Response**:
```
You have 3 meetings today:

1. Daily Standup
   Time: 9:00 AM - 9:15 AM
   Organizer: Sarah Chen
   Join: [Teams Link]

2. Design Review: Payment Integration
   Time: 2:00 PM - 3:00 PM
   Organizer: Alex Kumar
   Participants: You, Alex, Maria, Dev Team
   Join: [Teams Link]

3. 1:1 with Manager
   Time: 4:00 PM - 4:30 PM
   Organizer: Michael Roberts
   Join: [Teams Link]
```

### Direct Query Mode

Instead of interactive mode, you can ask questions directly:

```bash
workiq ask -q "What meetings do I have today?"
```

This is better for scripting and automation.

## Step 6: Testing Different Query Types

Let's explore what Work IQ can do:

### 1. Calendar Queries

```bash
# Today's meetings
workiq ask -q "What meetings do I have today?"

# Tomorrow's schedule
workiq ask -q "Show my calendar for tomorrow"

# Specific person meetings
workiq ask -q "When is my next meeting with Sarah?"

# This week overview
workiq ask -q "Summarize my meetings this week"
```

### 2. Email Queries

```bash
# Recent emails
workiq ask -q "Show my emails from today"

# Specific sender
workiq ask -q "What did Alex say about the payment integration?"

# Topic-based
workiq ask -q "Summarize emails about the budget"

# Unread emails
workiq ask -q "What unread emails do I have?"
```

### 3. Document Queries

```bash
# Recent documents
workiq ask -q "What documents did I work on yesterday?"

# Topic search
workiq ask -q "Find documents about authentication"

# Collaboration
workiq ask -q "What files did I share with the team this week?"

# Specific document
workiq ask -q "Where is the Q4 planning document?"
```

### 4. Teams & Collaboration

```bash
# Teams messages
workiq ask -q "Summarize messages in the Engineering channel today"

# Chat history
workiq ask -q "What did Sarah and I discuss in our last chat?"

# Team activity
workiq ask -q "What's the latest update on the payment project?"
```

### 5. People & Organizational

```bash
# Finding people
workiq ask -q "Who works on the payment integration?"

# Contact info
workiq ask -q "What's Sarah's email address?"

# Team structure
workiq ask -q "Who is on the development team?"
```

## Step 7: Using Work IQ with Different Tenants

If you work with multiple Microsoft 365 tenants, you can specify which one to use:

```bash
workiq ask -t "contoso.onmicrosoft.com" -q "What meetings do I have today?"
```

Or use the tenant ID:

```bash
workiq ask -t "72f988bf-86f1-41af-91ab-2d7cd011db47" -q "Show my emails"
```

### Switching Tenants

Work IQ caches authentication. To switch tenants:

1. Clear the cached credentials (location varies by OS)
2. Run a new query with the `-t` flag
3. Sign in with the new tenant account

**Finding Your Tenant ID**:
```powershell
# PowerShell
Connect-AzureAD
Get-AzureADTenantDetail | Select-Object ObjectId
```

## Step 8: Running as an MCP Server

For integration with other tools (like Claude Desktop, VS Code extensions), you can run Work IQ as an MCP server:

```bash
workiq mcp
```

This starts the MCP server in stdio mode. The server waits for JSON-RPC requests and responds accordingly.

**MCP Configuration Example** (for claude_desktop_config.json):

```json
{
  "mcpServers": {
    "workiq": {
      "command": "npx",
      "args": ["-y", "@microsoft/workiq", "mcp"]
    }
  }
}
```

## Step 9: Practical Development Workflow Examples

Now let's look at real scenarios where Work IQ shines:

### Scenario 1: Starting Your Day

Create a morning script:

```bash
#!/bin/bash
# morning-brief.sh

echo "📅 Today's Meetings"
workiq ask -q "What meetings do I have today?"

echo "\n📧 Important Emails"
workiq ask -q "Show unread emails from my manager or team leads"

echo "\n📄 Recent Activity"
workiq ask -q "What documents were shared with me yesterday?"
```

Run it:
```bash
chmod +x morning-brief.sh
./morning-brief.sh
```

### Scenario 2: Project Context Gathering

Before starting work on a feature:

```bash
# Get context for payment integration work
workiq ask -q "What were the authentication requirements discussed for the payment integration?"

# Find related documents
workiq ask -q "Find all documents about payment integration from the last month"

# Check team communication
workiq ask -q "Summarize Teams discussions about payment security"
```

### Scenario 3: Meeting Preparation

Before a client meeting:

```bash
# Get last meeting context
workiq ask -q "What was discussed in the last meeting with Contoso?"

# Find action items
workiq ask -q "What were the action items from the Contoso project review?"

# Get relevant documents
workiq ask -q "Find presentation materials about Contoso project"
```

### Scenario 4: Code Review Context

When reviewing code:

```bash
# Find who owns the module
workiq ask -q "Who has been working on the authentication module?"

# Get design decisions
workiq ask -q "What design decisions were made about OAuth implementation?"

# Check for related discussions
workiq ask -q "Were there any security concerns raised about authentication?"
```

## Step 10: Troubleshooting Common Issues

### Issue 1: "Authentication Failed"

**Symptoms**: Browser opens but authentication doesn't complete

**Solutions**:
1. Check you're signing in with the correct account
2. Verify admin consent has been granted
3. Try clearing browser cache and cookies
4. Use incognito/private browsing mode

### Issue 2: "Insufficient Permissions"

**Symptoms**: Authentication works, but queries return permission errors

**Solutions**:
1. Verify admin consent was granted for all required permissions
2. Check you have a Copilot license assigned
3. Wait 24 hours after license assignment (propagation time)

### Issue 3: "No Data Returned"

**Symptoms**: Queries complete but return empty results

**Solutions**:
1. Verify you have actual data (emails, meetings) in your account
2. Check date ranges in your queries
3. Try broader queries first
4. Ensure you have access to the data you're querying

### Issue 4: WSL Browser Launch Issues

**Symptoms**: On WSL, browser doesn't launch

**Solutions**:
```bash
# Install browser support
sudo apt install xdg-utils
sudo apt install wslu
```

### Issue 5: Slow Responses

**Symptoms**: Queries take a long time to complete

**Solutions**:
1. This is normal for first queries (indexing)
2. Subsequent queries are faster
3. More specific queries perform better
4. Check your network connection

## Step 11: Best Practices

### Query Formulation

**Good Queries**:
- "What did Sarah say about the budget?"
- "Find documents I worked on this week"
- "Summarize today's Engineering channel messages"

**Poor Queries**:
- "Everything" (too broad)
- "Find it" (no context)
- "What's up?" (too vague)

### Security Considerations

1. **Never share authentication tokens** - Work IQ uses OAuth, don't share credentials
2. **Use tenant-specific queries** - Specify tenant ID when working with multiple
3. **Be aware of data scope** - Work IQ sees what YOU can see
4. **Audit usage** - IT can monitor Work IQ queries

### Performance Tips

1. **Be specific** - Narrow queries are faster
2. **Use date ranges** - "this week" vs. "all time"
3. **Cache results** - For scripts, store responses temporarily
4. **Batch related queries** - Instead of multiple calls, ask compound questions

## What's Next?

Now that you have Work IQ running, you can:

1. **Experiment** with different query types
2. **Build scripts** to automate your workflow
3. **Integrate** with other tools via MCP
4. **Prepare** for Part 3: Building agents in Copilot Studio

## Coming Up: Part 3

In the next article, we'll take Work IQ into Copilot Studio and build a custom agent that:
- Uses Work IQ for context
- Integrates with Dataverse
- Handles multi-step workflows
- Deploys to Microsoft Teams

## Key Takeaways

1. ✅ Work IQ installs via npm in minutes
2. ✅ Admin consent is required but straightforward
3. ✅ Natural language queries work out-of-the-box
4. ✅ MCP mode enables integration with other tools
5. ✅ Perfect for automating daily workflows

## Try This Challenge

Before Part 3, try building a simple automation:

**Task**: Create a script that generates a weekly summary report including:
- Meetings attended
- Important emails received
- Documents you worked on
- Key decisions made

Share your solution in the comments or on GitHub!

---

## Resources

- [Official Work IQ CLI Documentation](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/workiq-overview)
- [Admin Consent Guide](https://github.com/microsoft/work-iq-mcp/blob/main/ADMIN-INSTRUCTIONS.md)
- [Sample Scripts Repository](https://github.com/yourusername/work-iq-samples)

---

**Next in Series**: Part 3 - Building Work IQ-Powered Agents in Copilot Studio

*Questions? Drop them in the comments or connect with me on [LinkedIn](https://linkedin.com)!*