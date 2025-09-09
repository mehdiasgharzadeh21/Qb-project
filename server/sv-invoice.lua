-- server/sv-invoice.lua
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent('sm:server:createInvoice', function(panel, targetId, amount, desc)
  local src = source
  local Invoice = {
    type    = 'mechanic',
    number  = math.random(1111,9999),
    label   = 'Mechanic Service',
    amount  = amount,
    description = desc
  }
  exports['qb-bossmenu']:sendInvoice(Invoice, targetId)
  TriggerClientEvent('QBCore:Notify', src, 'Invoice sent: $'..amount, 'success')
end)
