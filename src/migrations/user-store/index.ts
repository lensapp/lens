// User store migrations

import version210Beta4 from "./2.1.0-beta.4";
import version500Alpha3 from "./5.0.0-alpha.3";
import { fileNameMigration } from "./file-name-migration";

export {
  fileNameMigration
};

export default {
  ...version210Beta4,
  ...version500Alpha3,
};
