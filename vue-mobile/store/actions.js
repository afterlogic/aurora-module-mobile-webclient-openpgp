import openpgpWebApi from '../openpgp-web-api'

export default {
  asyncGetExternalsKeys: async ({ commit }) => {
    const externalKeys = await openpgpWebApi.getExternalKeys()
    commit('setExternalKeys', externalKeys)
  },

  asyncAddPublicKeys: async ({ commit }, keys) => {
    const result = openpgpWebApi.addPublicKeys({Keys: keys})
    if (result) {
      commit('setExternalKeys', keys)
    }
    return result
  },

  changeCurrentKeys: ({ commit }, keys) => {
    commit('setCurrentKeys', keys)
  }
}
