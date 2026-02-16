/**
 * Work IQ Helper Library
 * 
 * Provides utility functions for Work IQ CLI integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Work IQ Helper Class
 */
class WorkIQHelper {
  constructor(options = {}) {
    this.tenantId = options.tenantId || process.env.WORKIQ_TENANT_ID;
    this.cacheEnabled = options.cacheEnabled !== false;
    this.cacheDuration = options.cacheDuration || 3600; // 1 hour default
    this.cacheDir = options.cacheDir || path.join(__dirname, '../.cache');
    this.timeout = options.timeout || 30000; // 30 seconds
    
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
   * Execute Work IQ query
   */
  query(question, options = {}) {
    const useCache = options.useCache !== false && this.cacheEnabled;
    const tenant = options.tenantId || this.tenantId;

    // Check cache
    if (useCache) {
      const cached = this.getFromCache(question, tenant);
      if (cached) {
        return cached;
      }
    }

    // Build command
    let cmd = `workiq ask -q "${this.escapeQuery(question)}"`;
    if (tenant) {
      cmd += ` -t "${tenant}"`;
    }

    try {
      const result = execSync(cmd, {
        encoding: 'utf8',
        timeout: this.timeout,
        maxBuffer: 1024 * 1024 // 1MB
      }).trim();

      // Cache result
      if (useCache) {
        this.saveToCache(question, result, tenant);
      }

      return result;
    } catch (error) {
      throw new Error(`Work IQ query failed: ${error.message}`);
    }
  }

  /**
   * Extract meeting context
   */
  async getMeetingContext(meetingId) {
    const queries = {
      details: `Get details for meeting ID: ${meetingId}`,
      participants: `Who participated in meeting ${meetingId}?`,
      decisions: `What decisions were made in meeting ${meetingId}?`,
      actionItems: `What action items came from meeting ${meetingId}?`,
      documents: `What documents were shared in meeting ${meetingId}?`
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      try {
        results[key] = this.query(query);
      } catch (error) {
        results[key] = null;
        console.warn(`Failed to get ${key} for meeting ${meetingId}`);
      }
    }

    return results;
  }

  /**
   * Get project context from Work IQ
   */
  async getProjectContext(projectName) {
    const queries = {
      meetings: `Find meetings about ${projectName} from the last month`,
      emails: `Summarize emails about ${projectName} from the last week`,
      documents: `Find documents related to ${projectName}`,
      decisions: `What decisions were made about ${projectName}?`,
      team: `Who is working on ${projectName}?`
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      try {
        results[key] = this.query(query);
      } catch (error) {
        results[key] = null;
      }
    }

    return results;
  }

  /**
   * Find subject matter expert
   */
  findExpert(topic) {
    const queries = [
      `Who has written documents about ${topic}?`,
      `Who has led meetings about ${topic}?`,
      `Who frequently discusses ${topic} in emails?`
    ];

    const results = [];
    for (const query of queries) {
      try {
        const result = this.query(query);
        if (result && !result.includes('not found') && !result.includes('no results')) {
          results.push(result);
        }
      } catch (error) {
        // Continue with other queries
      }
    }

    return results.join('\n\n');
  }

  /**
   * Get cache key
   */
  getCacheKey(question, tenant = '') {
    const combined = `${question}:${tenant}`;
    return crypto.createHash('md5').update(combined).digest('hex');
  }

  /**
   * Get from cache
   */
  getFromCache(question, tenant) {
    const cacheKey = this.getCacheKey(question, tenant);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    if (!fs.existsSync(cachePath)) {
      return null;
    }

    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const age = Date.now() - cached.timestamp;

      if (age < this.cacheDuration * 1000) {
        return cached.result;
      }

      // Expired, delete cache file
      fs.unlinkSync(cachePath);
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save to cache
   */
  saveToCache(question, result, tenant) {
    const cacheKey = this.getCacheKey(question, tenant);
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    const data = {
      question,
      result,
      tenant,
      timestamp: Date.now()
    };

    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  }

  /**
   * Clear cache
   */
  clearCache() {
    if (!fs.existsSync(this.cacheDir)) {
      return 0;
    }

    const files = fs.readdirSync(this.cacheDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(this.cacheDir, file));
    });

    return files.length;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    if (!fs.existsSync(this.cacheDir)) {
      return {
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        totalSize: 0
      };
    }

    const files = fs.readdirSync(this.cacheDir);
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    files.forEach(file => {
      const filepath = path.join(this.cacheDir, file);
      const stats = fs.statSync(filepath);
      totalSize += stats.size;

      try {
        const cached = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        const age = Date.now() - cached.timestamp;

        if (age < this.cacheDuration * 1000) {
          validEntries++;
        } else {
          expiredEntries++;
        }
      } catch (error) {
        expiredEntries++;
      }
    });

    return {
      totalEntries: files.length,
      validEntries,
      expiredEntries,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Escape query string for shell
   */
  escapeQuery(query) {
    return query.replace(/"/g, '\\"').replace(/'/g, "\\'");
  }

  /**
   * Format response as JSON
   */
  parseAsJSON(response) {
    // Attempt to extract JSON from response
    try {
      // Try direct parse first
      return JSON.parse(response);
    } catch (e) {
      // Try to extract JSON block
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to extract anything that looks like JSON
      const objectMatch = response.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }

      throw new Error('Could not parse response as JSON');
    }
  }

  /**
   * Batch query execution
   */
  async batchQuery(queries, options = {}) {
    const results = [];
    const concurrency = options.concurrency || 1;

    for (let i = 0; i < queries.length; i += concurrency) {
      const batch = queries.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(query => {
          try {
            return this.query(query, options);
          } catch (error) {
            return { error: error.message, query };
          }
        })
      );
      results.push(...batchResults);
    }

    return results;
  }
}

/**
 * Logger utility
 */
class Logger {
  static log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  static info(message) {
    this.log(message, 'info');
  }

  static warn(message) {
    this.log(message, 'warn');
  }

  static error(message) {
    this.log(message, 'error');
  }

  static debug(message) {
    if (process.env.ENABLE_DEBUG_LOGGING === 'true') {
      this.log(message, 'debug');
    }
  }
}

/**
 * Date/Time utilities
 */
class DateUtils {
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }

  static getRelativeDate(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
  }

  static isToday(date) {
    const today = new Date();
    const check = new Date(date);
    return check.toDateString() === today.toDateString();
  }

  static formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
  }
}

module.exports = {
  WorkIQHelper,
  Logger,
  DateUtils
};
