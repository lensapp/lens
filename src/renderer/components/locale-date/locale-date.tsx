import React from "react";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import { userStore } from "../../../common/user-store";

interface Props {
  date: string
}

@observer
export class LocaleDate extends React.Component<Props> {
  render() {
    const { preferences } = userStore;
    const { date } = this.props;

    return <>{moment.tz(date, preferences.localeTimezone).format()}</>;
  }
}
