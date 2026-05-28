# Keystatic GitHub Storage Setup Guide

## Overview

Your Keystatic CMS is now configured to work with **GitHub storage**, allowing you to:
- ✅ Edit articles from production (yourdomain.com/keystatic)
- ✅ Edit articles locally during development
- ✅ Keep all changes synced through GitHub
- ✅ Maintain version control for all content
- ✅ Secure access with GitHub authentication

## How It Works

**Local Development:**
- Uses local file storage (no GitHub required)
- Changes are saved directly to your filesystem
- Works exactly as before

**Production:**
- Uses GitHub storage
- All changes are committed to your GitHub repository
- Requires GitHub authentication
- Changes are automatically synced

## Setup Instructions

### Step 1: Update Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env`:
   ```env
   KEYSTATIC_GITHUB_OWNER=your-github-username
   KEYSTATIC_GITHUB_REPO=my-astronomy-blog
   ```

### Step 2: Create GitHub OAuth App

You need to create a GitHub OAuth App to allow Keystatic to authenticate with GitHub.

1. Go to GitHub Settings: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name:** `Stellara Keystatic CMS`
   - **Homepage URL:** `https://yourdomain.com` (your production URL)
   - **Authorization callback URL:** `https://yourdomain.com/api/keystatic/github/oauth/callback`
   - **Enable Device Flow:** Leave unchecked

4. Click **"Register application"**

5. You'll see your **Client ID**. Copy it.

6. Click **"Generate a new client secret"** and copy the secret (you won't be able to see it again!)

7. Add these to your `.env` file:
   ```env
   PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID=your_client_id_here
   KEYSTATIC_GITHUB_CLIENT_SECRET=your_client_secret_here
   ```

### Step 3: Configure Production Environment

You need to add these environment variables to your Cloudflare Pages deployment:

1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to **Settings → Environment variables**
4. Add the following variables:
   - `KEYSTATIC_GITHUB_OWNER` = your GitHub username
   - `KEYSTATIC_GITHUB_REPO` = your repository name
   - `PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID` = your OAuth Client ID
   - `KEYSTATIC_GITHUB_CLIENT_SECRET` = your OAuth Client Secret (mark as encrypted)
   - `NODE_ENV` = `production`

### Step 4: Update GitHub Repository Settings

To allow Keystatic to commit to your repository:

1. Ensure your repository is **public** OR
2. If private, you may need to configure additional permissions

### Step 5: Deploy to Production

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Enable Keystatic GitHub storage for production"
   git push
   ```

2. Deploy to Cloudflare Pages (automatic if you have CD enabled)

3. Wait for deployment to complete

### Step 6: Test in Production

1. Go to `https://yourdomain.com/keystatic`
2. Click **"Sign in with GitHub"**
3. Authorize the OAuth app
4. You should now see the Keystatic admin interface
5. Try creating or editing an article
6. Check your GitHub repository - you should see a new commit!

## Using Keystatic

### In Production (yourdomain.com/keystatic)
- Access via: `https://yourdomain.com/keystatic`
- Requires GitHub authentication
- All changes commit directly to GitHub
- Changes are immediately available after rebuild/redeploy

### In Local Development (localhost:4321/keystatic)
- Access via: `http://localhost:4321/keystatic`
- Uses local file storage
- No authentication required
- Changes save directly to filesystem

## Syncing Changes

### Production → Local
After editing in production:
```bash
git pull
```

### Local → Production
After editing locally:
```bash
git add .
git commit -m "Update article"
git push
```

## Security

- Only users with GitHub account access can sign in
- OAuth is secure and industry-standard
- Client secret should NEVER be committed to repository
- Use `.env` for local, environment variables for production

## Troubleshooting

### "Failed to authenticate with GitHub"
- Check your OAuth Client ID and Secret are correct
- Verify callback URL matches exactly: `https://yourdomain.com/api/keystatic/github/oauth/callback`
- Ensure environment variables are set in Cloudflare Pages

### "Repository not found"
- Verify `KEYSTATIC_GITHUB_OWNER` and `KEYSTATIC_GITHUB_REPO` are correct
- Check repository permissions
- Ensure OAuth app has access to the repository

### "Cannot commit changes"
- Ensure you have write access to the repository
- Check if repository is archived or locked
- Verify GitHub OAuth app permissions

### Local development shows GitHub login
If you want to force local storage in development:
```env
KEYSTATIC_GITHUB_MODE=false
```

## Alternative: Personal Access Token (Simpler Setup)

Instead of OAuth, you can use a GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: **`repo`** (full control)
4. Generate and copy the token
5. Add to environment variables:
   ```env
   KEYSTATIC_GITHUB_TOKEN=your_token_here
   ```

**Note:** This is simpler but less secure. OAuth is recommended for production.

## What Changed

### Files Modified:
1. ✅ **keystatic.config.ts** - Now supports both local and GitHub storage
2. ✅ **astro.config.mjs** - Keystatic enabled in production
3. ✅ **.env.example** - Environment variable template

### Data Preservation:
- ✅ All existing articles preserved
- ✅ No content deleted or modified
- ✅ Backward compatible with local development
- ✅ No breaking changes to your workflow

## Benefits

✅ **Edit from anywhere** - Access /keystatic from production
✅ **No local deployment needed** - Create/edit content directly in production
✅ **Version control** - Every change is a Git commit
✅ **Secure** - GitHub authentication required
✅ **Automatic sync** - No manual syncing between local and production
✅ **Rollback capability** - Use Git history to revert changes

## Need Help?

If you encounter issues, check:
1. Environment variables are set correctly
2. OAuth callback URL is exact
3. GitHub repository permissions
4. Cloudflare Pages build logs

---

**Ready to use!** 🚀
