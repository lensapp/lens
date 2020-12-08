import logger from "../../../main/logger";
import { RouteParams } from "../../../main/protocol-handler";
import { installFromNpm } from "../../components/+extensions";

export async function installExtension(params: RouteParams): Promise<void> {
  const { extId } = params.search;

  if (!extId) {
    return void logger.info("installExtension handler: missing 'extId' from search params");
  }

  try {
    await installFromNpm(extId);
  } catch (error) {
    logger.error("[PH - Install Extension]: failed to install from NPM", error);
  }
}
