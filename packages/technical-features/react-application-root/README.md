# @k8slens/react-application-root

# Usage

```bash
$ npm install @k8slens/react-application-root
```

```typescript
import { reactApplicationRootFeature } from "@k8slens/application";
import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";

const di = createContainer("some-container");

registerFeature(di, reactApplicationRootFeature);
```

## Extendability
