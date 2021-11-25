/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { CustomResourceDefinition } from "../../../../common/k8s-api/endpoints";
import customResourceDefinitionsInjectable from "../../../../common/k8s-api/endpoints/custom-resources/custom-resources.injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { iter } from "../../../utils";
import type { RegisteredCommand } from "./commands";
import { internalCommands, isKubernetesClusterActive } from "./internal-commands";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
  customResourceDefinitions: IComputedValue<CustomResourceDefinition[]>;
}

const instantiateRegisteredCommands = ({ extensions, customResourceDefinitions }: Dependencies) => computed(() => {
  const result = new Map<string, RegisteredCommand>();
  const commands = iter.chain(
    internalCommands,
    iter.chain(
      iter.flatMap(extensions.get(), extension => extension.commands),
      iter.map(customResourceDefinitions.get(), command => ({
        id: `cluster.view.${command.getResourceKind()}`,
        title: `Cluster: View ${command.getResourceKind()}`,
        isActive: isKubernetesClusterActive,
        action: ({ navigate }) => navigate(command.getResourceUrl()),
      })),
    ),
  );

  for (const { scope, isActive = () => true, ...command } of commands) {
    if (!result.has(command.id)) {
      result.set(command.id, { ...command, isActive });
    }
  }

  return result;
});

const registeredCommandsInjectable = getInjectable({
  instantiate: (di) => instantiateRegisteredCommands({
    extensions: di.inject(rendererExtensionsInjectable),
    customResourceDefinitions: di.inject(customResourceDefinitionsInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default registeredCommandsInjectable;
