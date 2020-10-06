import type { PageStore } from "./lens-runtime"
import type { PageRegistration } from "./page-store"
import { LensExtension } from "./lens-extension"

export class LensRendererExtension extends LensExtension {
  registerPages(pageStore: PageStore) {
    // mock
  }


  // Runtime helpers
  protected registerPage(pageStore: PageStore, params: PageRegistration) {
    const dispose = pageStore.register(params);
    this.disposers.push(dispose)
  }
}
