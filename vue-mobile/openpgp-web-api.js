import webApi from 'src/api/web-api'

export default {
  getExternalKeys: async () => {
    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'GetPublicKeysFromContacts',
      parameters: {},
    })
      .then((result) => {
        if (result) {
          return result
        }
        return []
      })
      .catch(() => {
        return []
      })
  },

  addPublicKeys: async (parameters) => {
    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'AddPublicKeysToContacts',
      parameters,
    })
      .then((result) => {
        if (result) {
          return result
        }
        return []
      })
      .catch(() => {
        return []
      })
  },
}