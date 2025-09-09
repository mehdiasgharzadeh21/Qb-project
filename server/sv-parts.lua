-- server/sv-parts.lua
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent('sm:server:getPartStock', function(panel)
  local src = source
  local stock = {}

  for _, part in ipairs(Config.Parts[panel] or {}) do
    exports.oxmysql:scalar('SELECT count FROM mechanic_parts WHERE name = ?', { part }, function(count)
      stock[part] = count or 0
      -- اگر همه قطعات بررسی شدند، ارسال به کلاینت
      if next(stock, #Config.Parts[panel]) == nil then
        TriggerClientEvent('sm:client:sendPartStock', src, panel, stock)
      end
    end)
  end
end)
