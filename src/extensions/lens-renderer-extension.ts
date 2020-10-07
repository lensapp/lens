import type { PageStore } from "./extension-renderer-api"
import type { PageRegistration } from "./page-store"
import { LensExtension } from "./lens-extension"

export abstract class LensRendererExtension extends LensExtension {
  registerPages(pageStore: PageStore) {
    return
  }

  // Runtime helpers
  protected registerPage(pageStore: PageStore, params: PageRegistration) {
    const dispose = pageStore.register(params);
    this.disposers.push(dispose)
  }
}
