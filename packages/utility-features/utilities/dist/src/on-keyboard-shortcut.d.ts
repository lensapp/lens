/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export declare function onKeyboardShortcut(descriptor: string, action: () => void): (this: Window, ev: WindowEventMap["keydown"]) => any;
