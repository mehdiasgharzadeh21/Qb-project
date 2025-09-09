-- دریافت دیتا از سرور برای هر پنل
RegisterNetEvent('sm:client:sendPanelData', function(panel, values)
  SendNUIMessage({ action = 'updatePanel', panel = panel, values = values })
end)
