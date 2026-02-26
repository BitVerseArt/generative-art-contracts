# Maintainers Guide

## Recommended GitHub Settings

### Branch Protection (`dev` branch)

- Require pull request reviews before merging (1 approval minimum)
- Require status checks to pass before merging:
  - `Validate Registry` (CI workflow)
- Require branches to be up to date before merging
- Do not allow force pushes

### Branch Protection (`main` branch)

- Same as `dev`, plus:
  - Require 2 approvals
  - Restrict who can push (maintainers only)

### CODEOWNERS

Create a `.github/CODEOWNERS` file:

```
# Default owners for everything
* @bitverse/registry-maintainers

# Schema changes require extra review
schema/ @bitverse/registry-maintainers
```

### Repository Settings

- Default branch: `dev`
- Disable squash merging for registry entries (preserves individual commit history)
- Enable "Automatically delete head branches"

## Reviewing PRs

1. Verify CI passes (schema validation, format, lint)
2. Check that the contract address is real (click the block explorer link)
3. Verify the metadata is accurate
4. Merge to `dev`; periodically promote `dev` to `main`
