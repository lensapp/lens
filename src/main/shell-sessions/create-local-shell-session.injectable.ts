/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { LocalShellSession } from "./local-shell-session";
import downloadKubectlBinariesInjectable from "../../common/user-preferences/download-kubectl-binaries.injectable";
import resolvedShellInjectable from "../../common/user-preferences/resolved-shell-injectable";
import kubectlBinariesPathInjectable from "../../common/user-preferences/kubectl-binaries-path.injectable";
import bundledKubectlPathInjectable from "../kubectl/get-bundled-path.injectable";
import { bind } from "../../common/utils";

const createLocalShellSessionInjectable = getInjectable({
  instantiate: (di) => bind(LocalShellSession.create, null, {
    downloadKubectlBinaries: di.inject(downloadKubectlBinariesInjectable),
    resolvedShell: di.inject(resolvedShellInjectable),
    kubectlBinariesPath: di.inject(kubectlBinariesPathInjectable),
    bundledKubectlPath: di.inject(bundledKubectlPathInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createLocalShellSessionInjectable;
