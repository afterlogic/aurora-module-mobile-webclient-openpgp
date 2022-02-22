import openpgpWebApi from '../openpgp-web-api'

export default {
  asyncGetExternalsKeys: async ({ commit }) => {
    const externalKeys = await openpgpWebApi.getExternalKeys()
    commit('setExternalKeys', externalKeys)
  },

  asyncAddPublicKeys: async ({ commit }, keys) => {
    const result = await openpgpWebApi.addPublicKeys({Keys: keys})
    if (result) {
      commit('setExternalKeys', keys)
    }
    return result
  },

  setMyPublicKeys: ({ commit }, keys) => {
    commit('setMyPublicKeys', keys)
  },

  setMyPrivateKeys: ({ commit }, keys) => {
    commit('setMyPrivateKeys', keys)
  },

  setFilesKeys: ({ commit }, keys) => {
    commit('setFilesKeys', keys)
  },

  changeCurrentKeys: ({ commit }, keys) => {
    commit('setCurrentKeys', keys)
  },

  setCurrentMyKey: ({ commit }, key) => {
    commit('setCurrentMyKey', key)
  }
}
