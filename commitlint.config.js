/**
 * Commitlint Configuration
 *
 * Enforces Conventional Commits format:
 * <type>(<scope>): <description>
 *
 * Examples:
 *   feat(hero): add background image support
 *   fix(contact): resolve email validation bug
 *   docs(readme): update setup instructions
 *   style(navbar): adjust mobile spacing
 *   refactor(analytics): simplify consent logic
 *   chore(deps): update dependencies
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Types allowed
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Formatting, no code change
        'refactor', // Code change that neither fixes nor adds
        'perf', // Performance improvement
        'test', // Adding tests
        'chore', // Maintenance tasks
        'revert', // Revert previous commit
        'ci', // CI/CD changes
        'build', // Build system changes
      ],
    ],
    // Scope is optional but encouraged
    'scope-case': [2, 'always', 'kebab-case'],
    // Subject (description) rules
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    // Body and footer are optional
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
}
