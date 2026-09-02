import { google } from "googleapis";

export const oAuthClient = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3000/api/auth/google/callback",
);

export const scopeData = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export const authorizationUrl = oAuthClient.generateAuthUrl({
  access_type: "offline",
  scope: scopeData,
  include_granted_scopes: true,
});
