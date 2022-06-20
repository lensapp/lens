/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./view.scss";

import React from "react";
import { observer } from "mobx-react";
import type { PodContainer } from "../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../drawer";
import { ContainerEnv } from "./env";
import { ContainerEnvFromSource } from "./env-from";

export interface ContainerEnvironmentProps {
  container: PodContainer;
  namespace: string;
}

export const ContainerEnvironment = observer(({
  container: { env, envFrom },
  namespace,
}: ContainerEnvironmentProps) => (
  <DrawerItem name="Environment" className="ContainerEnvironment">
    {env && (
      <ContainerEnv
        env={env}
        namespace={namespace}
      />
    )}
    {envFrom && (
      <ContainerEnvFromSource
        envFrom={envFrom}
        namespace={namespace}
      />
    )}
  </DrawerItem>
));
