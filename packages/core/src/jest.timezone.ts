/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Setting the timezone to UTC to ensure same timezone for CI and local environments
module.exports = async () => {
  process.env.TZ = "UTC";
};

export {};
