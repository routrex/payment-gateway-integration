import { authorizationUrl, oAuthClient } from "../config/googleOAuth.js";
import { google } from "googleapis";
import googleOAuthService from "../service/authService.js";

export const googleOAuth = (req, res) => {
  res.redirect(authorizationUrl);
};

export const googleOAuthCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(401).json({
      success: false,
      message: "Failed code There is not!",
    });
  }

  try {
    const {tokens} = await oAuthClient.getToken(code);
    oAuthClient.setCredentials(tokens);
    const oAuth = google.oauth2({ version: "v2", auth: oAuthClient });
    const { data } = await oAuth.userinfo.get();
    const result = await googleOAuthService(data);
    res.status(200).json({
      success: true,
      message: "Success Authentication With Google!",
      data: result,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

// export const logout = () => {
  
// }
