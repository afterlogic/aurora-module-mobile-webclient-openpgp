import addressUtils from 'src/utils/address'
import types from 'src/utils/types'

import openPgpHelper from './openpgp-helper'
import OpenPgpKey from './classes/open-pgp-key'

export const checkPgpKeys = async (keysArmorToImport, openPgpExternalKeys, myKeys) => {
  const keysFromArmor = await openPgpHelper.getArmorInfo(keysArmorToImport),
    keysBroken = [],
    keysAlreadyThere = [],
    keysPrivateExternal = [],
    keysToImport = []
  if (types.isNonEmptyArray(keysFromArmor)) {
    keysFromArmor.forEach((key) => {
      if (key) {
        const keyUsersIds = key.getUserIds(),
          keyEmail = keyUsersIds.length > 0 ? keyUsersIds[0] : '0',
          keyEmailParts = addressUtils.getEmailParts(keyEmail),
          sameUserKeys = openPgpHelper.getOwnKeysByEmails(
            [keyEmailParts.email],
            key.isPublic()
          ),
          hasSameExternalKey = !!openPgpExternalKeys.find(
            (externalKey) =>
              key.isPublic() && externalKey.sEmail === keyEmailParts.email
          ),
          hasSameMyKey = !!myKeys.find(
              (myKey) =>
                  (key.isPublic() && myKey.isPublic && myKey.email === keyEmailParts.email) ||
                  (!key.isPublic() && !myKey.isPublic && myKey.email === keyEmailParts.email)
          ),
          hasSameKey = sameUserKeys.length > 0 || hasSameExternalKey || hasSameMyKey,
          noEmail = !addressUtils.isCorrectEmail(keyEmailParts.email),
          bitSize = key.primaryKey.params[0].byteLength() * 8,
          keyData = new OpenPgpKey({
            armor: key.armor(),
            email: keyEmail,
            isPublic: key.isPublic(),
            isExternal: !openPgpHelper.isOwnEmail(keyEmailParts.email),
          })
        keyData.addInfo = key.isPublic()
          ? '(' + bitSize + '-bit, public)'
          : '(' + bitSize + '-bit, private)'
        keyData.checked = !hasSameKey && !noEmail

        if (noEmail) {
          keysBroken.push(keyData)
        } else if (hasSameKey) {
          keysAlreadyThere.push(keyData)
        } else if (
          !key.isPublic() &&
          !openPgpHelper.isOwnEmail(keyEmailParts.email)
        ) {
          keysPrivateExternal.push(keyData)
        } else {
          keysToImport.push(keyData)
        }
      }
    })
  }

  return {
    keysBroken,
    keysAlreadyThere,
    keysPrivateExternal,
    keysToImport,
  }
}

export const verifyPrivateKeyPassword = async (key, password) => {
  const keyData = new OpenPgpKey({
    armor: key.armor,
    email: key.email,
    isPublic: false,
    isExternal: false,
  })
  const isVerified = await openPgpHelper.verifyKeyPassword(keyData, password)

  return isVerified?.bVerified
}