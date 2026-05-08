# EthioInterShip Platform - OAuth Setup Guide

## Overview

The platform now uses **OAuth 2.0** authentication via **LinkedIn** and **GitHub** instead of traditional email/password accounts.

## Key Changes

### ✅ Removed

- Email/password registration system
- LocalStorage-based user accounts
- Register and login-filter pages

### ✅ Added

- LinkedIn OAuth 2.0 integration
- GitHub OAuth 2.0 integration
- Role selection during first login
- OAuth callback handlers
- State verification for security

---

## OAuth Implementation

### 1. **Login Flow**

```
User clicks "Login" → LinkedIn/GitHub OAuth →
Callback Handler → Role Selection → Dashboard
```

### 2. **New Files Created**

| File                          | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| `auth/login.html`             | OAuth login page with LinkedIn/GitHub buttons |
| `auth/oauth.js`               | Core OAuth logic and configuration            |
| `auth/callback-linkedin.html` | LinkedIn OAuth callback handler               |
| `auth/callback-github.html`   | GitHub OAuth callback handler                 |

### 3. **Updated Files**

| File                     | Changes                                  |
| ------------------------ | ---------------------------------------- |
| `auth/auth.js`           | Replaced email/password logic with OAuth |
| `script.js`              | Replaced legacy auth with OAuth checks   |
| `dashboard/student.js`   | Added OAuth verification                 |
| `dashboard/company.js`   | Added OAuth verification                 |
| `dashboard/student.html` | Added logout button                      |
| `dashboard/company.html` | Added logout button                      |
| `index.html`             | Updated navbar with OAuth login          |

---

## Setup Instructions

### Step 1: Configure LinkedIn OAuth

1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps)
2. Create a new application
3. Get your **Client ID** and **Client Secret**
4. Add redirect URI: `http://localhost:3000/auth/callback-linkedin.html` (or your domain)
5. Update `auth/oauth.js`:

```javascript
const OAUTH_CONFIG = {
  linkedin: {
    clientId: "YOUR_ACTUAL_LINKEDIN_CLIENT_ID",
    // ... rest of config
  },
};
```

### Step 2: Configure GitHub OAuth

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth application
3. Get your **Client ID** and **Client Secret**
4. Set Authorization callback URL: `http://localhost:3000/auth/callback-github.html` (or your domain)
5. Update `auth/oauth.js`:

```javascript
const OAUTH_CONFIG = {
  github: {
    clientId: "YOUR_ACTUAL_GITHUB_CLIENT_ID",
    // ... rest of config
  },
};
```

### Step 3: Backend Integration (Important)

The current implementation uses **mock profiles** for demo purposes. For production:

1. Set up a backend server (Node.js, Python, etc.)
2. Create token exchange endpoint that calls:
   - LinkedIn: `https://www.linkedin.com/oauth/v2/accessToken`
   - GitHub: `https://github.com/login/oauth/access_token`
3. Fetch user profile using access token
4. Create/update user record in your database
5. Return user data to frontend

**Example Backend Flow:**

```javascript
// Backend pseudo-code
POST /auth/oauth/callback
{
    code: "auth_code_from_provider",
    provider: "linkedin" | "github"
}

Response:
{
    user: {
        id: "unique_id",
        email: "user@example.com",
        name: "John Doe",
        avatar: "https://...",
        provider: "linkedin|github"
    },
    token: "jwt_token_for_session"
}
```

---

## User Authentication Check

### Before (Email/Password)

```javascript
const user = users.find((u) => u.email === email && u.password === password);
```

### After (OAuth)

```javascript
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (currentUser && currentUser.provider) {
  // User is authenticated via OAuth
}
```

---

## API Scope Requirements

### LinkedIn OAuth

- `r_liteprofile` - Basic profile information
- `r_emailaddress` - Email address
- Optional: `r_basicprofile`, `w_member_social` (for future features)

### GitHub OAuth

- `user:email` - Read user email
- `read:user` - Read user profile
- Optional: `repo`, `gist` (for future code-based matching)

---

## Security Features

✓ **State Parameter** - Prevents CSRF attacks  
✓ **Code Exchange** - Authorization code validated on backend  
✓ **HTTPS Only** - All OAuth redirects use HTTPS in production  
✓ **Token Storage** - Tokens stored securely in backend (not localStorage)  
✓ **Role Selection** - Users select role after first OAuth login

---

## Testing Locally

### Option 1: Using Mock Data (Current)

```javascript
// callback-linkedin.html simulates OAuth response
const mockProfile = {
  email: "user@linkedin.com",
  name: "John Doe",
  avatar: "https://via.placeholder.com/150",
  profileUrl: "https://linkedin.com/in/johndoe",
};
```

### Option 2: Use OAuth Sandbox

- LinkedIn: Developer sandbox environment
- GitHub: Use localhost with test application

### Option 3: Deploy to Production

- Use ngrok or similar to get public URL
- Update OAuth app redirect URIs
- Test with real OAuth flow

---

## Logout Flow

Users can logout from any dashboard page:

```javascript
function logoutOAuthUser() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("oauth_state");
  localStorage.removeItem("oauth_provider");
  localStorage.removeItem("selected_role");
  window.location.href = "../index.html";
}
```

---

## Troubleshooting

### Issue: "Invalid redirect URI"

**Solution:** Ensure callback URL matches exactly in OAuth app settings

### Issue: "State parameter mismatch"

**Solution:** State verification failed - check localStorage and callback handling

### Issue: "CORS error"

**Solution:** Token exchange must happen on backend, not frontend

### Issue: User email not provided

**Solution:** Request appropriate scopes in OAuth configuration

---

## User Data Storage

### Current (Demo)

```javascript
{
    id: timestamp,
    provider: "linkedin" | "github",
    email: "user@example.com",
    name: "Full Name",
    avatar: "profile_image_url",
    profileUrl: "oauth_profile_url",
    role: "student" | "company",
    loginDate: "2026-05-08T...",
    profile: { /* additional data */ }
}
```

### With Backend

- Store user profile in database
- Use JWT token for session management
- Fetch user data from backend on page load

---

## Future Enhancements

- [ ] Multi-provider login (Google, Microsoft, Twitter)
- [ ] GitHub repository integration for skill matching
- [ ] LinkedIn profile data auto-fill
- [ ] Social proof (mutual connections, endorsements)
- [ ] Account linking (connect multiple OAuth providers)
- [ ] 2FA with OAuth provider

---

## Support

For issues or questions about OAuth setup:

1. Check provider documentation
2. Review callback handlers
3. Verify Client ID and Secret
4. Test state parameter handling
5. Check browser console for errors

---

Generated: May 8, 2026
Platform: EthioInterShip v2.0 (OAuth Edition)
