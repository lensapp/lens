import logger from "../../../main/logger";
import { RouteParams } from "../../../main/protocol-handler";
import { extensionsURL, installFromNpm } from "../../components/+extensions";
import { navigate } from "../../navigation";

export async function installExtension(params: RouteParams): Promise<void> {
  const { name } = params.search;

  if (!name) {
    return void logger.info("installExtension handler: missing 'name' from search params");
  }


  try {
    navigate(extensionsURL());
    await installFromNpm(name);
  } catch (error) {
    logger.error("[PH - Install Extension]: failed to install from NPM", error);
  }
}
