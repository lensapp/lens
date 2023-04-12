# @k8slens/tooltip

This package contains stuff related to creating Lens-applications. 

# Usage

```bash
$ npm install @k8slens/tooltip
```

```typescript
import { tooltipFeature } from "@k8slens/tooltip";
import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";

const di = createContainer("some-container");

registerFeature(di, tooltipFeature);
```

## Extendability
