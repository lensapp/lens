/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";

export type MigrationLog = (message: string, ...args: any[]) => void;

const migrationLogInjectable = getInjectable({
  id: "migration-log",
  instantiate: (di): MigrationLog => {
    const logger = di.inject(loggerInjectable);

    return (...args) => logger.info(...args);
  },
});

export default migrationLogInjectable;
