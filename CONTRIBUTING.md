# Contributing to Work IQ Enterprise Patterns

First off, thank you for considering contributing to this project! 🎉

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When submitting a bug report, include:**
- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details:
  - OS (Windows, macOS, Linux)
  - Node.js version
  - Work IQ CLI version
  - Relevant configuration

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**
- A clear and descriptive title
- Detailed description of the proposed functionality
- Why this enhancement would be useful
- Examples of how it would be used

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit your changes** with clear, descriptive messages
6. **Push to your fork** and submit a pull request

## Development Process

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/workiq-enterprise-patterns.git

# Navigate to directory
cd workiq-enterprise-patterns

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your .env file
# Edit .env with your credentials
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

Examples:
- `feature/add-meeting-analyzer`
- `fix/cache-expiration-bug`
- `docs/update-readme`

### Commit Message Guidelines

Use clear and meaningful commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(cli): add meeting context extraction

- Add getMeetingContext() function
- Support for multiple meeting formats
- Include participant analysis

Closes #123
```

```
fix(dataverse): resolve connection timeout issue

The timeout was occurring due to incorrect retry logic.
Increased timeout and improved error handling.

Fixes #456
```

### Code Style

We use ESLint for JavaScript code quality:

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Key conventions:**
- Use single quotes for strings
- 2-space indentation
- Semicolons required
- Meaningful variable names
- Comment complex logic
- Maximum line length: 100 characters

### Testing

All new features should include tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test file naming:**
- Unit tests: `*.test.js`
- Integration tests: `*.integration.test.js`
- E2E tests: `*.e2e.test.js`

### Documentation

Update documentation when:
- Adding new features
- Changing existing functionality
- Fixing bugs that affect usage
- Adding new configuration options

**Documentation locations:**
- Code comments: Inline documentation
- README.md: Project overview and quick start
- docs/: Detailed guides and tutorials
- CHANGELOG.md: Version history

## Project Structure

```
workiq-enterprise-patterns/
├── samples/           # Code samples and examples
├── templates/         # Reusable templates
├── docs/             # Documentation
├── tools/            # Utility scripts
├── tests/            # Test suites
└── scripts/          # Build and deployment scripts
```

## Adding New Samples

When contributing new code samples:

1. **Create in appropriate directory**:
   - CLI automation → `samples/cli-automation/`
   - Dataverse → `samples/dataverse/`
   - Copilot Studio → `samples/copilot-studio/`
   - Power Automate → `samples/power-automate/`

2. **Include comprehensive comments**:
   ```javascript
   /**
    * Meeting Context Extractor
    * 
    * Extracts and analyzes context from Microsoft Teams meetings
    * using Work IQ semantic understanding.
    * 
    * @param {string} meetingId - The meeting identifier
    * @returns {Object} Meeting context including participants, decisions, and action items
    */
   ```

3. **Add usage example**:
   ```javascript
   // Example usage
   if (require.main === module) {
     // Demonstration code
   }
   ```

4. **Update README** with new sample information

5. **Add tests** for the new functionality

## Adding Templates

When contributing Dataverse schemas or other templates:

1. **Use JSON format** for schemas
2. **Include complete metadata**:
   - Display names
   - Descriptions
   - Data types
   - Relationships

3. **Add deployment instructions** in comments or README

4. **Test thoroughly** in a dev environment first

## Quality Checklist

Before submitting a pull request, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements (use proper logging)
- [ ] No sensitive data (credentials, API keys)
- [ ] Code is commented where necessary
- [ ] README updated if needed
- [ ] CHANGELOG.md updated

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update the CHANGELOG.md** following Keep a Changelog format
3. **Ensure all status checks pass**
4. **Request review** from maintainers
5. **Address review feedback** promptly
6. **Squash commits** if requested before merge

## Community

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and request features via Issues
- **Pull Requests**: Submit code contributions

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes for significant contributions
- GitHub contributor graphs

## Getting Help

- Check existing [documentation](./docs/)
- Search [closed issues](../../issues?q=is%3Aissue+is%3Aclosed)
- Ask in [GitHub Discussions](../../discussions)
- Review [blog series](https://yourblog.com/workiq-series)

## License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for your contributions! 🚀**
