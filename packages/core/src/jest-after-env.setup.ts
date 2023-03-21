/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "@testing-library/jest-dom";

// Note: This is a kludge to prevent "Hooks cannot be defined inside tests" error
// when importing a test util inside a test suite.
import { render } from "@testing-library/react";
void render;
