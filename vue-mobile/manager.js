import _ from 'lodash'

import eventBus from 'src/event-bus'
// import store from 'src/store'

import { useOpenPGPStore } from './store/index-pinia'

import { defineAsyncComponent, shallowRef } from "vue";

import settings from './settings'
import { i18n } from "../../CoreMobileWebclient/vue-mobile/src/boot/i18n";
import openPgpHelper from './openpgp-helper'



const _getSettingsTabs = params => {
  if (!_.isArray(params.settingsTabs)) {
    params.settingsTabs = []
  }
  params.settingsTabs = params.settingsTabs.concat([
    {
      routerPath: '/settings/open-pgp',
      tabNameLangConst: 'OPENPGPWEBCLIENT.LABEL_SETTINGS_TAB',
      getIconComponent: () => import('./components/icons/PgpIcon'),
    },
  ])
}


const setComponents = (components) => {
  components.push({
    name: 'AskOpenPgpKeyPassword',
    component: shallowRef(defineAsyncComponent(() => import('./components/common/AskOpenPgpKeyPassword'))),
  })
  components.push({
    name: 'FileUploadTypeSelectionDialog',
    component: shallowRef(defineAsyncComponent(() => import('../../CoreParanoidEncryptionWebclientPlugin/vue-mobile/components/files/dialogs/FileUploadTypeSelectionDialog')))
  })
}

const setContactsMobileWebclientComponents = (components) => {
  components.push({
    name: 'ImportKeyForString',
    component: shallowRef(defineAsyncComponent(() => import('./components/contacts/dialogs/ImportKeyForString'))),
  })
}

const _getSettingsPageChildren = params => {
  if (!_.isArray(params.settingsPageChildren)) {
    params.settingsPageChildren = []
  }
  params.settingsPageChildren = params.settingsPageChildren.concat([
    {
      path: '/settings/open-pgp',
      component: () => import('./components/settings/OpenPgp'),
    },
    {
      path: '/settings/open-pgp/external-keys',
      component: () => import('./components/settings/ExternalKeys'),
    },
    {
      path: '/settings/open-pgp/external-keys/:key',
      component: () => import('./components/settings/ExternalKeyView'),
    },
    {
      path: '/settings/open-pgp/all-external-keys',
      component: () => import('./components/settings/AllExternalKeysView')
    },
    {
      path: '/settings/open-pgp/my-keys',
      component: () => import('./components/settings/MyKeys'),
    },
    {
      path: '/settings/open-pgp/my-keys/:key',
      component: () => import('./components/settings/MyKeyView'),
    },
  ])
}

const _getSettingsHeaderTitles = params => {
  if (!_.isArray(params.settingsHeaderTitles)) {
    params.settingsHeaderTitles = []
  }
  params.settingsHeaderTitles = params.settingsHeaderTitles.concat([
    {
      settingsPath: '/settings/open-pgp',
      settingsTitle: i18n.global.t('OPENPGPWEBCLIENT.LABEL_SETTINGS_TAB'),
    },
    {
      settingsPath: '/settings/open-pgp/external-keys',
      settingsTitle: i18n.global.t('OPENPGPMOBILEWEBCLIENT.LABEL_EXTERNAL_PUBLIC_KEYS'),
    },
    {
      settingsPath: '/settings/open-pgp/external-keys/:key',
      settingsTitle: i18n.global.t('OPENPGPMOBILEWEBCLIENT.LABEL_VIEW_PUBLIC_KEY'),
    },
    {
      settingsPath: '/settings/open-pgp/all-external-keys',
      settingsTitle: i18n.global.t('OPENPGPMOBILEWEBCLIENT.LABEL_ALL_PUBLIC_KEYS'),
    },
    {
      settingsPath: '/settings/open-pgp/my-keys',
      settingsTitle: i18n.global.t('OPENPGPMOBILEWEBCLIENT.LABEL_MY_KEYS'),
    },
    {
      settingsPath: '/settings/open-pgp/my-keys/:key',
      settingsTitle: i18n.global.t('OPENPGPMOBILEWEBCLIENT.LABEL_MY_KEY'),
    },
  ])
}

export default {
  moduleName: 'SettingsMobileWebclient',

  requiredModules: [],

  async init(appdata) {
    settings.init(appdata)
    await this.initMyKeys()
  },

  async initMyKeys() {
    const OpenPGPStore = useOpenPGPStore()
    
    await openPgpHelper.initKeys()

    const { aKeys } = openPgpHelper
    // store.dispatch('openpgpmobile/setMyPrivateKeys', )
    // store.dispatch('openpgpmobile/setMyPublicKeys', aKeys.filter(key => key.isPublic))
    // store.dispatch('openpgpmobile/asyncGetExternalsKeys')

    OpenPGPStore.setMyPrivateKeys(aKeys.filter(key => !key.isPublic))
    OpenPGPStore.setMyPublicKeys(aKeys.filter(key => key.isPublic))
    OpenPGPStore.asyncGetExternalsKeys()
  },

  initSubscriptions (appData) {
    eventBus.$off('CoreMobileWebclient::CheckComponents', setComponents)
    eventBus.$on('CoreMobileWebclient::CheckComponents', setComponents)

    eventBus.$off('SettingsMobileWebclient::GetSettingsPageChildren', _getSettingsPageChildren)
    eventBus.$on('SettingsMobileWebclient::GetSettingsPageChildren', _getSettingsPageChildren)


    eventBus.$off('SettingsMobileWebclient::GetSettingsTabs', _getSettingsTabs)
    eventBus.$on('SettingsMobileWebclient::GetSettingsTabs', _getSettingsTabs)

    eventBus.$off('SettingsMobileWebclient::GetSettingsHeaderTitles', _getSettingsHeaderTitles)
    eventBus.$on('SettingsMobileWebclient::GetSettingsHeaderTitles', _getSettingsHeaderTitles)

    eventBus.$off('ContactsMobileWebclient::setComponents', setContactsMobileWebclientComponents)
    eventBus.$on('ContactsMobileWebclient::setComponents', setContactsMobileWebclientComponents)

    eventBus.$emit('CoreMobileWebclient::InitSubscription')
  },
}
