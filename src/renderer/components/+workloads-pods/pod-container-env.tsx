import "./pod-container-env.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { IPodContainer, Secret } from "../../api/endpoints";
import { DrawerItem } from "../drawer";
import { autorun } from "mobx";
import { secretsStore } from "../+config-secrets/secrets.store";
import { configMapsStore } from "../+config-maps/config-maps.store";
import { Icon } from "../icon";
import { base64, cssNames } from "../../utils";
import _ from "lodash";

interface Props {
  container: IPodContainer;
  namespace: string;
}

export const ContainerEnvironment = observer((props: Props) => {
  const { container: { env, envFrom }, namespace } = props

  useEffect(
    () =>
      autorun(() => {
        env && env.forEach(variable => {
          const { valueFrom } = variable
          if (valueFrom && valueFrom.configMapKeyRef) {
            configMapsStore.load({ name: valueFrom.configMapKeyRef.name, namespace })
          }
        })
        envFrom && envFrom.forEach(item => {
          const { configMapRef } = item
          if (configMapRef && configMapRef.name) {
            configMapsStore.load({ name: configMapRef.name, namespace })
          }
        })
      }),
    []
  )

  const renderEnv = () => {
    const orderedEnv = _.sortBy(env, 'name');

    return orderedEnv.map(variable => {
      const { name, value, valueFrom } = variable
      let secretValue = null

      if (value) {
        secretValue = value
      }
      if (valueFrom) {
        const { fieldRef, secretKeyRef, configMapKeyRef } = valueFrom
        if (fieldRef) {
          const { apiVersion, fieldPath } = fieldRef
          secretValue = `fieldRef(${apiVersion}:${fieldPath})`
        }
        if (secretKeyRef) {
          secretValue = (
            <SecretKey
              reference={secretKeyRef}
              namespace={namespace}
            />
          )
        }
        if (configMapKeyRef) {
          const { name, key } = configMapKeyRef
          const configMap = configMapsStore.getByName(name, namespace)
          secretValue = configMap ?
            configMap.data[key] :
            `configMapKeyRef(${name}${key})`
        }
      }

      return (
        <div className="variable" key={name}>
          <span className="var-name">{name}</span>: {secretValue}
        </div>
      )
    })
  }

  const renderEnvFrom = () => {
    const envVars = envFrom.map(vars => {
      if (!vars.configMapRef || !vars.configMapRef.name) return
      const configMap = configMapsStore.getByName(vars.configMapRef.name, namespace)
      if (!configMap) return
      return Object.entries(configMap.data).map(([name, value]) => (
        <div className="variable" key={name}>
          <span className="var-name">{name}</span>: {value}
        </div>
      ))
    })
    return _.flatten(envVars)
  }

  return (
    <DrawerItem name={<Trans>Environment</Trans>} className="ContainerEnvironment">
      {env && renderEnv()}
      {envFrom && renderEnvFrom()}
    </DrawerItem>
  )
})

interface SecretKeyProps {
  reference: {
    name: string;
    key: string;
  };
  namespace: string;
}

const SecretKey = (props: SecretKeyProps) => {
  const { reference: { name, key }, namespace } = props
  const [loading, setLoading] = useState(false)
  const [secret, setSecret] = useState<Secret>()

  const showKey = async (evt: React.MouseEvent) => {
    evt.preventDefault()
    setLoading(true)
    const secret = await secretsStore.load({ name, namespace });
    setLoading(false)
    setSecret(secret)
  }

  if (secret?.data?.[key]) {
    return <>{base64.decode(secret.data[key])}</>
  }

  return (
    <>
      secretKeyRef({name}.{key})&nbsp;
      <Icon
        className={cssNames("secret-button", { loading })}
        material="visibility"
        tooltip={<Trans>Show</Trans>}
        onClick={showKey}
      />
    </>
  )
}
