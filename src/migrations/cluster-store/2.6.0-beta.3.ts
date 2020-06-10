import * as yaml from "js-yaml"

// Convert access token and expiry from arrays into strings
export function migration(store: any) {
  console.log("CLUSTER STORE, MIGRATION: 2.6.0-beta.3");
  for (const value of store) {
    const clusterKey = value[0];
    if(clusterKey === "__internal__") continue
    const cluster = value[1];
    if(!cluster.kubeConfig) continue
    const kubeConfig = yaml.safeLoad(cluster.kubeConfig)
    if(!kubeConfig.hasOwnProperty('users')) continue
    const userObj = kubeConfig.users[0]
    if (userObj) {
      const user = userObj.user
      if (user["auth-provider"] && user["auth-provider"].config) {
        const authConfig = user["auth-provider"].config
        if (authConfig["access-token"]) {
          authConfig["access-token"] = `${authConfig["access-token"]}`
        }
        if (authConfig.expiry) {
          authConfig.expiry = `${authConfig.expiry}`
        }
        console.log(authConfig)
        user["auth-provider"].config = authConfig
        kubeConfig.users = [{
          name: userObj.name,
          user: user
        }]
        cluster.kubeConfig = yaml.safeDump(kubeConfig)
        store.set(clusterKey, cluster)
      }
    }
  }
}
