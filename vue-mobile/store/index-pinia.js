import { defineStore } from 'pinia'

import state from './state'
import actionsPinia from './actions-pinia'

export const useOpenPGPStore = defineStore('OpenPGPStore', {
  state: () => (state()),
  actions: actionsPinia,
})
