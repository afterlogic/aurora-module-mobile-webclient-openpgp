'use strict';

module.exports = function (oAppData) {
	var App = require('%PathToCoreWebclientModule%/js/App.js');
	
	if (App.isUserNormalOrTenant())
	{
		return {
			start: function (ModulesManager) {
				if (ModulesManager.isModuleAvailable('SettingsWebclient'))
				{
					var OpenPgpSettingsFormView = require('modules/OpenPgpWebclient/js/views/OpenPgpSettingsFormView.js');
					OpenPgpSettingsFormView.ViewTemplate = '%ModuleName%_OpenPgpSettingsFormView';
				}
				
				var ShowKeyArmorPopup = require('modules/OpenPgpWebclient/js/popups/ShowKeyArmorPopup.js');
				ShowKeyArmorPopup.PopupTemplate = '%ModuleName%_ShowKeyArmorPopup';
				
				var ShowPublicKeysArmorPopup = require('modules/OpenPgpWebclient/js/popups/ShowPublicKeysArmorPopup.js');
				ShowPublicKeysArmorPopup.PopupTemplate = '%ModuleName%_ShowKeyArmorPopup';
				
				var ImportKeyPopup = require('modules/OpenPgpWebclient/js/popups/ImportKeyPopup.js');
				ImportKeyPopup.PopupTemplate = '%ModuleName%_ImportKeyPopup';
				
				var GenerateKeyPopup = require('modules/OpenPgpWebclient/js/popups/GenerateKeyPopup.js');
				GenerateKeyPopup.PopupTemplate = '%ModuleName%_GenerateKeyPopup';
			}
		};
	}
	
	return null;
};
