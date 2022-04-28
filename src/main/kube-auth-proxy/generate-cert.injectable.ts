/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { generate } from "selfsigned";

const generateCertificateInjectable = getInjectable({
  id: "generate-certificate",
  instantiate: () => generate,
});

export default generateCertificateInjectable;
