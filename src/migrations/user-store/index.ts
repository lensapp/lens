// User store migrations

import version210Beta4 from "./2.1.0-beta.4";
import { fileNameMigration } from "./file-name-migration";

export {
  fileNameMigration
};

export default {
  ...version210Beta4,
};
