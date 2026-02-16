/**
 * Meeting Preparation Automation
 * 
 * Automatically prepares context and materials for upcoming meetings
 * using Work IQ intelligence.
 */

const { WorkIQHelper, Logger, DateUtils } = require('./lib/workiq-helper');
const fs = require('fs');
const path = require('path');

class MeetingPrep {
  constructor(tenantId = null) {
    this.workiq = new WorkIQHelper({ tenantId });
  }

  /**
   * Get meetings for preparation
   */
  async getUpcomingMeetings(timeframe = 'today') {
    Logger.info(`Fetching meetings for: ${timeframe}`);
    
    const query = `What meetings do I have ${timeframe}? Include time, participants, and subject.`;
    const result = this.workiq.query(query);
    
    return this.parseMeetings(result);
  }

  /**
   * Parse meetings from Work IQ response
   */
  parseMeetings(response) {
    // This is a simple parser - in production, you'd want more robust parsing
    const meetings = [];
    const lines = response.split('\n');
    
    let currentMeeting = null;
    
    lines.forEach(line => {
      if (line.match(/^\d+\./)) {
        if (currentMeeting) {
          meetings.push(currentMeeting);
        }
        currentMeeting = {
          title: line.replace(/^\d+\.\s*/, '').trim(),
          time: '',
          participants: [],
          details: ''
        };
      } else if (currentMeeting) {
        if (line.includes('Time:')) {
          currentMeeting.time = line.replace(/.*Time:\s*/, '').trim();
        } else if (line.includes('Participants:')) {
          currentMeeting.participants = line
            .replace(/.*Participants:\s*/, '')
            .split(',')
            .map(p => p.trim());
        }
      }
    });
    
    if (currentMeeting) {
      meetings.push(currentMeeting);
    }
    
    return meetings;
  }

  /**
   * Prepare context for a specific meeting
   */
  async prepareMeetingContext(meeting) {
    Logger.info(`Preparing context for: ${meeting.title}`);
    
    const context = {
      meeting,
      previousMeetings: null,
      relatedEmails: null,
      relevantDocuments: null,
      participantInfo: null,
      suggestedAgenda: null,
      actionItems: null
    };

    try {
      // Get previous meetings on same topic
      context.previousMeetings = this.workiq.query(
        `What were previous meetings about "${meeting.title}" or similar topics?`
      );
    } catch (error) {
      Logger.warn('Could not fetch previous meetings');
    }

    try {
      // Get related emails
      context.relatedEmails = this.workiq.query(
        `Summarize recent emails related to "${meeting.title}"`
      );
    } catch (error) {
      Logger.warn('Could not fetch related emails');
    }

    try {
      // Get relevant documents
      context.relevantDocuments = this.workiq.query(
        `Find documents related to "${meeting.title}"`
      );
    } catch (error) {
      Logger.warn('Could not fetch relevant documents');
    }

    try {
      // Get participant information
      if (meeting.participants.length > 0) {
        const participantNames = meeting.participants.slice(0, 3).join(', ');
        context.participantInfo = this.workiq.query(
          `What recent work have ${participantNames} been involved in?`
        );
      }
    } catch (error) {
      Logger.warn('Could not fetch participant info');
    }

    try {
      // Get pending action items
      context.actionItems = this.workiq.query(
        `What action items or commitments are related to "${meeting.title}"?`
      );
    } catch (error) {
      Logger.warn('Could not fetch action items');
    }

    return context;
  }

  /**
   * Generate meeting brief
   */
  generateBrief(context) {
    let brief = '';
    
    brief += '═'.repeat(80) + '\n';
    brief += `MEETING PREPARATION BRIEF\n`;
    brief += `${context.meeting.title}\n`;
    brief += `${context.meeting.time}\n`;
    brief += '═'.repeat(80) + '\n\n';

    brief += `📋 PARTICIPANTS\n`;
    brief += '─'.repeat(80) + '\n';
    if (context.meeting.participants.length > 0) {
      context.meeting.participants.forEach(p => {
        brief += `• ${p}\n`;
      });
    } else {
      brief += 'Not specified\n';
    }
    brief += '\n';

    if (context.previousMeetings) {
      brief += `📅 PREVIOUS MEETINGS\n`;
      brief += '─'.repeat(80) + '\n';
      brief += context.previousMeetings + '\n\n';
    }

    if (context.relatedEmails) {
      brief += `📧 RELATED EMAIL DISCUSSIONS\n`;
      brief += '─'.repeat(80) + '\n';
      brief += context.relatedEmails + '\n\n';
    }

    if (context.relevantDocuments) {
      brief += `📄 RELEVANT DOCUMENTS\n`;
      brief += '─'.repeat(80) + '\n';
      brief += context.relevantDocuments + '\n\n';
    }

    if (context.participantInfo) {
      brief += `👥 PARTICIPANT CONTEXT\n`;
      brief += '─'.repeat(80) + '\n';
      brief += context.participantInfo + '\n\n';
    }

    if (context.actionItems) {
      brief += `✅ PENDING ACTION ITEMS\n`;
      brief += '─'.repeat(80) + '\n';
      brief += context.actionItems + '\n\n';
    }

    brief += '═'.repeat(80) + '\n';
    brief += `Generated: ${new Date().toLocaleString()}\n`;
    brief += '═'.repeat(80) + '\n';

    return brief;
  }

  /**
   * Save brief to file
   */
  saveBrief(brief, meeting) {
    const outputDir = path.join(__dirname, 'output', 'meeting-briefs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `${DateUtils.formatDate(new Date())}-${meeting.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, brief);
    Logger.info(`Brief saved: ${filepath}`);

    return filepath;
  }

  /**
   * Prepare for all upcoming meetings
   */
  async prepareAll(timeframe = 'today') {
    const meetings = await this.getUpcomingMeetings(timeframe);
    
    if (meetings.length === 0) {
      Logger.info(`No meetings found for ${timeframe}`);
      return [];
    }

    Logger.info(`Found ${meetings.length} meeting(s) to prepare for`);

    const briefs = [];
    for (const meeting of meetings) {
      const context = await this.prepareMeetingContext(meeting);
      const brief = this.generateBrief(context);
      const filepath = this.saveBrief(brief, meeting);
      
      briefs.push({
        meeting,
        filepath,
        brief
      });

      // Display to console
      console.log('\n' + brief + '\n');
    }

    return briefs;
  }

  /**
   * Prepare for next N hours of meetings
   */
  async prepareNextHours(hours = 2) {
    Logger.info(`Preparing for meetings in the next ${hours} hour(s)`);
    
    const query = `What meetings do I have in the next ${hours} hours?`;
    const result = this.workiq.query(query);
    const meetings = this.parseMeetings(result);

    if (meetings.length === 0) {
      Logger.info('No meetings in the specified timeframe');
      return [];
    }

    const briefs = [];
    for (const meeting of meetings) {
      const context = await this.prepareMeetingContext(meeting);
      const brief = this.generateBrief(context);
      
      briefs.push({
        meeting,
        brief
      });
    }

    return briefs;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const tenantId = process.env.WORKIQ_TENANT_ID || args[0];
  const timeframe = args[1] || 'today';

  console.log('\nMeeting Preparation Tool');
  console.log('═'.repeat(80));

  const prep = new MeetingPrep(tenantId);

  try {
    if (timeframe === 'next' && args[2]) {
      // Prepare for next N hours
      const hours = parseInt(args[2]);
      await prep.prepareNextHours(hours);
    } else {
      // Prepare for timeframe (today, tomorrow, this week)
      await prep.prepareAll(timeframe);
    }

    Logger.info('Meeting preparation completed!');
  } catch (error) {
    Logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MeetingPrep };
