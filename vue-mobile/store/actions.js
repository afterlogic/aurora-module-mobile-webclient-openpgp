import openpgpWebApi from '../openpgp-web-api'
import OpenPgp from '../openpgp-helper'
import OpenPgpKey from "../classes/open-pgp-key";
import types from "../../../CoreMobileWebclient/vue-mobile/src/utils/types";

export default {
  asyncGetExternalsKeys: async ({ commit }) => {
    const externalKeys = await openpgpWebApi.getExternalKeys()
    const openPgpExternalKeys = []
    for (const key of externalKeys) {
      let aKeys = await OpenPgp.getArmorInfo(key.PublicPgpKey)
      if (types.isNonEmptyArray(aKeys)) {
        let aKeyUsersIds = aKeys[0].getUserIds()
        let sKeyEmail = aKeyUsersIds.length > 0 ? aKeyUsersIds[0] : '0'
        let oOpenPgpKey = new OpenPgpKey({
          armor: key.PublicPgpKey,
          email: key.Email,
          isPublic: true,
          isExternal: true,
        })
        oOpenPgpKey.fullEmail = sKeyEmail
        openPgpExternalKeys.push(oOpenPgpKey)
      }
    }
    commit('setExternalKeys', openPgpExternalKeys)
  },

  asyncRemoveExternalKey: ({ dispatch }, email) => {
    return openpgpWebApi.removeExternalKey({ Email: email })
  },

  asyncAddPublicKeys: async ({ dispatch }, keys) => {
    const result = await openpgpWebApi.addPublicKeys({Keys: keys})
    if (result) {
      dispatch('asyncGetExternalsKeys')
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
