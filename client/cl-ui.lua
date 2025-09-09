--cl-ui.lua
local QBCore = exports['qb-core']:GetCoreObject()


-- باز کردن UI
RegisterCommand('mechanic', function()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action         = 'openUI',
        locales        = Config.Locales,
        currentLang    = Config.Locale,
        availableLangs = Config.AvailableLangs
    })
end)

-- بستن UI
RegisterNUICallback('closeUI', function(_, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

-- دریافت داده برای پنل فعال
RegisterNUICallback('getPanelData', function(data, cb)
    TriggerServerEvent('sm:server:requestPanelData', data.panel)
    cb('ok')
end)

-- تعمیر پارامتر
RegisterNUICallback('repairParam', function(data, cb)
    TriggerServerEvent('sm:server:repairParam', data.panel, data.param)
    cb('ok')
end)

-- نصب یا حذف پارامتر
RegisterNUICallback('toggleInstall', function(data, cb)
    TriggerServerEvent('sm:server:toggleInstall', data.panel, data.param)
    cb('ok')
end)