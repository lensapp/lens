export type Binding = string | {
    code: string;
    shift?: boolean;
    ctrl?: boolean;
    altOrOption?: boolean;
    meta?: boolean;
    ctrlOrCommand?: boolean;
};
export type KeyboardShortcut = {
    binding: Binding;
    invoke: () => void;
    scope?: string;
};
export declare const keyboardShortcutInjectionToken: import("@ogre-tools/injectable").InjectionToken<KeyboardShortcut, void>;
