/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import { UserStore } from "../../../common/user-store";

export interface LocaleDateProps {
  date: string;
}

@observer
export class LocaleDate extends React.Component<LocaleDateProps> {
  render() {
    const { date } = this.props;

    return moment.tz(date, UserStore.getInstance().localeTimezone).format();
  }
}
