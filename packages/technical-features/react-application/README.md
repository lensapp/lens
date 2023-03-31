# @k8slens/react-application

# Usage

```bash
$ npm install @k8slens/react-application
```

```typescript
import { reactApplicationFeature } from "@k8slens/react-application";
import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";

const di = createContainer("some-container");

registerFeature(di, reactApplicationRootFeature);
```

## Extendability
