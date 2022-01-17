/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { getReleaseSecret } from "./get-release-secret";
import { secretsStore } from "../../+config-secrets/secrets.store";


const getReleaseSecretInjectable = getInjectable({
  instantiate: () => getReleaseSecret({ secretsStore }),

  lifecycle: lifecycleEnum.singleton,
});

export default getReleaseSecretInjectable;
