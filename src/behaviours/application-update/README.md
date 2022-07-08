# Application update

Motivation here is to gather all stuff related to a feature in single place. Directory structure is not limited, we can introduce as many sub-features as we want to, e.g. to make some parts optional so that we can introduce single place to control whether feature is enabled or not. E.g. application update feature can be enabled even top bar or tray is not. If a feature has dependencies, it can only be enabled if it's dependencies are.

Feature is allowed to inject stuff only from it's dependencies. That means that we are not allowed to inject stuff from other features without creating dependency. This is something that we can (and will) enforce in the future, but for now we can have it as a guideline.

### Dependencies

None

### Current sub-features
1. Top bar
2. Tray

### Missing sub-features
1. Application menu
2. Preferences
