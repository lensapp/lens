// Get service-account token

import { existsSync, readFile } from "fs";
import { promisify } from "util";
import config from "../config"

const tokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token";

export async function getServiceAccountToken() {
  const { SERVICE_ACCOUNT_TOKEN } = config;

  if (SERVICE_ACCOUNT_TOKEN) {
    return SERVICE_ACCOUNT_TOKEN;
  }

  if (existsSync(tokenPath)) {
    const token = await promisify(readFile)(tokenPath);
    return token.toString().trim();
  }

  return null;
}
