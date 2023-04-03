# @k8slens/keyboard-shortcuts

This Feature enables keyboard shortcuts in Lens

# Usage

```bash
$ npm install @k8slens/keyboard-shortcuts
```

```typescript
import { keyboardShortcutsFeature } from "@k8slens/keyboard-shortcuts";
import { registerFeature } from "@k8slens/feature-core";
import { createContainer } from "@ogre-tools/injectable";

const di = createContainer("some-container");

registerFeature(di, keyboardShortcutsFeature);
```

## Extendability
