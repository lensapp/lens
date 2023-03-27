# @k8slens/dock

This package contains stuff related to creating Lens-applications. 

# Usage

```bash
$ npm install @k8slens/dock
```

```typescript
import { dockFeature } from "@k8slens/dock";
import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";

const di = createContainer("some-container");

registerFeature(di, dockFeature);
```

## Extendability
