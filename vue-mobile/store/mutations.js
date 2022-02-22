export default {
  setExternalKeys: (state, externalKeys) => {
    state.externalKeys = externalKeys
  },

  setMyPublicKeys: (state, myPublicKeys) => {
    state.myPublicKeys = myPublicKeys
  },

  setMyPrivateKeys: (state, myPrivateKeys) => {
    state.myPrivateKeys = myPrivateKeys
  },

  setFilesKeys: (state, filesKeys) => {
    state.filesKeys = filesKeys
  },

  setCurrentKeys: (state, keys) => {
    state.currentKeys = keys
  },

  setCurrentMyKey: (state, key) => {
    state.currentMyKey = key
  },
}
