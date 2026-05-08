// OAuth Configuration
const OAUTH_CONFIG = {
  linkedin: {
    clientId: "YOUR_LINKEDIN_CLIENT_ID",
    redirectUri: `${window.location.origin}/auth/callback-linkedin.html`,
    authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scope: "r_liteprofile r_emailaddress",
  },
  github: {
    clientId: "YOUR_GITHUB_CLIENT_ID",
    redirectUri: `${window.location.origin}/auth/callback-github.html`,
    authorizationUrl: "https://github.com/login/oauth/authorize",
    scope: "user:email read:user",
  },
};

// LinkedIn OAuth Handler
document.getElementById("linkedinBtn")?.addEventListener("click", () => {
  const state = generateRandomState();
  localStorage.setItem("oauth_state", state);
  localStorage.setItem("oauth_provider", "linkedin");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH_CONFIG.linkedin.clientId,
    redirect_uri: OAUTH_CONFIG.linkedin.redirectUri,
    scope: OAUTH_CONFIG.linkedin.scope,
    state: state,
  });

  window.location.href = `${OAUTH_CONFIG.linkedin.authorizationUrl}?${params.toString()}`;
});

// GitHub OAuth Handler
document.getElementById("githubBtn")?.addEventListener("click", () => {
  const state = generateRandomState();
  localStorage.setItem("oauth_state", state);
  localStorage.setItem("oauth_provider", "github");

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.github.clientId,
    redirect_uri: OAUTH_CONFIG.github.redirectUri,
    scope: OAUTH_CONFIG.github.scope,
    state: state,
  });

  window.location.href = `${OAUTH_CONFIG.github.authorizationUrl}?${params.toString()}`;
});

// Generate random state for security
function generateRandomState() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Mock OAuth Response Handler (for demo purposes)
function handleOAuthCallback(provider, profile) {
  const user = {
    id: Date.now(),
    provider: provider,
    email: profile.email,
    name: profile.name,
    avatar: profile.avatar,
    profileUrl: profile.profileUrl,
    profile: {},
    loginDate: new Date().toISOString(),
  };

  // Determine role based on provider or user selection
  const role = localStorage.getItem("selected_role") || "student";
  user.role = role;

  // Store user in localStorage
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Redirect to appropriate dashboard
  window.location.href = `../dashboard/${role}.html`;
}

// Export for use in callback pages
window.handleOAuthCallback = handleOAuthCallback;
