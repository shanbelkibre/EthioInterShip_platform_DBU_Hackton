# OAuth Quick Reference

## Login Options

- **LinkedIn** - For professionals and students
- **GitHub** - For developers

## User Roles

- **Student** - Browse and apply for internships
- **Company** - Post and manage internships

## Key URLs

| Page               | URL                                       |
| ------------------ | ----------------------------------------- |
| Login              | `/auth/login.html`                        |
| Student Dashboard  | `/dashboard/student.html`                 |
| Company Dashboard  | `/dashboard/company.html`                 |
| Browse Internships | `/internships/internship-view.html`       |
| Post Internship    | `/internships/internship-form.html`       |
| Applications       | `/applications/student-applications.html` |

## Environment Variables (Production)

```bash
VITE_LINKEDIN_CLIENT_ID=your_id_here
VITE_GITHUB_CLIENT_ID=your_id_here
VITE_CALLBACK_URL=https://yourdomain.com
```

## Testing OAuth Flows

### Login with LinkedIn

1. Click "Login with LinkedIn"
2. Enter LinkedIn credentials (if not logged in)
3. Grant permissions
4. Select role
5. Redirected to dashboard

### Login with GitHub

1. Click "Login with GitHub"
2. Enter GitHub credentials (if not logged in)
3. Grant permissions
4. Select role
5. Redirected to dashboard

## Logout

Click the **red logout button** in dashboard header

## Files to Update with OAuth Credentials

1. `auth/oauth.js` - Add Client IDs
2. Backend `.env` file - Add Secrets

## Security Checklist

- [ ] HTTPS enabled (production)
- [ ] Client secrets not in frontend
- [ ] Redirect URIs match exactly
- [ ] State parameter verified
- [ ] Token expiration handled
- [ ] CORS properly configured

## Common Issues

| Issue                   | Solution                               |
| ----------------------- | -------------------------------------- |
| "Redirect URI mismatch" | Check OAuth app settings match exactly |
| "Invalid Client ID"     | Verify credentials in oauth.js         |
| "State parameter error" | Clear localStorage, try again          |
| "User data not loading" | Check backend token exchange           |

## API Endpoints (Backend)

```
POST /api/auth/oauth/callback
Body: { code, provider }
Response: { user, token }

POST /api/auth/logout
Headers: { Authorization: Bearer token }
Response: { success: true }

GET /api/auth/profile
Headers: { Authorization: Bearer token }
Response: { user }
```

## Supported Scopes

### LinkedIn

- `r_liteprofile` - Basic profile
- `r_emailaddress` - Email address

### GitHub

- `user:email` - Email address
- `read:user` - Public profile

## Next Implementation

1. Get OAuth credentials
2. Setup backend API
3. Create database schema
4. Test with real OAuth
5. Deploy to production

---

**For detailed setup:** See `OAUTH_SETUP_GUIDE.md`  
**For migration details:** See `OAUTH_MIGRATION_COMPLETE.md`
