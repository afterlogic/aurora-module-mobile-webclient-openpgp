import { getOpenPgpSettings } from "../settings";
// import store from 'src/stores'
import { useOpenPGPStore } from 'src/stores/index-all'
// const coreStore = useCoreStore()
let settings = null

function OpenPgpKey({ armor, email, isPublic, id, isExternal = false }) {
  settings = getOpenPgpSettings()
  this.armor = armor
  this.email = email
  this.isPublic = isPublic
  this.isExternal = isExternal
  this.id = id ?? 'key-' + Math.round(Math.random() * 1000000)
  this.passphrase = null
}

OpenPgpKey.prototype.getDataToSave = function () {
  return {
    armor: this.armor,
    email: this.email,
    public: this.public,
  }
}

OpenPgpKey.prototype.getPassphrase = function () {
  if (!settings.rememberPassphrase) {
    // store.commit('openpgpmobile/setPassphrase', { sId: this.sId, sPassphrase: null })
    useOpenPGPStore.setPassphrase(null)
    return null
  }
  return this.passphrase
}

OpenPgpKey.prototype.setPassphrase = function (sPassphrase) {
  if (settings.rememberPassphrase) {
    // store.commit('openpgpmobile/setPassphrase', { sId: this.sId, sPassphrase })
    useOpenPGPStore.setPassphrase(sPassphrase)
  }
}

export default OpenPgpKey