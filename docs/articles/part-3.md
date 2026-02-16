# Building Work IQ-Powered Agents in Copilot Studio

*Part 3 of 4: Microsoft Work IQ Series*

## Introduction

In [Part 1](link-to-part-1) we explored Work IQ architecture, and in [Part 2](link-to-part-2) we got hands-on with the CLI. Now we're ready to build something real: **intelligent agents in Copilot Studio that leverage Work IQ for context-aware automation**.

By the end of this tutorial, you'll have built a production-ready agent that:
- Understands your work context through Work IQ
- Performs actions in Dataverse
- Handles multi-step workflows
- Deploys to Microsoft Teams

## What We're Building

**Project Status Assistant**: An agent that helps you stay on top of project work by:

1. **Morning Briefing**: Summarizes today's meetings, recent emails, and action items
2. **Project Updates**: Tracks project status using Work IQ + Dataverse
3. **Task Management**: Creates and updates tasks based on email/meeting context
4. **Team Coordination**: Identifies blockers and suggests next steps

## Prerequisites

Before we start, ensure you have:

- ✅ Microsoft 365 Copilot license
- ✅ Work IQ CLI installed and tested (see Part 2)
- ✅ Copilot Studio access (included with M365 Copilot)
- ✅ Power Platform environment with Dataverse
- ✅ Admin consent for Work IQ in your tenant

## Architecture Overview

Our agent follows this architecture:

```
┌─────────────────────────────────────────────────────┐
│           User (Teams, Web, Mobile)                  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│          Copilot Studio Agent (Orchestrator)         │
│  • Natural Language Understanding                    │
│  • Multi-turn Conversation                          │
│  • Action Routing                                   │
└─────────────────────────────────────────────────────┘
            │                           │
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│      Work IQ          │   │     Dataverse         │
│  • Meetings context   │   │  • Project records    │
│  • Email summaries    │   │  • Task tracking      │
│  • Document access    │   │  • Team assignments   │
│  • Team messages      │   │  • Status updates     │
└───────────────────────┘   └───────────────────────┘
```

## Step 1: Setting Up Dataverse Tables

First, let's create the data model in Dataverse.

### Create Projects Table

1. Open [Power Apps](https://make.powerapps.com)
2. Select your environment
3. Navigate to **Dataverse** > **Tables**
4. Click **New table** > **New table**

**Table Configuration**:
- **Display name**: Project
- **Plural name**: Projects
- **Primary column**: Project Name

**Add these columns**:

| Column Name | Data Type | Required | Description |
|-------------|-----------|----------|-------------|
| Project Name | Single line of text | Yes | Primary column |
| Description | Multiple lines of text | No | Project description |
| Status | Choice | Yes | Active, On Hold, Completed |
| Priority | Choice | Yes | Low, Medium, High, Critical |
| Start Date | Date | No | Project start date |
| Target Date | Date | No | Expected completion |
| Owner | Lookup (User) | Yes | Project owner |
| Team Members | Multiple lines of text | No | Comma-separated emails |

**Status Choice Values**:
- Active (Value: 1)
- On Hold (Value: 2)
- Completed (Value: 3)
- Cancelled (Value: 4)

**Priority Choice Values**:
- Low (Value: 1)
- Medium (Value: 2)
- High (Value: 3)
- Critical (Value: 4)

### Create Tasks Table

**Table Configuration**:
- **Display name**: Project Task
- **Plural name**: Project Tasks

**Add these columns**:

| Column Name | Data Type | Required | Description |
|-------------|-----------|----------|-------------|
| Task Name | Single line of text | Yes | Primary column |
| Description | Multiple lines of text | No | Task details |
| Project | Lookup (Project) | Yes | Related project |
| Status | Choice | Yes | To Do, In Progress, Done, Blocked |
| Assigned To | Lookup (User) | No | Task assignee |
| Due Date | Date | No | Task due date |
| Source Type | Choice | No | Manual, Email, Meeting, Teams |
| Source Reference | Single line of text | No | Link to source |

**Status Choice Values**:
- To Do (Value: 1)
- In Progress (Value: 2)
- Done (Value: 3)
- Blocked (Value: 4)

**Source Type Choice Values**:
- Manual (Value: 1)
- Email (Value: 2)
- Meeting (Value: 3)
- Teams Message (Value: 4)

### Create Sample Data

Add a few test projects:

```
Project 1:
- Name: "Payment Integration"
- Status: Active
- Priority: High
- Owner: [Your user]

Project 2:
- Name: "Customer Portal"
- Status: Active
- Priority: Medium
- Owner: [Your user]
```

## Step 2: Creating the Copilot Studio Agent

### Create New Agent

1. Open [Copilot Studio](https://copilotstudio.microsoft.com)
2. Click **Create** > **New agent**
3. Choose **Skip to configure**

**Agent Configuration**:
- **Name**: Project Status Assistant
- **Description**: Helps you manage project status using work context
- **Instructions**: 
```
You are a project management assistant that helps users stay on top of their work.
You have access to:
1. Work IQ - to understand the user's work context (meetings, emails, documents)
2. Dataverse - to track projects and tasks

Your personality is professional but friendly. You proactively identify action items
from meetings and emails, and help users stay organized.

When the user asks for project updates, you combine:
- Work IQ data (recent discussions, decisions, emails)
- Dataverse data (project status, tasks, assignments)

Always cite your sources when referencing meetings or emails.
```

### Configure Knowledge Sources

1. In the agent editor, go to **Knowledge**
2. Click **Add knowledge**
3. **Do NOT add general web search** (we want controlled sources)

We'll add Work IQ and Dataverse connections in the next steps.

## Step 3: Connecting Work IQ to Your Agent

### Understanding the Integration

Work IQ integration in Copilot Studio works through the **Microsoft 365 Copilot connection**, which provides access to the Work IQ intelligence layer.

**Important**: Work IQ is not added as a separate connection—it's built into the M365 Copilot foundation.

### Enable Work IQ Context

1. In your agent, go to **Settings** > **AI capabilities**
2. Enable **Use Microsoft 365 data**
3. Configure scope:
   - ✅ Emails
   - ✅ Meetings
   - ✅ Documents
   - ✅ Teams messages

**How This Works**:
When enabled, your agent can invoke Work IQ through natural language. The Copilot Studio runtime automatically determines when to query Work IQ based on user intent.

### Testing Work IQ Integration

In the **Test** pane, try these prompts:

```
User: What meetings do I have today?
```

The agent should respond with your actual meetings (powered by Work IQ).

```
User: Summarize emails about the payment project
```

The agent should summarize relevant emails.

## Step 4: Connecting Dataverse

### Add Dataverse Connection

1. Go to **Settings** > **Connections**
2. Click **Add connection**
3. Search for **Microsoft Dataverse**
4. Click **Connect**
5. Sign in with your account

### Create Actions for Dataverse

Now we'll create custom actions (Topics) that interact with Dataverse.

#### Action 1: Get Active Projects

1. Click **Topics** > **Add a topic** > **From blank**
2. **Name**: Get Active Projects
3. **Trigger phrases**:
   - "show my projects"
   - "list active projects"
   - "what projects am I working on"

**Topic Flow**:

```
1. Question node:
   - "Would you like to see all projects or just high priority ones?"
   - Save response as: filterChoice
   - Options: "All projects", "High priority only"

2. Condition node:
   - If filterChoice = "High priority only"
     ├─ Then: Set variable priorityFilter = "High"
     └─ Else: Set variable priorityFilter = "All"

3. Call Dataverse action:
   - Action: List rows
   - Table: Projects
   - Filter: Status = Active AND (Priority = High OR priorityFilter = "All")
   - Order by: Priority descending
   - Save as: activeProjects

4. Message node:
   - "Here are your active projects:"
   - [Adaptive Card - see below]
```

**Adaptive Card for Projects** (Message node):

```json
{
  "type": "AdaptiveCard",
  "body": [
    {
      "type": "TextBlock",
      "text": "Active Projects",
      "weight": "Bolder",
      "size": "Large"
    },
    {
      "type": "Container",
      "$data": "${activeProjects}",
      "items": [
        {
          "type": "ColumnSet",
          "columns": [
            {
              "type": "Column",
              "width": "stretch",
              "items": [
                {
                  "type": "TextBlock",
                  "text": "${projectname}",
                  "weight": "Bolder"
                },
                {
                  "type": "TextBlock",
                  "text": "${description}",
                  "wrap": true,
                  "isSubtle": true
                }
              ]
            },
            {
              "type": "Column",
              "width": "auto",
              "items": [
                {
                  "type": "TextBlock",
                  "text": "${priority}",
                  "color": "${if(priority == 'High', 'attention', 'default')}"
                },
                {
                  "type": "TextBlock",
                  "text": "${status}",
                  "isSubtle": true
                }
              ]
            }
          ]
        }
      ],
      "separator": true
    }
  ],
  "version": "1.4"
}
```

#### Action 2: Create Task from Meeting

This action extracts action items from meetings using Work IQ.

1. **Name**: Create Task from Meeting
2. **Trigger phrases**:
   - "create task from meeting"
   - "log action item"
   - "add task from today's meeting"

**Topic Flow**:

```
1. Question node:
   - "Which project is this task for?"
   - Save as: projectChoice
   - Get choices from Dataverse (Projects table)

2. Question node:
   - "Which meeting should I check for action items?"
   - Save as: meetingReference

3. Call Power Automate flow (WorkIQ_ExtractActionItems):
   - Input: meetingReference
   - Output: actionItems (array)

4. For each action item:
   - Create row in Dataverse (Project Tasks)
     - Task Name: ${actionItem.title}
     - Description: ${actionItem.description}
     - Project: ${projectChoice}
     - Status: To Do
     - Source Type: Meeting
     - Source Reference: ${meetingReference}

5. Message node:
   - "I've created ${count} tasks from that meeting. Would you like to review them?"
```

**Power Automate Flow** (WorkIQ_ExtractActionItems):

```yaml
Trigger: When Copilot Studio calls this flow

Actions:
1. HTTP Request to Work IQ MCP:
   - Method: POST
   - URI: [Work IQ MCP endpoint]
   - Body:
     {
       "query": "Extract action items from meeting: @{triggerBody()['meetingReference']}"
     }

2. Parse JSON:
   - Content: @{outputs('HTTP')}
   - Schema: [Action items array]

3. Return to Copilot Studio:
   - actionItems: @{body('Parse_JSON')}
```

**Note**: Since Work IQ MCP isn't directly callable from Power Automate yet, we'll use a workaround in the actual implementation (see GitHub repo).

#### Action 3: Daily Briefing

This combines Work IQ context with Dataverse data.

1. **Name**: Daily Briefing
2. **Trigger phrases**:
   - "give me my daily briefing"
   - "what's on my plate today"
   - "morning update"

**Topic Flow**:

```
1. Parallel actions:
   ├─ Get today's meetings from Work IQ
   ├─ Get active tasks from Dataverse (Due Date = Today OR Overdue)
   └─ Get unread important emails from Work IQ

2. Compose message:
   - "Good morning! Here's your briefing for ${formatDate(now(), 'MMMM d')}"
   - 
   - "📅 **Meetings Today** (${count(meetings)})"
   - [List meetings with times and participants]
   - 
   - "✅ **Tasks Due** (${count(tasks)})"
   - [List tasks with project and priority]
   - 
   - "📧 **Important Emails** (${count(emails)})"
   - [List email summaries]

3. Question node:
   - "Would you like me to focus on anything specific?"
```

## Step 5: Testing Your Agent

### Test in Copilot Studio

1. Click **Test your agent** (top right)
2. Try these conversations:

**Conversation 1: Basic Project Status**
```
User: Show my active projects
Agent: [Lists projects from Dataverse]

User: What was discussed about the Payment Integration in yesterday's meeting?
Agent: [Uses Work IQ to find meeting transcript and summarizes]
```

**Conversation 2: Creating Tasks**
```
User: Create a task from today's standup meeting
Agent: Which project is this for?
User: Payment Integration
Agent: Which meeting should I check?
User: Daily Standup at 9 AM
Agent: [Creates tasks based on meeting action items]
```

**Conversation 3: Daily Briefing**
```
User: Give me my daily briefing
Agent: [Combines Work IQ + Dataverse data for comprehensive briefing]
```

### Test in Teams

1. Go to **Publish** > **Publish**
2. Click **Publish**
3. Wait for publishing to complete
4. Click **Availability options**
5. Select **Microsoft Teams**
6. Click **Submit for admin approval** (or **Add to Teams** if you have permissions)

Once approved:
1. Open Microsoft Teams
2. Search for your agent name
3. Start a conversation

## Step 6: Advanced Scenarios

### Multi-Agent Orchestration

You can create specialized agents and orchestrate them:

**Master Agent**: Project Status Assistant (orchestrator)
**Specialized Agents**:
- Meeting Analyzer (deep meeting insights)
- Email Processor (email triage and summarization)
- Task Manager (task creation and tracking)

**Configuration**:
```
In Project Status Assistant:
1. Settings > Connections
2. Add connection to specialized agents
3. Create routing logic based on user intent
```

### Proactive Notifications

Set up the agent to send proactive updates:

**Power Automate Flow**: Daily Briefing Scheduler
```yaml
Trigger: Recurrence (Daily at 8:00 AM)

Actions:
1. List users (who have agent enabled)
2. For each user:
   - Get user's morning briefing (call agent API)
   - Send Teams message with briefing
```

### Integration with External Systems

Connect additional data sources:

- **SharePoint**: For document context
- **Planner**: For task synchronization
- **Azure DevOps**: For development tracking
- **Dynamics 365**: For CRM context

## Step 7: Security and Governance

### Data Access Control

Work IQ respects existing permissions:
- Users only see THEIR emails, meetings, documents
- Dataverse role-based security applies
- Agent actions are logged

### Compliance

**Audit Trail**:
1. Enable Dataverse auditing
2. Track agent actions
3. Monitor Work IQ queries

**Data Residency**:
- Work IQ doesn't store data
- Dataverse data stays in your region
- Complies with M365 data governance

### Admin Controls

IT administrators can:
- Monitor agent usage via Agent 365
- Review Work IQ query logs
- Control agent deployment scope
- Disable agents if needed

## Best Practices

### 1. Design for Conversation

**Good**:
```
User: What's the status of Payment Integration?
Agent: The Payment Integration project is currently Active with High priority. 
       Based on yesterday's team meeting, the OAuth implementation is complete, 
       but security review is pending. Would you like me to create a reminder 
       to follow up with the security team?
```

**Poor**:
```
User: What's the status of Payment Integration?
Agent: Status: Active. Priority: High.
```

### 2. Combine Context Sources Intelligently

Always combine Work IQ context with Dataverse data:
```
"Based on your email thread with Sarah, I see you discussed changing the 
authentication approach. I've updated the Payment Integration project 
notes. There are 3 related tasks currently in progress."
```

### 3. Handle Ambiguity Gracefully

```
User: Update the project
Agent: I found 3 active projects:
       1. Payment Integration
       2. Customer Portal
       3. Mobile App Redesign
       Which one would you like to update?
```

### 4. Provide Actionable Insights

```
Agent: I noticed you have a meeting about Payment Integration at 2 PM, 
       but the design document hasn't been updated since last week. 
       Would you like me to create a reminder to update it before the meeting?
```

## Performance Optimization

### Caching Strategy

Implement caching for frequently accessed data:
```
- Cache Dataverse project list (5 minutes)
- Cache today's meetings (1 hour)
- Invalidate cache on data updates
```

### Efficient Queries

**Good** (specific):
```
"What were the action items from this morning's standup for Payment Integration?"
```

**Poor** (too broad):
```
"Tell me everything about all projects"
```

## Deployment Checklist

Before going to production:

- [ ] Test with multiple user personas
- [ ] Verify permissions and security
- [ ] Set up monitoring and logging
- [ ] Create user documentation
- [ ] Train champion users
- [ ] Plan rollout phases
- [ ] Prepare support escalation path
- [ ] Configure backup and recovery

## Cost Considerations

**Licensing**:
- Microsoft 365 Copilot: Required (~$30/user/month)
- Copilot Studio: Included with M365 Copilot
- Dataverse: May require additional capacity

**Usage Metrics**:
- Monitor messages per user
- Track Dataverse capacity
- Review Work IQ query volume

## Troubleshooting Common Issues

### Issue: Agent Can't Access Work IQ Data

**Solution**:
1. Verify user has M365 Copilot license
2. Check admin consent for Work IQ
3. Ensure "Use Microsoft 365 data" is enabled
4. Test with `workiq ask` CLI directly

### Issue: Dataverse Connections Fail

**Solution**:
1. Verify connection is authenticated
2. Check Dataverse security roles
3. Test connection with simple query
4. Review error logs

### Issue: Agent Gives Generic Responses

**Solution**:
1. Improve agent instructions
2. Add more specific trigger phrases
3. Use Generative Answers with grounding
4. Test different phrasings

## What's Next?

In **Part 4**, we'll explore enterprise patterns:
- Multi-agent workflows
- Advanced Work IQ + Dataverse integration
- Production deployment strategies
- Analytics and optimization

## Key Takeaways

1. ✅ Work IQ integration is seamless in Copilot Studio
2. ✅ Combining Work IQ + Dataverse creates powerful context
3. ✅ Agents can extract action items from meetings automatically
4. ✅ Multi-turn conversations feel natural with proper design
5. ✅ Security and compliance are built-in

## Challenge

Build on this foundation:
- Add more specialized agents
- Create custom analytics dashboards
- Implement advanced workflows
- Share your creation!

---

## Resources

- [GitHub Repository with Full Code](https://github.com/yourusername/workiq-copilot-studio-agent)
- [Copilot Studio Documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Dataverse Documentation](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/)

---

**Next in Series**: Part 4 - Work IQ + Dataverse: Enterprise Agent Patterns

*Questions? Share your agent implementations in the comments!*