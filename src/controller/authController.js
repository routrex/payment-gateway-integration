import { authorizationUrl, oAuthClient } from "../config/googleOAuth.js";
import { google } from "googleapis";
import {
  getProfileService,
  googleOAuthService,
} from "../service/authService.js";

export const getProfile = async (req, res) => {
  const id_user = req.user.id_user;

  try {
    const result = await getProfileService(id_user);
    res.status(200).json({
      success: true,
      message: `Success get get profile id ${id_user}`,
      data: result,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

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
    const { tokens } = await oAuthClient.getToken(code);
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

export const logout = async (req, res) => {
  const id_user = req.user.id_user;
  try {
    res.status(200).json({
      success: true,
      message: `Success Logout id ${id_user}!`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
