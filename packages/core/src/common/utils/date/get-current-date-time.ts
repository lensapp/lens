/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import moment from "moment";

export const getCurrentDateTime = () => moment().utc().format();

export const getMillisecondsFromUnixEpoch = () => Date.now();

export const getSecondsFromUnixEpoch = () => Math.floor(getMillisecondsFromUnixEpoch() / 1000);
