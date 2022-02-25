import openpgpWebApi from '../openpgp-web-api'
import OpenPgp from '../openpgp-helper'

export default {
  asyncGetExternalsKeys: async ({ commit }) => {
    const externalKeys = await openpgpWebApi.getExternalKeys()
    commit('setExternalKeys', externalKeys)
  },

  asyncRemoveExternalKey: ({ dispatch }, email) => {
    return openpgpWebApi.removeExternalKey({ Email: email })
  },

  asyncAddPublicKeys: async ({ commit }, keys) => {
    const result = await openpgpWebApi.addPublicKeys({Keys: keys})
    if (result) {
      commit('setExternalKeys', keys)
    }
    return result
  },

  generateKeys: ({ commit }, parameters) => {
    const { userId, password, keyLength, thenFn } = parameters

    const successResultFunction = (keyPair) => {
      const armor = keyPair.privateKeyArmored + keyPair.publicKeyArmored
      return OpenPgp.importMyKeys(armor).then(thenFn)
    }

    return OpenPgp.generateKey(userId, password, keyLength, successResultFunction)
  },

  importMyKeys: ({ commit }, checkedMyKeys) => {
    return OpenPgp.importMyKeys(checkedMyKeys)
  },

  deleteMyKey: ({ commit }, key) => {
    return OpenPgp.deleteKey(key)
  },

  setMyPublicKeys: ({ commit }, keys) => {
    commit('setMyPublicKeys', keys)
  },

  setMyPrivateKeys: ({ commit }, keys) => {
    commit('setMyPrivateKeys', keys)
  },

  setFilesKeys: ({ commit }, keys) => {
    commit('setFilesKeys', keys)
  },

  changeCurrentKeys: ({ commit }, keys) => {
    commit('setCurrentKeys', keys)
  },

  setCurrentMyKey: ({ commit }, key) => {
    commit('setCurrentMyKey', key)
  }
}
