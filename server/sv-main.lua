-- server/sv-main.lua
local QBCore = exports['qb-core']:GetCoreObject()

-- هنگام شروع سرور
AddEventHandler('onResourceStart', function(resName)
  if GetCurrentResourceName() ~= resName then return end
  print(('[%s] %s'):format(resName, 'Santamonica Mechanic Loaded'))
end)
