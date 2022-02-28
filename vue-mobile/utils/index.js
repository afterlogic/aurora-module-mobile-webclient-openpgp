export const askOpenPgpKeyPassword = (sFullEmail, getParentComponent, fCallback) => {
  const oAppComponent = getParentComponent('App')
  const oAskOpenPgpKeyPasswordComponent = oAppComponent ? oAppComponent.$refs.AskOpenPgpKeyPassword : null
  if (oAskOpenPgpKeyPasswordComponent) {
    oAskOpenPgpKeyPasswordComponent.askOpenPgpKeyPassword(sFullEmail, fCallback)
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
