import webApi from 'src/api/web-api'

export default {
  getExternalKeys: async () => {
    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'GetPublicKeysFromContacts',
      parameters: {},
      silentError: true,
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

  getPublicKeysByContactUUIDs: async (contactUUIDs) => {
    if (!Array.isArray(contactUUIDs) || !contactUUIDs.length) {
      return []
    }

    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'GetPublicKeysByCountactUUIDs',
      parameters: { ContactUUIDs: contactUUIDs },
      silentError: true,
    })
      .then(result => result || [])
      .catch(() => [])
  },

  setOpenPgpSettings: async (parameters) => {
    return webApi.sendRequest({
      moduleName: 'OpenPgpWebclient',
      methodName: 'UpdateSettings',
      parameters,
    })
      .then(result => result)
      .catch(() => false)
  },
}
