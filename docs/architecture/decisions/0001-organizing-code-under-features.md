# 1. Organizing code under features

Date: 2022-07-11

## Status

2022-07-11 proposed

2022-08-10 accepted

## Context

Previously we have organized code under `main`, `renderer` and `common` top level directories. It means that given a feature which has code that needs to run in both environments, we had to split the feature in three different directories.

**Example:** 

```
src/
  behaviours/
    application-update/
      installing-update-using-tray.test.ts
      ...
      
  main/
    application-update
      process-checking-of-updates.injectable.ts
      ...
      
    tray/
      tray-menu-item-injection-token.ts
      check-for-updates-tray-menu-item.injectable.ts
      ...
     
  common/
    application-update
      update-channels.ts
      update-is-being-downloaded.injectable.ts
      ...
      
    front-end-routes/
      preferences/
        app/
          app-preferences-route.injectable.ts
          navigate-to-app-preferences.injectable.ts

  renderer/
    top-bar/
      top-bar.tsx (UpdateButton)
    
    preferences/
      application.tsx (UpdateChannel)
```

## Decision

Start organizing code under features, meaning that all code that feature needs to exist in a single directory. Features might have child features which have dependency to the parent. We want to limit the coupling of features, which means that feature is not allowed to touch any other feature without creating dependency to it. We want to have visibility for dependency structures of features.

1. Code that belongs to the feature lives in the feature directory. If I want to remove the feature, I can just delete the directory.
2. Code that is shared between features lives in the closest parent feature. E.g. child features are using code from parent features.
3. Parent features should never depend on child features. If the dependency is required, the child feature is the one that depends on the parent feature.

**Example:**

```
src/
  features/
    application-update/
      installing-update.test.ts
      ...
      
      main/
        process-checking-of-updates.injectable.ts
        ...
      
      common/
        update-channels.ts
        update-is-being-downloaded.injectable.ts
        ...
      
      child-features
        tray/
          installing-update-using-tray.test.ts
          ...
          
          main/
            check-for-updates-tray-menu-item.injectable.ts
            ...
        
        top-bar/
          renderer/
            update-button-top-bar-item.injectable.tsx
            ...
          
        preferences/
          renderer/
            update-channels-preference-item.injectable.tsx
            ...
          
        application-menu/
          main/
            update-channel-application-menu-item.injectable.tsx
            ...
            
        force-update-modal/
          renderer/
            force-update-modal.injectable.tsx
            ...
       
    tray/
      main/
        tray-menu-item-injection-token.ts
        ...
        
    top-bar/
      renderer/
        top-bar-item-injection-token.ts
        top-bar.tsx
        ...
        
    preferences/
      renderer/
        preference-item-injection-token.ts
        ...
        
      common/
        app-preferences-route.injectable.ts
        navigate-to-app-preferences.injectable.ts
        ...
        
      child-features/
        tray/
          main/
            navigate-to-preferences-tray-menu-item.injectable.ts 
            ...
```

## Consequences

#### Pros
1. We will start to focus on the features, not the technical details.
2. We can find everything related to a feature in a directory.
3. We can see everything that the application does by following the directory structure. "Screaming Architecture"
4. We can avoid coupling features too tightly by having visibility for dependency structure.
5. We can make the decision easier which direction dependencies between features should be. e.g. `tray depends on application-update` or `application-update depends on tray`.
6. We will write less rigid code, since each feature lives on "own island".
7. We can add new features without the need to modify old code.
8. We can introduce a single place to control whether a feature is enabled or not.
9. We can remove the concept of bundled extensions by controlling which features are included in the binary. 
10. We can simplify the Extension API to place where extensions introduce more features in runtime. This means that we are enforced to use the same API as extensions are. No more maintaining separate API.
11. We will write more reusable UI components without the business logic in them. Business logic comes from the feature, but UI code might be shared between features.

#### Cons
1. For a while our code will be organized in multiple ways. We will still have the old structure till everything has been reorganized.
2. Takes time to get used to the new structure.
