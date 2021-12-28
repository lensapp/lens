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
import { getInjectable } from "@ogre-tools/injectable";
import { lifecycleEnum } from "@ogre-tools/injectable";
import { ExtensionDiscovery } from "./extension-discovery";
import extensionLoaderInjectable from "../extension-loader/extension-loader.injectable";
import isCompatibleExtensionInjectable from "./is-compatible-extension/is-compatible-extension.injectable";
import isCompatibleBundledExtensionInjectable from "./is-compatible-bundled-extension/is-compatible-bundled-extension.injectable";
import extensionsStoreInjectable from "../extensions-store/extensions-store.injectable";
import extensionInstallationStateStoreInjectable from "../extension-installation-state-store/extension-installation-state-store.injectable";
import installExtensionInjectable
  from "../extension-installer/install-extension/install-extension.injectable";
import extensionPackageRootDirectoryInjectable
  from "../extension-installer/extension-package-root-directory/extension-package-root-directory.injectable";
import installExtensionsInjectable
  from "../extension-installer/install-extensions/install-extensions.injectable";

const extensionDiscoveryInjectable = getInjectable({
  instantiate: (di) =>
    new ExtensionDiscovery({
      extensionLoader: di.inject(extensionLoaderInjectable),
      extensionsStore: di.inject(extensionsStoreInjectable),

      extensionInstallationStateStore: di.inject(
        extensionInstallationStateStoreInjectable,
      ),

      isCompatibleBundledExtension: di.inject(
        isCompatibleBundledExtensionInjectable,
      ),

      isCompatibleExtension: di.inject(isCompatibleExtensionInjectable),

      installExtension: di.inject(installExtensionInjectable),
      installExtensions: di.inject(installExtensionsInjectable),
      extensionPackageRootDirectory: di.inject(extensionPackageRootDirectoryInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default extensionDiscoveryInjectable;
