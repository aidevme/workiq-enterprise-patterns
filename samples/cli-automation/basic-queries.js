/**
 * Basic Work IQ Queries
 * 
 * This module demonstrates basic Work IQ CLI integration patterns.
 * Requires: @microsoft/workiq installed globally (npm install -g @microsoft/workiq)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class WorkIQClient {
  constructor(tenantId = null) {
    this.tenantId = tenantId;
    this.cacheDir = path.join(__dirname, '.cache');
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Execute Work IQ query with caching
   */
  query(question, useCache = true) {
    const cacheKey = this.getCacheKey(question);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    // Check cache
    if (useCache && fs.existsSync(cachePath)) {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const age = Date.now() - cached.timestamp;
      
      // Cache valid for 1 hour
      if (age < 3600000) {
        console.log('  [CACHE HIT]');
        return cached.result;
      }
    }

    // Build command
    let cmd = `workiq ask -q "${question.replace(/"/g, '\\"')}"`;
    if (this.tenantId) {
      cmd += ` -t "${this.tenantId}"`;
    }

    console.log('  [Querying Work IQ...]');
    
    try {
      const result = execSync(cmd, { 
        encoding: 'utf8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      // Cache result
      if (useCache) {
        fs.writeFileSync(cachePath, JSON.stringify({
          question,
          result: result.trim(),
          timestamp: Date.now()
        }));
      }

      return result.trim();
    } catch (error) {
      console.error('  [ERROR]', error.message);
      return null;
    }
  }

  /**
   * Generate cache key from question
   */
  getCacheKey(question) {
    return require('crypto')
      .createHash('md5')
      .update(question)
      .digest('hex');
  }

  /**
   * Clear cache
   */
  clearCache() {
    if (fs.existsSync(this.cacheDir)) {
      fs.readdirSync(this.cacheDir).forEach(file => {
        fs.unlinkSync(path.join(this.cacheDir, file));
      });
      console.log('Cache cleared');
    }
  }
}

// ============================================================================
// Example Queries
// ============================================================================

/**
 * Calendar Queries
 */
function calendarQueries(client) {
  console.log('\n📅 CALENDAR QUERIES\n' + '='.repeat(50));

  const queries = [
    'What meetings do I have today?',
    'Show my calendar for tomorrow',
    'When is my next meeting with Sarah?',
    'Summarize my meetings this week'
  ];

  queries.forEach(query => {
    console.log(`\nQ: ${query}`);
    const result = client.query(query);
    if (result) {
      console.log(`A: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`);
    }
  });
}

/**
 * Email Queries
 */
function emailQueries(client) {
  console.log('\n📧 EMAIL QUERIES\n' + '='.repeat(50));

  const queries = [
    'Show my emails from today',
    'What unread emails do I have?',
    'Summarize emails about the budget',
    'What did Alex say in his last email?'
  ];

  queries.forEach(query => {
    console.log(`\nQ: ${query}`);
    const result = client.query(query);
    if (result) {
      console.log(`A: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`);
    }
  });
}

/**
 * Document Queries
 */
function documentQueries(client) {
  console.log('\n📄 DOCUMENT QUERIES\n' + '='.repeat(50));

  const queries = [
    'What documents did I work on yesterday?',
    'Find documents about authentication',
    'What files did I share this week?',
    'Where is the Q4 planning document?'
  ];

  queries.forEach(query => {
    console.log(`\nQ: ${query}`);
    const result = client.query(query);
    if (result) {
      console.log(`A: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`);
    }
  });
}

/**
 * Teams Queries
 */
function teamsQueries(client) {
  console.log('\n💬 TEAMS QUERIES\n' + '='.repeat(50));

  const queries = [
    'Summarize messages in the Engineering channel today',
    'What did the team discuss in our last chat?',
    'Show recent activity in the Payment Integration channel'
  ];

  queries.forEach(query => {
    console.log(`\nQ: ${query}`);
    const result = client.query(query);
    if (result) {
      console.log(`A: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`);
    }
  });
}

/**
 * People Queries
 */
function peopleQueries(client) {
  console.log('\n👥 PEOPLE QUERIES\n' + '='.repeat(50));

  const queries = [
    'Who works on the payment integration?',
    'What is Sarah\'s email address?',
    'Who is on the development team?',
    'Find people who know about OAuth'
  ];

  queries.forEach(query => {
    console.log(`\nQ: ${query}`);
    const result = client.query(query);
    if (result) {
      console.log(`A: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`);
    }
  });
}

/**
 * Combined Context Queries
 */
function contextQueries(client) {
  console.log('\n🔍 CONTEXT QUERIES\n' + '='.repeat(50));

  const queries = [
    'What were the action items from yesterday\'s standup?',
    'Summarize all activity about the payment project',
    'What decisions were made about authentication?',
    'Who has been discussing the budget recently?'
  ];

  queries.forEach(query => {
    console.log(`\nQ: ${query}`);
    const result = client.query(query);
    if (result) {
      console.log(`A: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`);
    }
  });
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('Work IQ CLI - Basic Queries Demo');
  console.log('='.repeat(50));
  
  // Check if Work IQ is installed
  try {
    execSync('workiq version', { encoding: 'utf8' });
  } catch (error) {
    console.error('\n❌ Work IQ CLI not found!');
    console.error('Please install: npm install -g @microsoft/workiq');
    console.error('Then run: workiq accept-eula');
    process.exit(1);
  }

  // Get tenant ID from environment or command line
  const tenantId = process.env.WORKIQ_TENANT_ID || process.argv[2];
  
  // Create client
  const client = new WorkIQClient(tenantId);

  // Run example queries
  try {
    // Uncomment the query types you want to test
    calendarQueries(client);
    // emailQueries(client);
    // documentQueries(client);
    // teamsQueries(client);
    // peopleQueries(client);
    // contextQueries(client);

    console.log('\n\n✅ Demo completed!');
    console.log('\nTips:');
    console.log('- Results are cached for 1 hour');
    console.log('- Run with tenant ID: node basic-queries.js <tenant-id>');
    console.log('- Clear cache: node basic-queries.js --clear-cache');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--clear-cache')) {
  const client = new WorkIQClient();
  client.clearCache();
} else if (require.main === module) {
  main();
}

// Export for use in other modules
module.exports = { WorkIQClient };
