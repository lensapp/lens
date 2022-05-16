/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../common/cluster-types";
import catalogEntityRegistryInjectable from "../../catalog/entity-registry.injectable";
import terminalShellEnvModifiersInjectable from "./terminal-shell-env-modifiers.injectable";

export type TerminalShellEnvModify = (clusterId: ClusterId, env: Partial<Record<string, string>>) => Partial<Record<string, string>>;

const terminalShellEnvModifyInjectable = getInjectable({
  id: "terminal-shell-env-modify",

  instantiate: (di): TerminalShellEnvModify => {
    const terminalShellEnvModifiers = di.inject(terminalShellEnvModifiersInjectable);
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);

    return (clusterId, env) => {
      const modifiers = terminalShellEnvModifiers.get();

      if (modifiers.length === 0) {
        return env;
      }

      const entity = entityRegistry.findById(clusterId);

      if (entity) {
        const ctx = { catalogEntity: entity };

        // clone it so the passed value is not also modified
        env = JSON.parse(JSON.stringify(env));
        env = modifiers.reduce((env, modifier) => modifier(ctx, env), env);
      }

      return env;
    };
  },
});

export default terminalShellEnvModifyInjectable;
