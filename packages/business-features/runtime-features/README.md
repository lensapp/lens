# @k8slens/runtime-features

# Usage

```bash
$ npm install @k8slens/runtime-features
```

```typescript
import { runtimeFeaturesFeature } from "@k8slens/runtime-features";
import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";

const di = createContainer("some-container");

registerFeature(di, runtimeFeaturesFeature);
```

## Extendability
