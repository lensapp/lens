/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./secret.scss";

import moment from "moment";
import React, { useState } from "react";

import type { Secret } from "../../../common/k8s-api/endpoints";
import { prevDefault } from "../../utils";
import { Icon } from "../icon";

export interface ServiceAccountsSecretProps {
  secret: Secret;
}

export const ServiceAccountsSecret = ({ secret }: ServiceAccountsSecretProps) => {
  const [showToken, setShowToken] = useState(false);
  const { metadata: { name, creationTimestamp }, type } = secret;

  return (
    <div className="ServiceAccountsSecret box grow-fixed">
      <div className="secret-row">
        <span className="name">Name: </span>
        <span className="value">{name}</span>
      </div>
      <div className="secret-row">
        <span className="name">Value: </span>
        <span className="value flex align-center">
          {
            showToken
              ? <span className="raw-value">{secret.getToken()}</span>
              : (
                <>
                  <span className="asterisks">{"•".repeat(16)}</span>
                  <Icon
                    small material="lock_open"
                    tooltip="Show value"
                    onClick={prevDefault(() => setShowToken(true))}
                  />
                </>
              )
          }
        </span>
      </div>
      <div className="secret-row">
        <span className="name">Created at: </span>
        <span className="value" title={creationTimestamp}>
          {moment(creationTimestamp).format("LLL")}
        </span>
      </div>
      <div className="secret-row">
        <span className="name">Type: </span>
        <span className="value">{type}</span>
      </div>
    </div>
  );
};
