/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type React from "react";
export declare function prevDefault<E extends React.SyntheticEvent | Event, R>(callback: (evt: E) => R): (event: E) => R;
export declare function stopPropagation(evt: Event | React.SyntheticEvent): void;
