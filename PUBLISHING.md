# Publishing Guide

This guide explains how to publish `@solidexpert/csv-importer-angular` to npm using GitHub Actions.

## Prerequisites

1. **npm account** with access to the `@solidxepert` organization
2. **npm access token** with publish permissions
3. **GitHub repository** with Actions enabled

## Setup

### 1. Create npm Access Token

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click on your profile → **Access Tokens**
3. Click **Generate New Token** → **Automation**
4. Copy the token (you won't see it again!)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/solidexpert-ltd/csv-parser-angular`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm access token
6. Click **Add secret**

### 3. Verify Package Name

Ensure `package.json` has the correct package name:
```json
{
  "name": "@solidexpert/csv-importer-angular",
  "publishConfig": {
    "access": "public"
  }
}
```

## Publishing a New Version

### Method 1: Using npm version (Recommended)

This automatically creates a git tag and triggers the workflow:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

Then push:
```bash
git push && git push --tags
```

### Method 2: Manual Tag Creation

1. Update version in `package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. Commit and tag:
   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.1"
   git tag v1.0.1
   git push && git push --tags
   ```

### Method 3: Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select **Publish to npm** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Workflow Details

The GitHub Actions workflow (`.github/workflows/publish.yml`) will:

1. ✅ Checkout the code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies (`npm ci`)
4. ✅ Build the library (`npm run build`)
5. ✅ Verify version matches tag
6. ✅ Publish to npm
7. ✅ Create summary

## Verification

After publishing, verify the package:

1. Check npm: https://www.npmjs.com/package/@solidexpert/csv-importer-angular
2. Test installation:
   ```bash
   npm install @solidexpert/csv-importer-angular@latest
   ```

## Troubleshooting

### Workflow fails with "NPM_TOKEN not found"
- Ensure the secret is named exactly `NPM_TOKEN`
- Check that Actions secrets are enabled for the repository

### Version mismatch error
- Ensure `package.json` version matches the git tag (without the `v` prefix)
- Example: Tag `v1.0.1` → package.json `"version": "1.0.1"`

### Publishing fails with "403 Forbidden"
- Verify your npm token has publish permissions
- Ensure you have access to the `@solidxepert` organization on npm
- Check that `publishConfig.access` is set to `"public"` in package.json

### Build fails
- Check that all dependencies are listed in `package.json`
- Verify `ng-packagr` is installed and configured correctly
- Review the workflow logs for specific errors

## Package Structure

The published package includes:
- `dist/` - Built library files
- `README.md` - Documentation
- `package.json` - Package metadata
- `CHANGELOG.md` - Version history

Files excluded (via `.npmignore`):
- Source TypeScript files
- Demo application
- Development configs
- Test files

## Next Steps

After successful publishing:

1. Update the README with new features
2. Update CHANGELOG.md with changes
3. Create a GitHub release (optional, workflow can do this)
4. Announce the new version

