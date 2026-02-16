# Work IQ Implementation Guide - Setup Instructions

## Overview

This guide walks you through setting up the complete Work IQ implementation with Power Platform and Dataverse.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Microsoft 365 Copilot License** - Required for Work IQ access
- [ ] **Power Platform Environment** - With Dataverse database
- [ ] **Node.js 18+** - [Download here](https://nodejs.org/)
- [ ] **Git** - For cloning the repository
- [ ] **Admin Access** - Or ability to request admin consent
- [ ] **Code Editor** - VS Code recommended

## Part 1: Work IQ CLI Setup

### Step 1: Install Work IQ CLI

Open your terminal and run:

```bash
# Install globally
npm install -g @microsoft/workiq

# Verify installation
workiq version
```

Expected output:
```
@microsoft/workiq version 1.x.x
```

### Step 2: Accept EULA

```bash
workiq accept-eula
```

Expected output:
```
EULA accepted successfully.
```

### Step 3: Test Connection

```bash
workiq ask -q "What meetings do I have today?"
```

This will:
1. Open a browser for authentication
2. Ask you to sign in with your M365 account
3. Request permission grants (if not already admin-consented)
4. Return your meetings

If you see "Authentication failed" or "Insufficient permissions", proceed to Admin Consent setup.

## Part 2: Admin Consent Setup

### For Tenant Administrators

#### Option 1: PowerShell Script (Recommended)

```powershell
# 1. Install Microsoft Graph PowerShell SDK
Install-Module Microsoft.Graph -Scope CurrentUser

# 2. Connect to Microsoft Graph
Connect-MgGraph -Scopes "Application.ReadWrite.All", "DelegatedPermissionGrant.ReadWrite.All"

# 3. Get Work IQ service principal (after first user sign-in attempt)
$workIqApp = Get-MgServicePrincipal -Filter "displayName eq 'Work IQ CLI'"

# 4. Get Microsoft Graph service principal
$graphSp = Get-MgServicePrincipal -Filter "displayName eq 'Microsoft Graph'"

# 5. Define required scopes
$requiredScopes = "Sites.Read.All Mail.Read People.Read.All OnlineMeetingTranscript.Read.All Chat.Read ChannelMessage.Read.All ExternalItem.Read.All"

# 6. Grant consent
$params = @{
    ClientId = $workIqApp.Id
    ConsentType = "AllPrincipals"
    ResourceId = $graphSp.Id
    Scope = $requiredScopes
}
New-MgOauth2PermissionGrant -BodyParameter $params

# 7. Verify
Get-MgOauth2PermissionGrant -Filter "clientId eq '$($workIqApp.Id)'"
```

#### Option 2: One-Click Consent URL

Replace `{tenant-id}` with your actual tenant ID or domain (e.g., `contoso.onmicrosoft.com`):

```
https://login.microsoftonline.com/{tenant-id}/adminconsent?client_id=ba081686-5d24-4bc6-a0d6-d034ecffed87
```

### For Non-Administrators

Send this email to your IT department:

```
Subject: Admin Consent Request - Work IQ CLI

Hi IT Team,

I need admin consent for the Work IQ CLI to access Microsoft 365 data for development purposes.

Application Details:
- Name: Work IQ CLI
- Application ID: ba081686-5d24-4bc6-a0d6-d034ecffed87
- Documentation: https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/workiq-overview

Required Permissions (all read-only, delegated):
✓ Sites.Read.All - Access SharePoint documents
✓ Mail.Read - Read emails
✓ People.Read.All - Access organizational directory
✓ OnlineMeetingTranscript.Read.All - Read meeting transcripts
✓ Chat.Read - Read Teams chats
✓ ChannelMessage.Read.All - Read Teams channel messages
✓ ExternalItem.Read.All - Read external content

Please grant tenant-wide admin consent using one of the methods in the setup guide.

Documentation: [Include link to this repository]

Thank you!
```

## Part 3: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/workiq-implementation-guide.git

# Navigate to directory
cd workiq-implementation-guide

# Install dependencies
npm install
```

## Part 4: Environment Configuration

### Create .env File

Create a `.env` file in the root directory:

```env
# Work IQ Configuration
WORKIQ_TENANT_ID=your-tenant-id-or-domain
WORKIQ_CACHE_ENABLED=true
WORKIQ_CACHE_DURATION=3600

# Dataverse Configuration (optional for now)
DATAVERSE_ENVIRONMENT_URL=https://your-org.crm.dynamics.com
DATAVERSE_CLIENT_ID=your-app-registration-client-id
DATAVERSE_CLIENT_SECRET=your-app-registration-client-secret
DATAVERSE_TENANT_ID=your-tenant-id

# Email Configuration (optional)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password

# Monitoring (optional)
APPINSIGHTS_KEY=your-application-insights-key
```

### Find Your Tenant ID

```powershell
# PowerShell
Connect-AzureAD
Get-AzureADTenantDetail | Select-Object ObjectId

# Or via Azure Portal
# Navigate to: Azure Active Directory > Properties > Tenant ID
```

## Part 5: Verify Setup

Run the verification script:

```bash
npm run setup
```

This will check:
- ✅ Node.js version
- ✅ Work IQ CLI installation
- ✅ EULA acceptance
- ✅ Authentication status
- ✅ Permission grants
- ✅ Environment configuration

Expected output:
```
Work IQ Setup Verification
==================================================

✅ Node.js: v18.17.0 (OK)
✅ Work IQ CLI: 1.0.0 (OK)
✅ EULA: Accepted
✅ Authentication: Valid
✅ Permissions: Granted
✅ Environment: Configured

All checks passed! You're ready to use Work IQ.
```

## Part 6: Test Sample Scripts

### Test Basic Queries

```bash
npm run queries
```

This runs `samples/cli-automation/basic-queries.js` with various query types.

### Test Daily Briefing

```bash
npm run briefing
```

This generates your daily briefing and saves it to `samples/cli-automation/output/`.

**Options**:
```bash
# Save as Markdown
node samples/cli-automation/daily-briefing.js [tenant-id] markdown

# Save as HTML
node samples/cli-automation/daily-briefing.js [tenant-id] html

# Email briefing
node samples/cli-automation/daily-briefing.js [tenant-id] html your@email.com
```

## Part 7: Dataverse Setup (Optional for Part 3 & 4)

### Import Dataverse Tables

1. Open [Power Apps](https://make.powerapps.com)
2. Select your environment
3. Navigate to **Solutions** > **Import solution**
4. Upload `templates/dataverse/ProjectManagement_Solution.zip`
5. Click **Next** > **Import**

### Load Sample Data

```bash
node samples/dataverse/sample-data/load-data.js
```

This creates:
- 3 sample projects
- 10 sample tasks
- Sample team assignments

## Part 8: Copilot Studio Setup (Optional for Part 3)

### Import Project Assistant Agent

1. Open [Copilot Studio](https://copilotstudio.microsoft.com)
2. Click **Create** > **Import solution**
3. Upload `samples/copilot-studio/project-assistant/ProjectAssistant_Solution.zip`
4. Configure connections:
   - Microsoft 365
   - Dataverse
5. Publish agent

## Troubleshooting

### Issue: "Work IQ CLI not found"

**Solution**:
```bash
# Reinstall globally
npm install -g @microsoft/workiq --force

# Or use npx (no installation required)
npx -y @microsoft/workiq ask -q "test query"
```

### Issue: "Authentication failed"

**Symptoms**: Browser opens but authentication doesn't complete

**Solutions**:
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Verify you're using the correct M365 account
4. Check admin consent status

### Issue: "Insufficient permissions"

**Symptoms**: Authentication works, but queries return permission errors

**Solutions**:
1. Verify admin consent was granted
2. Check Copilot license assignment
3. Wait 24 hours after license assignment (propagation time)
4. Review required permissions list

### Issue: WSL Browser Launch

**Symptoms**: On WSL, browser doesn't launch for authentication

**Solution**:
```bash
# Install browser support
sudo apt update
sudo apt install xdg-utils wslu
```

### Issue: Slow Responses

**Symptoms**: Queries take >30 seconds

**Solutions**:
1. First queries are slower (indexing)
2. Use more specific queries
3. Enable caching in `.env`
4. Check network connection

## Next Steps

Now that you're set up, continue with the blog series:

1. ✅ **Part 1**: Understand Work IQ Architecture
2. ✅ **Part 2**: Complete this setup guide
3. ⏭️ **Part 3**: Build Copilot Studio Agents
4. ⏭️ **Part 4**: Implement Enterprise Patterns

## Additional Resources

- [Work IQ Documentation](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/workiq-overview)
- [GitHub Repository Issues](https://github.com/yourusername/workiq-implementation-guide/issues)
- [Blog Series](link-to-blog)
- [Community Forums](link-to-community)

## Support

If you encounter issues:

1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Search [GitHub Issues](https://github.com/yourusername/workiq-implementation-guide/issues)
3. Open a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

**Setup Complete!** 🎉

You're now ready to build Work IQ-powered solutions with Power Platform.
