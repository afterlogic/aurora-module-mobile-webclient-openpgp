
export const askOpenPgpKeyPassword = (sFullEmail, getParentComponent, fCallback) => {
    const oAppComponent = getParentComponent('App')
    const oAskOpenPgpKeyPasswordComponent = oAppComponent ? oAppComponent.$refs.AskOpenPgpKeyPassword : null
    if (oAskOpenPgpKeyPasswordComponent) {
        oAskOpenPgpKeyPasswordComponent.askOpenPgpKeyPassword(sFullEmail, fCallback)
    }
}
