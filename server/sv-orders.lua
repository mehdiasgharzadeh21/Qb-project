-- server/sv-orders.lua
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent('sm:server:orderPart', function(panel, part, qty)
  local src = source
  local Player = QBCore.Functions.GetPlayer(src)
  local price = Config.PartPrices[part]
  if not price then
    TriggerClientEvent('QBCore:Notify', src, 'Invalid part', 'error')
    return
  end
  price = price * qty
  if Player.Functions.RemoveMoney('bank', price) then
    exports.oxmysql:insert('INSERT INTO mechanic_orders (player, part, qty, time) VALUES (?,?,?,?)',
      { Player.PlayerData.citizenid, part, qty, os.time() })
    TriggerClientEvent('QBCore:Notify', src, 'Order placed: '..part..' x'..qty, 'success')
  else
    TriggerClientEvent('QBCore:Notify', src, 'Not enough money', 'error')
  end
end)
