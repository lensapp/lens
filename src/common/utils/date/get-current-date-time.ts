/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import moment from "moment";

export const getCurrentDateTime = () => moment().utc().format();
