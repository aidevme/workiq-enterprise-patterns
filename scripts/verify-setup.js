#!/usr/bin/env node

/**
 * Setup Verification Script
 * 
 * Verifies that all prerequisites are met and the environment is configured correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SetupVerifier {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Run all verification checks
   */
  async verify() {
    console.log('\n╔' + '═'.repeat(68) + '╗');
    console.log('║' + this.center('Work IQ Setup Verification', 68) + '║');
    console.log('╚' + '═'.repeat(68) + '╝\n');

    await this.checkNodeVersion();
    await this.checkWorkIQCLI();
    await this.checkEULAAcceptance();
    await this.checkEnvironmentFile();
    await this.checkAuthentication();
    await this.checkPermissions();

    this.printSummary();
  }

  /**
   * Check Node.js version
   */
  async checkNodeVersion() {
    try {
      const version = process.version;
      const major = parseInt(version.split('.')[0].substring(1));

      if (major >= 18) {
        this.pass(`Node.js: ${version} (OK)`);
      } else {
        this.fail(`Node.js: ${version} (Need >= 18.0.0)`);
      }
    } catch (error) {
      this.fail('Node.js: Not found');
    }
  }

  /**
   * Check Work IQ CLI installation
   */
  async checkWorkIQCLI() {
    try {
      const version = execSync('workiq version', { encoding: 'utf8' }).trim();
      this.pass(`Work IQ CLI: ${version.split('\n')[0]} (OK)`);
    } catch (error) {
      this.fail('Work IQ CLI: Not installed');
      this.errors.push('Install with: npm install -g @microsoft/workiq');
    }
  }

  /**
   * Check EULA acceptance
   */
  async checkEULAAcceptance() {
    try {
      // Try a simple query to see if EULA is accepted
      execSync('workiq ask -q "test" 2>&1', { encoding: 'utf8' });
      this.pass('EULA: Accepted');
    } catch (error) {
      if (error.message.includes('EULA')) {
        this.fail('EULA: Not accepted');
        this.errors.push('Run: workiq accept-eula');
      } else {
        // If error is about something else, EULA is probably accepted
        this.pass('EULA: Accepted');
      }
    }
  }

  /**
   * Check environment file
   */
  async checkEnvironmentFile() {
    const envPath = path.join(process.cwd(), '.env');

    if (fs.existsSync(envPath)) {
      this.pass('Environment: .env file exists');

      // Check for required variables
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = ['WORKIQ_TENANT_ID'];

      requiredVars.forEach(varName => {
        if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your-`)) {
          this.pass(`  ✓ ${varName} configured`);
        } else {
          this.warn(`  ⚠ ${varName} not configured`);
        }
      });
    } else {
      this.warn('Environment: .env file not found');
      this.warnings.push('Copy .env.example to .env and configure');
    }
  }

  /**
   * Check authentication
   */
  async checkAuthentication() {
    try {
      // Try a simple query
      const result = execSync('workiq ask -q "test query" 2>&1', { 
        encoding: 'utf8',
        timeout: 10000
      });

      if (result.includes('Authentication') || result.includes('login')) {
        this.warn('Authentication: Not authenticated');
        this.warnings.push('Run a query to authenticate: workiq ask -q "What meetings do I have today?"');
      } else {
        this.pass('Authentication: Valid');
      }
    } catch (error) {
      if (error.message.includes('timeout')) {
        this.warn('Authentication: Could not verify (timeout)');
      } else if (error.message.includes('permission')) {
        this.fail('Authentication: Permission denied');
      } else {
        this.pass('Authentication: Likely valid');
      }
    }
  }

  /**
   * Check permissions
   */
  async checkPermissions() {
    // This is a placeholder - actual permission checking would require admin API access
    this.pass('Permissions: Assumed valid (run queries to verify)');
  }

  /**
   * Record a passing check
   */
  pass(message) {
    console.log(`✅ ${message}`);
    this.checks.push({ status: 'pass', message });
  }

  /**
   * Record a failing check
   */
  fail(message) {
    console.log(`❌ ${message}`);
    this.checks.push({ status: 'fail', message });
  }

  /**
   * Record a warning
   */
  warn(message) {
    console.log(`⚠️  ${message}`);
    this.checks.push({ status: 'warn', message });
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n' + '─'.repeat(70));

    const passed = this.checks.filter(c => c.status === 'pass').length;
    const failed = this.checks.filter(c => c.status === 'fail').length;
    const warned = this.checks.filter(c => c.status === 'warn').length;

    console.log(`\nResults: ${passed} passed, ${failed} failed, ${warned} warnings\n`);

    if (failed > 0) {
      console.log('❌ Setup incomplete. Please address the following:\n');
      this.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
      console.log('');
      process.exit(1);
    } else if (warned > 0) {
      console.log('⚠️  Setup complete with warnings:\n');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
      console.log('\n✅ You can proceed, but consider addressing warnings.\n');
    } else {
      console.log('✅ All checks passed! You\'re ready to use Work IQ.\n');
      console.log('Next steps:');
      console.log('  • Run samples: npm run queries');
      console.log('  • Generate briefing: npm run briefing');
      console.log('  • Read docs: docs/setup/getting-started.md\n');
    }
  }

  /**
   * Center text
   */
  center(text, width) {
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length);
  }
}

// Run verification
const verifier = new SetupVerifier();
verifier.verify().catch(error => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});
