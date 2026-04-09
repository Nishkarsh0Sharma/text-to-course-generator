// checks for bearer token in Authorization header
// verifies token against your Auth0 issuer
// ensures token audience matches your API
// rejects invalid or missing token automatically

import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";

dotenv.config();

const requireAuth = auth({
  // audience
  audience: process.env.AUTH0_AUDIENCE,
  // issuer
  issuerBaseURL: process.env.AUTH0_ISSUER,
  // signature
  tokenSigningAlg: "RS256",
});

export { requireAuth };
