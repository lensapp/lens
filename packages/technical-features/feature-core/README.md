# @k8slens/feature-core

Feature is set of injectables that are registered and deregistered simultaneously.

## Install
```bash
$ npm install @k8slens/feature-core
```

## Usage

```typescript
import { createContainer } from "@ogre-tools/injectable"
import { getFeature, registerFeature, deregisterFeature } from "@k8slens/feature-core"

// Notice that this Feature is usually exported from another NPM package.
const someFeature = getFeature({
  id: "some-feature",
  
  register: (di) => {
    di.register(someInjectable, someOtherInjectable);
  },
  
  // Feature dependencies are automatically registered and 
  // deregistered when necessary.
  dependencies: [someOtherFeature] 
});

const di = createContainer("some-container");

registerFeature(di, someFeature);

// Or perhaps you want to deregister?
deregisterFeature(di, someFeature);
```

## Need to know

#### NPM packages exporting a Feature
- Prefer `peerDependencies` since they are installed from the application and are not allowed to be in the built bundle. 
- Prefer exporting `injectionToken` instead of `injectable` for not allowing other features to access technical details like the `injectable`
