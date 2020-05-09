const port = 3000;
const baseURL = `http://localhost:${port}`;
export const config = {
  // The secret for the encryption of the jsonwebtoken
  JWTsecret: 'mysecret',
  baseURL: baseURL,
  port: port,
  // The credentials and information for OAuth2
  oauth2Credentials: {
    client_id: "283447142110-4tg4vook1dcm1h54sl7a9be9tltj55n3.apps.googleusercontent.com",
    project_id: "icantina", // The name of your project
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "m064QDc4k-wuv2uuKZwegG9c",
    redirect_uris: [
      `${baseURL}/google/auth_callback`
    ]
  }
};