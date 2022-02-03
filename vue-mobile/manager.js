import eventBus from 'src/event-bus'
import _ from 'lodash'

import settings from './settings'

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
      path: '/settings/open-pgp/my-keys',
      component: () => import('./components/settings/MyKeys'),
    },
  ])
}

export default {
  moduleName: 'SettingsMobileWebclient',

  requiredModules: [],

  init (appdata) {
    settings.init(appdata)
  },

  initSubscriptions (appData) {
    eventBus.$off('SettingsMobileWebclient::GetSettingsPageChildren', _getSettingsPageChildren)
    eventBus.$on('SettingsMobileWebclient::GetSettingsPageChildren', _getSettingsPageChildren)

    eventBus.$off('SettingsMobileWebclient::GetSettingsTabs', _getSettingsTabs)
    eventBus.$on('SettingsMobileWebclient::GetSettingsTabs', _getSettingsTabs)
  },
}
