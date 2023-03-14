/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { addHelmRepositoryChannel } from "../../../../common/helm/add-helm-repository-channel";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import addHelmRepositoryInjectable from "./add-helm-repository.injectable";

const addHelmRepositoryChannelListenerInjectable =
  getRequestChannelListenerInjectable({
    id: "add-helm-repository-channel-listener",
    channel: addHelmRepositoryChannel,
    getHandler: (di) => di.inject(addHelmRepositoryInjectable),
  });

export default addHelmRepositoryChannelListenerInjectable;
