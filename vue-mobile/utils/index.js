import _ from 'lodash'
export const askOpenPgpKeyPassword = (sFullEmail, getParentComponent, fCallback) => {
  const oAppComponent = getParentComponent('App')
  console.log(oAppComponent, 'oAppComponent')
  const oAskOpenPgpKeyPasswordComponent = oAppComponent ? oAppComponent.$refs.AskOpenPgpKeyPassword : null
  console.log(oAskOpenPgpKeyPasswordComponent[0], 'oAskOpenPgpKeyPasswordComponent')
  if (oAskOpenPgpKeyPasswordComponent.length) {
    if (_.isFunction(oAskOpenPgpKeyPasswordComponent[0].askOpenPgpKeyPassword)) {
      oAskOpenPgpKeyPasswordComponent[0].askOpenPgpKeyPassword(sFullEmail, fCallback)
    }
  }
}

export const downloadKey = (text, fileName) => {
  const data = new Blob([text], { type: 'text/plain' })
  const textFile = window.URL.createObjectURL(data)

  const link = document.createElement('a')
  link.setAttribute('download', fileName)
  link.href = textFile
  document.body.appendChild(link);

  window.requestAnimationFrame(() => {
    const event = new MouseEvent('click');
    link.dispatchEvent(event)
    document.body.removeChild(link)
  });
}
