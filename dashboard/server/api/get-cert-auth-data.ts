// Get certificate auth data

import * as fs from "fs";
import * as util from "util";
import config from "../config";

let caData: string = null

export async function getCertificateAuthorityData(encoding = 'utf8'): Promise<string> {
  if (caData) {
    return caData
  }
  if (!fs.existsSync(config.KUBERNETES_CA_CERT)) {
    caData = config.KUBERNETES_CA_CERT
    return caData
  }
  try {
    const ca = await util.promisify(fs.readFile)(config.KUBERNETES_CA_CERT);
    return Buffer.from(ca).toString(encoding);
  } catch (error) {
    return ''
  }
}
