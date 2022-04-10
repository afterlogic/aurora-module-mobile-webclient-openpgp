import webApi from 'src/api/web-api'

export default {
  getExternalKeys: async () => {
    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'GetPublicKeysFromContacts',
      parameters: {},
    })
      .then(result => result || [])
      .catch(error => [])
  },

  removeExternalKey: async (parameters) => {
    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'RemovePublicKeyFromContact',
      parameters,
    })
      .then(result => result)
      .catch(error => {
        throw error
      })
  },

  addPublicKeys: async (parameters) => {
    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'AddPublicKeysToContacts',
      parameters,
    })
      .then(result => result || [])
      .catch(error => [])
  },
}
