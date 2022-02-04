function OpenPgpKey({ armor, email, isPublic, isExternal = false }) {
  this.armor = armor
  this.email = email
  this.isPublic = isPublic
  this.isExternal = isExternal
  this.id = 'key-' + Math.round(Math.random() * 1000000)
  this.passphrase = null
}

OpenPgpKey.prototype.getDataToSave = function () {
  return {
    armor: this.armor,
    email: this.email,
    public: this.public,
  }
}

// OpenPgpKey.prototype.getPassphrase = function () {
//   if (!openpgpSettings.bRememberPassphrase) {
//     store.commit('main/setPassphrase', { sId: this.sId, sPassphrase: null })
//     return null
//   }
//   return this.sPassphrase
// }

// OpenPgpKey.prototype.setPassphrase = function (sPassphrase) {
//   if (openpgpSettings.bRememberPassphrase) {
//     store.commit('main/setPassphrase', { sId: this.sId, sPassphrase })
//   }
// }

export default OpenPgpKey
