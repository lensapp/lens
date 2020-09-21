export function kubeconfig({
  username, clusterName, clientId, idpCertificateAuthorityData, idpIssuerUrl,
  idToken, refreshToken, server, apiCertificate
}) {
  return {
    apiVersion: 'v1',
    clusters: [
      {
        name: clusterName,
        cluster: {
          'certificate-authority-data': apiCertificate,
          server
        }
      }
    ],
    contexts: [
      {
        context: {
          cluster: clusterName,
          user: username
        },
        name: `${username}@${clusterName}`
      }
    ],
    'current-context': `${username}@${clusterName}`,
    kind: 'Config',
    preferences: {},
    users: [
      {
        name: username,
        user: {
          'auth-provider': {
            config: {
              'client-id': clientId,
              'id-token': idToken,
              'idp-certificate-authority-data': idpCertificateAuthorityData,
              'idp-issuer-url': idpIssuerUrl,
              'refresh-token': refreshToken
            },
            name: 'oidc'
          }
        }
      }
    ]
  };
}