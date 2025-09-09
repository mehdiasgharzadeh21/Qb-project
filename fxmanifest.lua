fx_version 'cerulean'
game        'gta5'
description 'Santamonica Mechanic + Desktop + Minigame + Finance'

lua54       'yes'

-- صفحه UI اصلی
ui_page 'web/mechanic.html'

files {
  -- صفحات اصلی
  'web/mechanic.html',
  'web/desktop.html',
  'web/minigame.html',
  'web/finance.html',

  -- استایل‌ها
  'web/style/mechanic.css',
  'web/style/desktop.css',
  'web/style/minigame.css',
  'web/style/finance.css',

  -- اسکریپت‌ها
  'web/script/mechanic.js',
  'web/script/desktop.js',
  'web/script/minigame.js',
  'web/script/finance.js',

  -- آیکون‌ها و تصاویر
  'web/assets/icons/*.jpg',
  'web/assets/images/*',

  -- منابع مینی‌گیم (دایناسور)
  'web/minigame/Dino_T-rex/index.js',
  'web/minigame/Dino_T-rex/index.css',
  'web/minigame/Dino_T-rex/assets/default_100_percent/*',
  'web/minigame/Dino_T-rex/assets/default_200_percent/*'
}

dependencies {
  'qb-core'
}

shared_scripts {
  'config/config.lua',
  'config/locales.lua',
  'config/parts.lua',
  'config/roles.lua',
  'config/ui.lua'
}

client_scripts {
  'client/cl-main.lua',
  'client/cl-camera.lua',
  'client/cl-diagnostics.lua',
  'client/cl-repair.lua',
  'client/cl-ui.lua',
  'client/cl-desktop.lua'
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/sv-main.lua',
  'server/sv-data.lua',
  'server/sv-parts.lua',
  'server/sv-orders.lua',
  'server/sv-invoice.lua'
}
