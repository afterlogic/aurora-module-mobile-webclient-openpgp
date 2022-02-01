import typesUtils from 'src/utils/types'

class OpenPgpSettings {
  constructor (appData) {
    const openPgpWebclientData = typesUtils.pObject(appData.OpenPgpWebclient)
    this.enableOpenPgpInMail = typesUtils.pBool(openPgpWebclientData.EnableModule)
    this.rememberPassphrase = typesUtils.pBool(openPgpWebclientData.RememberPassphrase)
  }
}

let settings = null

export default {
  init (appData) {
    settings = new OpenPgpSettings(appData)
  },
}

const getOpenPgpSettings = () => {
  return settings
}
export { getOpenPgpSettings }
