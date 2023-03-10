/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { ClusterId } from "../../../common/cluster-types";
import { isDefined } from "@k8slens/utilities";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import catalogEntityRegistryInjectable from "../../catalog/entity-registry.injectable";

export type ModifyTerminalShellEnv = (clusterId: ClusterId, env: Partial<Record<string, string>>) => Partial<Record<string, string>>;

const modifyTerminalShellEnvInjectable = getInjectable({
  id: "terminal-shell-env-modify",

  instantiate: (di): ModifyTerminalShellEnv => {
    const extensions = di.inject(mainExtensionsInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const terminalShellEnvModifiers = computed(() => (
      extensions.get()
        .map((extension) => extension.terminalShellEnvModifier)
        .filter(isDefined)
    ));

    return (clusterId, env) => {
      const modifiers = terminalShellEnvModifiers.get();

      if (modifiers.length === 0) {
        return env;
      }

      const entity = catalogEntityRegistry.findById(clusterId);

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

export default modifyTerminalShellEnvInjectable;
