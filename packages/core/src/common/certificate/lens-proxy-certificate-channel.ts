/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SelfSignedCert } from "selfsigned";
import { getRequestChannel } from "@k8slens/messaging";

export const lensProxyCertificateChannel = getRequestChannel<void, SelfSignedCert>("request-lens-proxy-certificate");
