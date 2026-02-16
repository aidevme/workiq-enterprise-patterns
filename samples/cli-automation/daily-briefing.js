/**
 * Daily Briefing Automation
 * 
 * Generates a comprehensive daily briefing combining:
 * - Today's meetings
 * - Important emails
 * - Recent documents
 * - Action items
 * 
 * Can be scheduled to run automatically (cron/Task Scheduler)
 */

const { WorkIQClient } = require('./basic-queries');
const fs = require('fs');
const path = require('path');

class DailyBriefing {
  constructor(tenantId = null) {
    this.client = new WorkIQClient(tenantId);
    this.date = new Date();
  }

  /**
   * Get today's meetings
   */
  async getMeetings() {
    console.log('📅 Fetching today\'s meetings...');
    
    const query = 'What meetings do I have today? Include time, participants, and join links.';
    const result = this.client.query(query);
    
    return {
      section: 'Meetings',
      icon: '📅',
      content: result || 'No meetings found'
    };
  }

  /**
   * Get important emails
   */
  async getEmails() {
    console.log('📧 Fetching important emails...');
    
    const queries = [
      'Show unread emails from my manager',
      'Show emails marked as important from today',
      'Show emails that mention action items'
    ];

    const results = [];
    for (const query of queries) {
      const result = this.client.query(query);
      if (result && !result.includes('no emails') && !result.includes('not found')) {
        results.push(result);
      }
    }

    return {
      section: 'Important Emails',
      icon: '📧',
      content: results.length > 0 
        ? results.join('\n\n---\n\n') 
        : 'No important emails'
    };
  }

  /**
   * Get recent documents
   */
  async getDocuments() {
    console.log('📄 Fetching recent documents...');
    
    const query = 'What documents did I work on yesterday? What files were shared with me today?';
    const result = this.client.query(query);
    
    return {
      section: 'Documents',
      icon: '📄',
      content: result || 'No recent documents'
    };
  }

  /**
   * Get action items
   */
  async getActionItems() {
    console.log('✅ Fetching action items...');
    
    const queries = [
      'What action items were mentioned in yesterday\'s meetings?',
      'What tasks do I need to follow up on?',
      'What commitments did I make in recent emails?'
    ];

    const results = [];
    for (const query of queries) {
      const result = this.client.query(query);
      if (result && !result.includes('no action items') && !result.includes('not found')) {
        results.push(result);
      }
    }

    return {
      section: 'Action Items',
      icon: '✅',
      content: results.length > 0 
        ? results.join('\n\n') 
        : 'No pending action items'
    };
  }

  /**
   * Get team updates
   */
  async getTeamUpdates() {
    console.log('👥 Fetching team updates...');
    
    const query = 'Summarize important messages in my Teams channels from yesterday and today';
    const result = this.client.query(query);
    
    return {
      section: 'Team Updates',
      icon: '👥',
      content: result || 'No recent team updates'
    };
  }

  /**
   * Generate full briefing
   */
  async generate() {
    console.log('\n' + '='.repeat(70));
    console.log('GENERATING DAILY BRIEFING');
    console.log('='.repeat(70) + '\n');

    const sections = await Promise.all([
      this.getMeetings(),
      this.getEmails(),
      this.getDocuments(),
      this.getActionItems(),
      this.getTeamUpdates()
    ]);

    return {
      date: this.formatDate(),
      sections,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Format briefing as text
   */
  formatAsText(briefing) {
    let output = '';
    
    output += '╔' + '═'.repeat(68) + '╗\n';
    output += '║' + this.centerText('DAILY BRIEFING', 68) + '║\n';
    output += '║' + this.centerText(briefing.date, 68) + '║\n';
    output += '╚' + '═'.repeat(68) + '╝\n\n';

    briefing.sections.forEach(section => {
      output += `${section.icon} ${section.section}\n`;
      output += '─'.repeat(70) + '\n';
      output += section.content + '\n\n';
    });

    output += '─'.repeat(70) + '\n';
    output += `Generated: ${new Date(briefing.generatedAt).toLocaleString()}\n`;

    return output;
  }

  /**
   * Format briefing as Markdown
   */
  formatAsMarkdown(briefing) {
    let output = `# Daily Briefing\n\n`;
    output += `**${briefing.date}**\n\n`;
    output += '---\n\n';

    briefing.sections.forEach(section => {
      output += `## ${section.icon} ${section.section}\n\n`;
      output += section.content + '\n\n';
    });

    output += '---\n\n';
    output += `*Generated: ${new Date(briefing.generatedAt).toLocaleString()}*\n`;

    return output;
  }

  /**
   * Format briefing as HTML
   */
  formatAsHTML(briefing) {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Daily Briefing - ${briefing.date}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 30px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0078D4;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0078D4;
      margin: 0;
    }
    .header .date {
      color: #666;
      font-size: 18px;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-left: 4px solid #0078D4;
      border-radius: 4px;
    }
    .section-title {
      font-size: 24px;
      margin-bottom: 15px;
      color: #333;
    }
    .section-content {
      color: #555;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Briefing</h1>
      <div class="date">${briefing.date}</div>
    </div>
`;

    briefing.sections.forEach(section => {
      html += `
    <div class="section">
      <div class="section-title">${section.icon} ${section.section}</div>
      <div class="section-content">${section.content}</div>
    </div>
`;
    });

    html += `
    <div class="footer">
      Generated: ${new Date(briefing.generatedAt).toLocaleString()}
    </div>
  </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Save briefing to file
   */
  saveBriefing(briefing, format = 'text') {
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = this.date.toISOString().split('T')[0];
    let filename, content;

    switch (format) {
      case 'markdown':
        filename = `briefing-${timestamp}.md`;
        content = this.formatAsMarkdown(briefing);
        break;
      case 'html':
        filename = `briefing-${timestamp}.html`;
        content = this.formatAsHTML(briefing);
        break;
      default:
        filename = `briefing-${timestamp}.txt`;
        content = this.formatAsText(briefing);
    }

    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, content);
    
    console.log(`\n✅ Briefing saved: ${filepath}`);
    return filepath;
  }

  /**
   * Email briefing (requires nodemailer)
   */
  async emailBriefing(briefing, recipient) {
    // This would require nodemailer to be installed
    // npm install nodemailer
    
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipient,
        subject: `Daily Briefing - ${briefing.date}`,
        html: this.formatAsHTML(briefing)
      });

      console.log(`\n✅ Briefing emailed to: ${recipient}`);
    } catch (error) {
      console.log('\n⚠️  Email not configured. Install nodemailer and set SMTP_* env vars.');
    }
  }

  /**
   * Helper: Format date
   */
  formatDate() {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return this.date.toLocaleDateString('en-US', options);
  }

  /**
   * Helper: Center text
   */
  centerText(text, width) {
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const tenantId = process.env.WORKIQ_TENANT_ID || process.argv[2];
  const format = process.argv[3] || 'text'; // text, markdown, html
  const email = process.argv[4]; // optional email recipient

  const briefing = new DailyBriefing(tenantId);
  
  try {
    // Generate briefing
    const result = await briefing.generate();

    // Display to console
    console.log('\n' + briefing.formatAsText(result));

    // Save to file
    briefing.saveBriefing(result, format);

    // Email if requested
    if (email) {
      await briefing.emailBriefing(result, email);
    }

    console.log('\n✅ Daily briefing completed!\n');

  } catch (error) {
    console.error('\n❌ Error generating briefing:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DailyBriefing };
