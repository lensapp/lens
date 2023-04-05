# @k8slens/ui-components

This package contains React UI components used in the Lens

# Usage

```bash
$ npm install @k8slens/ui-components
```

```typescript
import { uiComponentsFeature } from "@k8slens/ui-components";
import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";

const di = createContainer("some-container");

registerFeature(di, uiComponentsFeature);
```

