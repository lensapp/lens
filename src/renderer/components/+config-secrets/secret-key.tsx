/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import type { Secret } from "../../../common/k8s-api/endpoints";
import { base64, prevDefault } from "../../utils";
import { Icon } from "../icon";

export interface SecretKeyProps {
  secret: Secret;
  key: string;
}

export const SecretKey = ({ secret, key }: SecretKeyProps) => {
  const [showValue, setShowValue] = useState(false);

  const showKey = () => setShowValue(true);

  const value = secret?.data?.[key];

  if (showValue && value) {
    return <>{base64.decode(value)}</>;
  }

  return (
    <>
      {`secretKeyRef(${name}.${key})`}
      &nbsp;
      <Icon
        className="secret-button"
        material="visibility"
        tooltip="Show"
        onClick={prevDefault(showKey)}
      />
    </>
  );
};
