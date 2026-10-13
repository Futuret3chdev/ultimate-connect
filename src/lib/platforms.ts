// Real platform configurations with official API endpoints
export const PLATFORMS = {
  twitter: {
    name: "X (Twitter)",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    postUrl: "https://api.twitter.com/2/tweets",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnv: "TWITTER_CLIENT_ID",
    clientSecretEnv: "TWITTER_CLIENT_SECRET",
  },
  linkedin: {
    name: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    postUrl: "https://api.linkedin.com/v2/ugcPosts",
    scopes: ["openid", "profile", "w_member_social", "email"],
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
  },
  facebook: {
    name: "Facebook",
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    postUrl: "https://graph.facebook.com/v21.0/me/feed",
    scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "instagram_basic", "instagram_content_publish"],
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
  },
  // Instagram uses Facebook Graph API for posting
  instagram: {
    name: "Instagram",
    // Handled via Facebook connection
    postUrl: "https://graph.facebook.com/v21.0",
  },
} as const;

export type PlatformId = keyof typeof PLATFORMS;
