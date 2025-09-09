-- دریافت نتیجه تعمیر یا نصب/حذف
RegisterNetEvent('sm:client:setInstallState', function(panel, param, installed)
  SendNUIMessage({ action = 'setInstallState', panel = panel, param = param, installed = installed })
end)
