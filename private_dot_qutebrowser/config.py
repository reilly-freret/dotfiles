config.load_autoconfig()
config.set('messages.timeout', 10000)  # 10 seconds
config.bind('A', 'hint images userscript show_title')

# Bitwarden userscript shortcut
config.bind(',Bs', 'spawn --userscript qbw-simple --start-daemon')
config.bind(',Bx', 'spawn --userscript qbw-simple --stop-daemon')
config.bind(',U', 'spawn --userscript qbw-simple --username')
config.bind(',P', 'spawn --userscript qbw-simple --password')
config.bind(',O', 'spawn --userscript qbw-simple --totp')

