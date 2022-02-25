import types from 'src/utils/types'

class OpenPgpSettings {
  constructor (appData) {
    const openPgpWebclientData = types.pObject(appData.OpenPgpWebclient)
    this.enableOpenPgpInMail = types.pBool(openPgpWebclientData.EnableModule)
    this.rememberPassphrase = types.pBool(openPgpWebclientData.RememberPassphrase)
  }
}

let settings = null

export default {
  init (appData) {
    console.log('settings')
    settings = new OpenPgpSettings(appData)
  },
}

const getOpenPgpSettings = () => {
  return settings
}
export { getOpenPgpSettings }
