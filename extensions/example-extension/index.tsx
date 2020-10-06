import { DynamicPageType, LensRendererExtension, PageStore } from "@lens/ui-extensions";
import { examplePage, ExtensionIcon } from "./page"

export default class ExampleExtension extends LensRendererExtension {
  onActivate() {
    console.log('EXAMPLE EXTENSION RENDERER: ACTIVATED', this.getMeta());
  }

  registerPages(pageStore: PageStore) {
    this.registerPage(pageStore, {
      type: DynamicPageType.CLUSTER,
      path: "/extension-example",
      title: "Example Extension",
      components: {
        Page: examplePage(this),
        MenuIcon: ExtensionIcon,
      }
    })
  }

  onDeactivate() {
    console.log('EXAMPLE EXTENSION RENDERER: DEACTIVATED', this.getMeta());
  }
}
