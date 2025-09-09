-- server/sv-data.lua
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent('sm:server:requestPanelData', function(panel)
  local src   = source
  local ped   = QBCore.Functions.GetPlayer(src).PlayerData.source
  local veh   = GetVehiclePedIsIn(ped, false)
  local values = {}

  if not veh or veh == 0 then
    TriggerClientEvent('QBCore:Notify', src, 'No vehicle found', 'error')
    return
  end

  if panel == 'engine' then
    values = {
      ['engine-health'] = math.floor(GetVehicleEngineHealth(veh)),
      ['oil-level']     = 75,
      ['oil-pressure']  = 32,
      ['coolant-temp']  = math.floor(GetVehicleEngineTemperature(veh)),
      ['ignition-timing'] = 10,
      ['spark-wear']      = 40,
      ['engine-knock']    = 0,
      ['boost-pressure']  = 1.2
    }
  elseif panel == 'brakes' then
    values = {
      ['pad-thickness'] = 8,
      ['rotor-warp']    = 0.2,
      ['abs-health']    = 90
    }
  end

  TriggerClientEvent('sm:client:sendPanelData', src, panel, values)
end)
