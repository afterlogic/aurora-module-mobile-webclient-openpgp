import _ from 'lodash'

const openpgpHelper = require('openpgp')

import store from 'src/store'
import addressUtils from 'src/utils/address'
import types from 'src/utils/types'
import notification from 'src/utils/notification'
import OpenPgpKey from './classes/open-pgp-key';

/**
 * @constructor
 */
function OpenPgp() {
  this.sPrefix = 'user_'
  this.oKeyring = new openpgpHelper.Keyring(new openpgpHelper.Keyring.localstore(this.sPrefix))
  this.aKeys = []
}

OpenPgp.prototype.initKeys = async function () {
  await this.oKeyring.load();
  this.reloadKeysFromStorage();
};

/**
 * @private
 */
OpenPgp.prototype.reloadKeysFromStorage = function () {
  const oOpenpgpKeys = this.oKeyring.getAllKeys()
  const newKeys = []

  _.each(oOpenpgpKeys, (oItem) => {
    if (oItem && oItem.primaryKey) {
      newKeys.push(new OpenPgpKey({
        armor: oItem.armor(),
        email: addressUtils.getEmailParts(oItem.users[0].userId.userid).email,
        isPublic: !oItem.isPrivate(),
        id: oItem.getKeyId().toHex()
      }))
    }
  })

  this.aKeys = newKeys

  store.dispatch('openpgpmobile/setMyPrivateKeys', this.aKeys.filter(key => !key.isPublic))
  store.dispatch('openpgpmobile/setMyPublicKeys', this.aKeys.filter(key => key.isPublic))
}


/**
 * @private
 * @param {Array} aKeys
 * @return {Array}
 */
OpenPgp.prototype.convertToNativeKeys = async function (aKeys) {
  const aNativeKeys = []

  async function addNativeKey(oKey) {
    const oKeysInfo = await openpgpHelper.key.readArmored(oKey.armor)
    aNativeKeys.push(oKeysInfo.keys[0])
  }

  for (const oKey of aKeys) {
    await addNativeKey(oKey)
  }

  return aNativeKeys
}

/**
 * @param {String} sUserID
 * @param {String} sPassword
 * @param {Number} nKeyLength
 * @param {Function} fOkHandler
 * @param {Function} fErrorHandler
 */
OpenPgp.prototype.generateKey = function (
  sUserID,
  sPassword,
  nKeyLength,
  fOkHandler,
  fErrorHandler
) {
  let oEmailParts = addressUtils.getEmailParts(sUserID),
    oOptions = {
      userIds: [{ name: oEmailParts.name, email: oEmailParts.email }],
      numBits: nKeyLength,
      passphrase: sPassword,
    }

  openpgpHelper.generateKey(oOptions).then(
    async (oKeyPair) => {
      if (_.isFunction(fOkHandler)) {
        fOkHandler(oKeyPair)
      }
    },
    function (err) {
      if (_.isFunction(fErrorHandler)) {
        fErrorHandler(err)
      }
    }
  )

  this.reloadKeysFromStorage();
}

/**
 * @private
 * @param {String} sArmor
 * @return {Array}
 */
OpenPgp.prototype.splitKeys = function (sArmor) {
  let aResult = [],
    iCount = 0,
    iLimit = 30,
    aMatch = null,
    sKey = _.trim(sArmor),
    oReg =
      /[\-]{3,6}BEGIN[\s]PGP[\s](PRIVATE|PUBLIC)[\s]KEY[\s]BLOCK[\-]{3,6}[\s\S]+?[\-]{3,6}END[\s]PGP[\s](PRIVATE|PUBLIC)[\s]KEY[\s]BLOCK[\-]{3,6}/gi

  //  If the key doesn't have any additional fields (for example "Version: 1.1"), this transformation corrupts the key.
  //  Seems like it is unnecessary transformation. Everything works fine without it.
  //  sKey = sKey.replace(/[\r\n]([a-zA-Z0-9]{2,}:[^\r\n]+)[\r\n]+([a-zA-Z0-9\/\\+=]{10,})/g, '\n$1---xyx---$2')
  //    .replace(/[\n\r]+/g, '\n').replace(/---xyx---/g, '\n\n')

  do {
    aMatch = oReg.exec(sKey)
    if (!aMatch || 0 > iLimit) {
      break
    }

    if (aMatch[0] && aMatch[1] && aMatch[2] && aMatch[1] === aMatch[2]) {
      if ('PRIVATE' === aMatch[1] || 'PUBLIC' === aMatch[1]) {
        aResult.push([aMatch[1], aMatch[0]])
        iCount++
      }
    }

    iLimit--
  } while (true)

  return aResult
}

/**
 * @param {String} sEmail
 * @return {Boolean}
 */
OpenPgp.prototype.isOwnEmail = function (sEmail) {
  if (store.getters['core/userPublicId'] === sEmail) {
    return true
  }

  let aOwnEmails = store.getters['mail/getAllAccountsFullEmails']
  return _.find(aOwnEmails, (sOwnEmail) => {
    let oEmailParts = addressUtils.getEmailParts(sOwnEmail)
    return sEmail === oEmailParts.email
  }) !== undefined
}

/**
 * @param {String} sArmor
 * @return {Promise}
 */
OpenPgp.prototype.importMyKeys = async function (sArmor) {
  sArmor = _.trim(sArmor)
  let iIndex = 0,
      iCount = 0,
      aData = null,
      aKeys = []

  if (!sArmor) {
    return false
  }

  aKeys = this.splitKeys(sArmor)

  for (iIndex = 0; iIndex < aKeys.length; iIndex++) {
    aData = aKeys[iIndex]
    if ('PRIVATE' === aData[0]) {
      try {
        await this.oKeyring.privateKeys.importKey(aData[1]);
        iCount++
      } catch (e) {
        throw new Error(e.message ?? e);
      }
    } else if ('PUBLIC' === aData[0]) {
      try {
        await this.oKeyring.publicKeys.importKey(aData[1]);
        iCount++
      } catch (e) {
        throw new Error(e.message ?? e);
      }
    }
  }

  if (0 < iCount) {
    try {
      await this.oKeyring.store();
    } catch (e) {
      throw new Error(e.message ?? e);
    }
  }

  this.reloadKeysFromStorage();

  return true
}

/**
 * @param {OpenPgp} oKey
 */
OpenPgp.prototype.deleteKey = async function (oKey) {
  if (oKey) {
    if (!oKey.isExternal) {
      try {
        this.oKeyring[oKey.isPublic ? 'publicKeys' : 'privateKeys'].removeForId(oKey.id)
        await this.oKeyring.store()

        this.reloadKeysFromStorage()
        return true
      }
      catch (e) {
        throw new Error(e.message ?? e)
      }
    }
  }
  return false
};

/**
 * @param {String} sArmor
 * @return {Promise}
 */
OpenPgp.prototype.getArmorInfo = async function (sArmor) {
  sArmor = _.trim(sArmor)
  let iIndex = 0,
    iCount = 0,
    oKey = null,
    aResult = [],
    aData = null,
    aKeys = []

  if (!sArmor) {
    return aResult
  }

  aKeys = this.splitKeys(sArmor)

  for (iIndex = 0; iIndex < aKeys.length; iIndex++) {
    aData = aKeys[iIndex]
    if ('PRIVATE' === aData[0]) {
      try {
        oKey = await openpgpHelper.key.readArmored(aData[1])
        if (oKey && !oKey.err && oKey.keys && oKey.keys[0]) {
          aResult.push(oKey.keys[0])
        }

        iCount++
      } catch (e) {
        aResult.push(null)
      }
    } else if ('PUBLIC' === aData[0]) {
      try {
        oKey = await openpgpHelper.key.readArmored(aData[1])
        if (oKey && !oKey.err && oKey.keys && oKey.keys[0]) {
          aResult.push(oKey.keys[0])
        }

        iCount++
      } catch (e) {
        aResult.push(null)
      }
    }
  }

  return aResult
}

/**
 * @param {String} sEmail
 * @param {Function} fAskForKeyPassword
 * @returns {Promise}
 */
OpenPgp.prototype.getPrivateOwnKeyAndPassphrase = function (
  sEmail,
  fAskForKeyPassword
) {
  return new Promise(async (resolve) => {
    let aPrivateKeys = this.getOwnKeysByEmails([sEmail], false),
      oPrivateKey = types.isNonEmptyArray(aPrivateKeys)
        ? aPrivateKeys[0]
        : null

    if (oPrivateKey) {
      let sPassphrase = oPrivateKey.getPassphrase()
      if (sPassphrase === null) {
        fAskForKeyPassword(oPrivateKey.sEmail, async (sPassphrase) => {
          let { bVerified, sError } = await this.verifyKeyPassword(
            oPrivateKey,
            sPassphrase
          )
          if (bVerified) {
            oPrivateKey.setPassphrase(sPassphrase)
            resolve({ oPrivateKey, sPassphrase })
          } else {
            resolve({ sError })
          }
        })
      } else {
        resolve({ oPrivateKey, sPassphrase })
      }
    } else {
      resolve({ sError: 'No private key found for ' + sEmail + ' user.' })
    }
  })
}

/**
 * @param {Object} oKey
 * @param {String} sPassphrase
 * @returns {Object}
 */
OpenPgp.prototype.verifyKeyPassword = async function (oKey, sPassphrase) {
  let oKeysInfo = await openpgpHelper.key.readArmored(oKey.armor)
  let oOpenPgpKey = oKeysInfo.keys[0]
  let sDecodeKeyError =
    'You might have entered the wrong password for %USER% key.'
  if (
    oOpenPgpKey &&
    oOpenPgpKey.primaryKey &&
    oOpenPgpKey.primaryKey.isDecrypted() &&
    sPassphrase === ''
  ) {
    //key is encoded with an empty password
    return { bVerified: true, oOpenPgpKey }
  } else if (oOpenPgpKey) {
    try {
      await oOpenPgpKey.decrypt(types.pString(sPassphrase))
      if (
        !oOpenPgpKey ||
        !oOpenPgpKey.primaryKey ||
        !oOpenPgpKey.primaryKey.isDecrypted()
      ) {
        return {
          bVerified: false,
          sError: sDecodeKeyError.replace('%USER%', oKey.email),
        }
      } else {
        return { bVerified: true, oOpenPgpKey }
      }
    } catch (e) {
      return {
        bVerified: false,
        sError: sDecodeKeyError.replace('%USER%', oKey.email),
      }
    }
  } else {
    return {
      bVerified: false,
      sError: sDecodeKeyError.replace('%USER%', oKey.email),
    }
  }
}

/**
 * @param {String} sKeyId
 * @param {Boolean} bPublic
 * @return {Object|null}
 */
OpenPgp.prototype.findKeyById = async function (sKeyId, bPublic) {
  bPublic = !!bPublic
  sKeyId = sKeyId.toLowerCase()

  let aAllOpenPgpKeys = this.getAllKeys(),
    oFoundOpenPgpKey = null
  for (let oOpenPgpKey of aAllOpenPgpKeys) {
    if (oOpenPgpKey && bPublic === oOpenPgpKey.isPublic) {
      let aNativeKeys = await this.convertToNativeKeys([oOpenPgpKey]),
        aKeysIds = types.isNonEmptyArray(aNativeKeys)
          ? aNativeKeys[0].getKeyIds()
          : []
      if (types.isNonEmptyArray(aKeysIds)) {
        let bFoundKeyId = !!_.find(aKeysIds, (oKeyId) => {
          return (
            oKeyId && oKeyId.toHex && sKeyId === oKeyId.toHex().toLowerCase()
          )
        })
        if (bFoundKeyId) {
          oFoundOpenPgpKey = oOpenPgpKey
          break
        }
      }
    }
  }

  return oFoundOpenPgpKey
}

/**
 * @param {String} sArmoredMessage
 * @return {Object|null}
 */
OpenPgp.prototype.getEncryptionKeyFromArmoredMessage = async function (
  sArmoredMessage
) {
  let oMessage = await openpgpHelper.message.readArmored(sArmoredMessage),
    aEncryptionKeys = oMessage.getEncryptionKeyIds(),
    oEncryptionKey = null

  if (aEncryptionKeys.length > 0) {
    for (let oKeyId of aEncryptionKeys) {
      let oKey = await this.findKeyById(oKeyId.toHex(), false)
      if (oKey) {
        oEncryptionKey = oKey
        break
      }
    }
  }

  return oEncryptionKey
}

/**
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {Array} aPublicKeys
 * @param {Function} fAskForKeyPassword
 * @param {Function} getParentComponent
 * @return {Promise}
 */
OpenPgp.prototype.decryptAndVerifyText = function (
  sData,
  oPrivateKey,
  aPublicKeys,
  fAskForKeyPassword,
  getParentComponent
) {
  return new Promise(async (resolve) => {
    let sPassphrase = oPrivateKey.getPassphrase()
    if (sPassphrase === null) {
      fAskForKeyPassword(oPrivateKey.sEmail, getParentComponent, (sPassphrase) => {
        resolve(
          this.decryptAndVerifyTextWithPassphrase(
            sData,
            oPrivateKey,
            sPassphrase,
            aPublicKeys
          )
        )
      })
    } else {
      resolve(
        this.decryptAndVerifyTextWithPassphrase(
          sData,
          oPrivateKey,
          sPassphrase,
          aPublicKeys
        )
      )
    }
  })
}

/**
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {String} sPassphrase
 * @param {Array} aPublicKeys
 * @return {Object}
 */
OpenPgp.prototype.decryptAndVerifyTextWithPassphrase = async function (
  sData,
  oPrivateKey,
  sPassphrase,
  aPublicKeys
) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(
    oPrivateKey,
    sPassphrase
  )
  if (bVerified && oOpenPgpKey) {
    oPrivateKey.setPassphrase(sPassphrase)
    let oOptions = {
      message: await openpgpHelper.message.readArmored(sData),
      privateKeys: [oOpenPgpKey], // for decryption
    }
    if (types.isNonEmptyArray(aPublicKeys)) {
      oOptions.publicKeys = await this.convertToNativeKeys(aPublicKeys) // for verification (optional)
    }
    let aKeyIds = oOptions.message
      .getEncryptionKeyIds()
      .map((oKeyId) => oKeyId.toHex())
    let hasPrivateKey = await this.findKeyById(aKeyIds[0], /*bPublic*/ true)
    if (!hasPrivateKey) {
      return {
        sError: 'No private key found for file decryption.',
      }
    }
    try {
      let oPgpResult = await openpgpHelper.decrypt(oOptions)
      if (oPgpResult && oPgpResult.data) {
        let oResult = {
          sDecryptedData: await openpgpHelper.stream.readToEnd(oPgpResult.data),
        }
        if (
          _.isArray(oPgpResult.signatures) &&
          oPgpResult.signatures.length === 0
        ) {
          oResult.sReport =
            'Message was successfully decrypted and it was not signed while creating.'
        } else if (
          types.isNonEmptyArray(oPgpResult.signatures) &&
          oPgpResult.signatures[0].valid
        ) {
          oResult.sReport = 'Message was successfully decrypted and verified.'
        } else {
          oResult.sReport =
            'Message was successfully decrypted but not verified.'
        }
        return oResult
      } else {
        return { sError: 'An error occurred during decrypting the message.' }
      }
    } catch (oError) {
      return {
        sError:
          'An error occurred during decrypting the message (' +
          oError.message +
          ').',
      }
    }
  } else {
    return { sError }
  }
}
/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @return {Object}
 */
OpenPgp.prototype.verifyText = async function (sData, aPublicKeys) {
  let oOptions = {
    message: await openpgpHelper.cleartext.readArmored(sData),
    publicKeys: await this.convertToNativeKeys(aPublicKeys), // for verification
  }

  try {
    let oPgpResult = await openpgpHelper.verify(oOptions)
    if (
      types.isNonEmptyArray(oPgpResult.signatures) &&
      oPgpResult.signatures[0].valid
    ) {
      return { sVerifiedData: oPgpResult.data }
    } else {
      return { sError: 'Message was not verified.' }
    }
  } catch (oError) {
    return { sError: 'Message was not verified (' + oError.message + ').' }
  }
}

/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @return {Object}
 */
OpenPgp.prototype.encryptText = async function (sData, aPublicKeys) {
  let oOptions = {
    message: openpgpHelper.message.fromText(sData),
    publicKeys: await this.convertToNativeKeys(aPublicKeys),
  }
  try {
    let oPgpResult = await openpgpHelper.encrypt(oOptions)
    if (oPgpResult && oPgpResult.data) {
      return { sEncryptedData: oPgpResult.data }
    } else {
      return { sError: 'An error occurred during encrypting the message.' }
    }
  } catch (oError) {
    return {
      sError:
        'An error occurred during encrypting the message (' +
        oError.message +
        ').',
    }
  }
}

/**
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {Function} fAskForKeyPassword
 * @return {Promise}
 */
OpenPgp.prototype.signText = function (
  sData,
  oPrivateKey,
  fAskForKeyPassword
) {
  return new Promise(async (resolve) => {
    let sPassphrase = oPrivateKey.getPassphrase()
    if (sPassphrase === null) {
      fAskForKeyPassword(oPrivateKey.sEmail, (sPassphrase) => {
        resolve(this.signTextWithPassphrase(sData, oPrivateKey, sPassphrase))
      })
    } else {
      resolve(this.signTextWithPassphrase(sData, oPrivateKey, sPassphrase))
    }
  })
}

/**
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {String} sPassphrase
 * @return {Object}
 */
OpenPgp.prototype.signTextWithPassphrase = async function (
  sData,
  oPrivateKey,
  sPassphrase
) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(
    oPrivateKey,
    sPassphrase
  )
  if (bVerified && oOpenPgpKey) {
    oPrivateKey.setPassphrase(sPassphrase)
    let oOptions = {
      message: openpgpHelper.cleartext.fromText(sData),
      privateKeys: oOpenPgpKey,
    }
    try {
      let oPgpResult = await openpgpHelper.sign(oOptions)
      if (oPgpResult && oPgpResult.data) {
        return { sSignedData: oPgpResult.data }
      } else {
        return { sError: 'An error occurred during signing the message.' }
      }
    } catch (oError) {
      return {
        sError:
          'An error occurred during signing the message (' +
          oError.message +
          ').',
      }
    }
  } else {
    return { sError }
  }
}

/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @param {Object} oPrivateKey
 * @param {Function} fAskForKeyPassword
 * @return {Promise}
 */
OpenPgp.prototype.signAndEncryptText = function (
  sData,
  aPublicKeys,
  oPrivateKey,
  fAskForKeyPassword
) {
  return new Promise(async (resolve) => {
    let sPassphrase = oPrivateKey.getPassphrase()
    if (sPassphrase === null) {
      fAskForKeyPassword(oPrivateKey.sEmail, (sPassphrase) => {
        resolve(
          this.signAndEncryptTextWithPassphrase(
            sData,
            aPublicKeys,
            oPrivateKey,
            sPassphrase
          )
        )
      })
    } else {
      resolve(
        this.signAndEncryptTextWithPassphrase(
          sData,
          aPublicKeys,
          oPrivateKey,
          sPassphrase
        )
      )
    }
  })
}

/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @param {Object} oPrivateKey
 * @param {String} sPassphrase
 * @return {Object}
 */
OpenPgp.prototype.signAndEncryptTextWithPassphrase = async function (
  sData,
  aPublicKeys,
  oPrivateKey,
  sPassphrase
) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(
    oPrivateKey,
    sPassphrase
  )
  if (bVerified && oOpenPgpKey) {
    oPrivateKey.setPassphrase(sPassphrase)
    let oOptions = {
      message: openpgpHelper.message.fromText(sData),
      publicKeys: await this.convertToNativeKeys(aPublicKeys), // for encryption
      privateKeys: oOpenPgpKey, // for signing (optional)
    }
    try {
      let oPgpResult = await v.encrypt(oOptions)
      if (oPgpResult && oPgpResult.data) {
        return { sEncryptedSignedData: oPgpResult.data }
      } else {
        return {
          sError: 'An error occurred during encrypting or signing the message.',
        }
      }
    } catch (oError) {
      return {
        sError:
          'An error occurred during encrypting or signing the message (' +
          oError.message +
          ').',
      }
    }
  } else {
    return { sError }
  }
}

/**
 * @return {Array}
 */
OpenPgp.prototype.getAllKeys = function () {
  const ownOpenPgpKeys = store.getters['openpgpmobile/myPublicKeys'],
  externalOpenPgpKeys = store.getters['openpgpmobile/externalKeys']
  return ownOpenPgpKeys.concat(externalOpenPgpKeys)

}

/**
 * @return {Object|null}
 */
;(OpenPgp.prototype.getCurrentPrivateOwnKey = function (
  bAllowShowError = true
) {
  let aOpenPgpKeys = store.getters['main/getOpenPgpKeys'],
    oCurrentAccount = store.getters['mail/getCurrentAccount'],
    oPrivateCurrentKey = _.find(aOpenPgpKeys, (oKey) => {
      let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
      return !oKey.bPublic && oKeyEmail.email === oCurrentAccount.sEmail
    })
  if (oPrivateCurrentKey) {
    return oPrivateCurrentKey
  } else {
    if (bAllowShowError) {
      notification.showError(
        'No private key found for ' + oCurrentAccount.sEmail + ' user.'
      )
    }
    return null
  }
}),
  /**
   * @param {Array} aEmail
   * @param {Boolean} bIsPublic
   * @return {Array}
   */
  (OpenPgp.prototype.getOwnKeysByEmails = function (aEmail, bIsPublic) {
    bIsPublic = !!bIsPublic

    let aOpenPgpKeys = store.getters['openpgpmobile/externalKeys']
    let aResult = []

    _.each(aEmail, (sEmail) => {
      let oKey = _.find(aOpenPgpKeys, (oKey) => {
        let oKeyEmail = addressUtils.getEmailParts(oKey.Email)
        return oKey.bPublic === bIsPublic && oKeyEmail.email === sEmail
      })

      if (oKey) {
        aResult.push(oKey)
      }
    })

    return aResult
  })

/**
 * @param {String} email
 * @return {Object|null}
 */
OpenPgp.prototype.getPrivateKeyByEmail = function (email) {
  let openPgpKeys = store.getters['openpgpmobile/myPrivateKeys']
  let privateKeys = _.filter(openPgpKeys, (key) => {
    let keyEmail = addressUtils.getEmailParts(key.email)
    return !key.isPublic && keyEmail.email === email
  })
  if (privateKeys.length > 0) {
    return privateKeys[0]
  } else {
    return null
  }
}

/**
 * @param {String} email
 * @return {Object|null}
 */
OpenPgp.prototype.getPublicKeyByEmail = function (email) {
  let publicKey = _.find(this.getAllKeys(), (key) => {
    let keyEmail = addressUtils.getEmailParts(key.email || key.Email)
    return key.isPublic && keyEmail.email === email
  })
  return publicKey ? publicKey : null
}

/**
 * @return {String}
 */
OpenPgp.prototype.generatePassword = function () {
  let sPassword = ''

  if (window.crypto) {
    let oPassword = window.crypto.getRandomValues(new Uint8Array(10))
    sPassword = btoa(String.fromCharCode.apply(null, oPassword))
    sPassword = sPassword.replace(/[^A-Za-z0-9]/g, '')
  } else {
    const sSymbols =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!;%:?*()_+='
    for (let i = 0; i < this.iPasswordLength; i++) {
      sPassword += sSymbols.charAt(Math.floor(Math.random() * sSymbols.length))
    }
  }

  return sPassword
}

/**
 * @param {Mixed} mData
 * @param {String} sUserEmail
 * @param {Array} aPrincipalsEmail
 * @param {Boolean} bPasswordBasedEncryption
 * @param {Object} oPrivateUserKey
 * @param {Boolean} bSign
 * @param {Function} fAskForKeyPassword
 * @param {Function} getParentComponent
 * @return {Object}
 */
OpenPgp.prototype.encryptData = async function (
  mData,
  sUserEmail,
  aPrincipalsEmail,
  bPasswordBasedEncryption,
  bSign,
  fAskForKeyPassword,
  getParentComponent,
  oPrivateUserKey
) {
  return new Promise(async (resolve) => {
    if (!bPasswordBasedEncryption && bSign) {
      if (oPrivateUserKey) {
        let sPassphrase = oPrivateUserKey.getPassphrase()
        if (sPassphrase === null) {
          fAskForKeyPassword(oPrivateUserKey.email, getParentComponent, async (sPassphrase) => {
            let oResult = await this.encryptDataWithPassphrase(
              mData,
              sUserEmail,
              oPrivateUserKey,
              aPrincipalsEmail,
              bPasswordBasedEncryption,
              bSign,
              sPassphrase
            )
            oResult.sPassphrase = sPassphrase
            resolve(oResult)
          })
        } else {
          let oResult = await this.encryptDataWithPassphrase(
            mData,
            sUserEmail,
            oPrivateUserKey,
            aPrincipalsEmail,
            bPasswordBasedEncryption,
            bSign,
            sPassphrase
          )
          oResult.sPassphrase = sPassphrase
          resolve(oResult)
        }
      } else {
        return { sError: 'No private key found for ' + sUserEmail + ' user.' }
      }
    } else {
      resolve(
        this.encryptDataWithPassphrase(
          mData,
          sUserEmail,
          oPrivateUserKey,
          aPrincipalsEmail,
          bPasswordBasedEncryption,
          bSign,
          null
        )
      )
    }
  })
}

/**
 * @param {Mixed} mData
 * @param {String} sUserEmail
 * @param {Object} oPrivateUserKey
 * @param {Array} aPrincipalsEmails
 * @param {Boolean} bPasswordBasedEncryption
 * @param {Boolean} bSign
 * @param {String} sPassphrase
 * @return {Object}
 */
OpenPgp.prototype.encryptDataWithPassphrase = async function (
  mData,
  sUserEmail,
  oPrivateUserKey,
  aPrincipalsEmails,
  bPasswordBasedEncryption,
  bSign,
  sPassphrase
) {
  let sPassword = '',
    bIsBlob = mData instanceof Blob,
    oOptions = {}

  if (bIsBlob) {
    let oBuffer = await new Response(mData).arrayBuffer()
    oOptions.message = openpgpHelper.message.fromBinary(new Uint8Array(oBuffer))
    oOptions.armor = false
    mData = null
    oBuffer = null
  } else {
    oOptions.message = openpgpHelper.message.fromText(mData)
  }

  if (bPasswordBasedEncryption) {
    sPassword = this.generatePassword()
    oOptions.passwords = [sPassword]
  } else {
    let aPublicKeys = []
    if (aPrincipalsEmails.length) {
      aPrincipalsEmails.map((email) => {
        let oPrincipalPublicKey = this.getPublicKeyByEmail(email)
        if (oPrincipalPublicKey) {
          aPublicKeys.push(oPrincipalPublicKey)
        } else {
          return { sError: 'No public key found for ' + email + ' user.' }
        }
      })
    }
    let oUserPublicKey = this.getPublicKeyByEmail(sUserEmail)
    if (oUserPublicKey) {
      aPublicKeys.push(oUserPublicKey)
    }
    oOptions.publicKeys = await this.convertToNativeKeys(aPublicKeys)
  }
  if (!bPasswordBasedEncryption && bSign && oPrivateUserKey) {
    let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(
      oPrivateUserKey,
      sPassphrase
    )
    if (bVerified && oOpenPgpKey) {
      oPrivateUserKey.setPassphrase(sPassphrase)
      oOptions.privateKeys = [oOpenPgpKey]
    } else {
      return { sError }
    }
  }

  try {
    let oPgpResult = await openpgpHelper.encrypt(oOptions)
    if (oPgpResult && (oPgpResult.data || (bIsBlob && oPgpResult.message))) {
      return {
        sEncryptedData: bIsBlob
          ? oPgpResult.message.packets.write()
          : oPgpResult.data,
        sPassword,
      }
    } else {
      return { sError: 'An error occurred during encrypting the data.' }
    }
  } catch (oError) {
    return {
      sError:
        'An error occurred during encrypting the data (' +
        oError.message +
        ').',
    }
  }
}

OpenPgp.prototype.getKeysInfo = async function (pgpKeys) {
  let oKeysInfo = await openpgpHelper.key.readArmored(pgpKeys)
  let aKeysInfo = []
  if (oKeysInfo.keys.length) {
    for (let i = 0; i < oKeysInfo.keys.length; i++) {
      let oKeyData = {}
      oKeyData.iBitSize =
        oKeysInfo.keys[0].primaryKey.params[i].byteLength() * 8
      oKeyData.sType = oKeysInfo.keys[i].isPublic() ? 'public' : 'private'
      oKeyData.sUserId = oKeysInfo.keys[i].users[0].userId.userid
      oKeyData.sMail = oKeysInfo.keys[i].users[0].userId.email
      aKeysInfo.push(oKeyData)
    }
  } else {
    aKeysInfo = []
  }
  return aKeysInfo
}

export default new OpenPgp()
