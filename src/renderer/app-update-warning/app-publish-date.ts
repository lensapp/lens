/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";

export function appPublishDate(appVersion = "") {
  const dateFromVersion = appVersion.match(/\d{8}/);
  const date = moment(dateFromVersion?.[0], "YYYYMMDD");

  if (!date.isValid()) {
    return "";
  }

  return date.format("YYYY-MM-DD");
}
