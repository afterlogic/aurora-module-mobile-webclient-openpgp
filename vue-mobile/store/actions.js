import openpgpWebApi from '../openpgp-web-api'

export default {
  asyncGetExternalsKeys: async ({ commit }) => {
    const externalKeys = await openpgpWebApi.getExternalKeys()
    commit('SET_EXTERNAL_KEYS', externalKeys)
  },

  asyncAddPublicKeys: async ({ commit }, keys) => {
    const result = openpgpWebApi.addPublicKeys({Keys: keys})
    if (result) {
      commit('SET_EXTERNAL_KEYS', keys)
    }
    return result
  },

  changeCurrentKeys: ({ commit }, keys) => {
    commit('SET_CURRENT_KEYS', keys)
  }
}
