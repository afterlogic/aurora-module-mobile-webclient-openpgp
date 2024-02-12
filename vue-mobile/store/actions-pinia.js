import openpgpWebApi from '../openpgp-web-api'
import OpenPgp from '../openpgp-helper'
import OpenPgpKey from '../classes/open-pgp-key'
import types from '../../../CoreMobileWebclient/vue-mobile/src/utils/types'

export default {
  async asyncGetExternalsKeys () {
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
    this.externalKeys = openPgpExternalKeys
  },

  asyncRemoveExternalKey (email) {
    return openpgpWebApi.removeExternalKey({ Email: email })
  },

  async asyncAddPublicKeys (keys) {
    const result = await openpgpWebApi.addPublicKeys({Keys: keys})
    if (result) {
      this.asyncGetExternalsKeys()
    }
    return result
  },

  generateKeys: (parameters) => {
    const { userId, password, keyLength, thenFn } = parameters

    const successResultFunction = (keyPair) => {
      const armor = keyPair.privateKeyArmored + keyPair.publicKeyArmored
      return OpenPgp.importMyKeys(armor).then(thenFn)
    }

    return OpenPgp.generateKey(userId, password, keyLength, successResultFunction)
  },

  importMyKeys: (checkedMyKeys) => {
    return OpenPgp.importMyKeys(checkedMyKeys)
  },

  deleteMyKey: (key) => {
    return OpenPgp.deleteKey(key)
  },

  setMyPublicKeys (keys) {
    this.myPublicKeys = keys
  },

  setMyPrivateKeys(keys) {
    this.myPrivateKeys = keys
  },

  setFilesKeys(keys) {
    this.filesKeys = keys
  },

  changeCurrentKeys(keys) {
    this.currentKeys = keys
  },

  setCurrentMyKey(key) {
    this.currentMyKey = key
  },

  setPassphrase(passphrase) {
    this.passphrase = passphrase
  },
}
