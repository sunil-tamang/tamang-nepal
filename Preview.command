#!/bin/bash
# View the already-built website locally. Does not install or change anything.
cd "$(dirname "$0")" || exit 1
printf '\nTAMANG Nepal — local preview\nOpen http://127.0.0.1:5500\nPress Control+C to stop.\n\n'
if command -v python3 >/dev/null 2>&1 && python3 --version >/dev/null 2>&1; then
  exec python3 -m http.server 5500 --bind 127.0.0.1 --directory dist
elif command -v node >/dev/null 2>&1; then
  exec node scripts/preview.cjs
elif [ -x /usr/bin/ruby ] && /usr/bin/ruby -rwebrick -e 'exit 0' >/dev/null 2>&1; then
  exec /usr/bin/ruby -rwebrick -e 'server = WEBrick::HTTPServer.new(:Port => 5500, :BindAddress => "127.0.0.1", :DocumentRoot => File.expand_path("dist")); trap("INT") { server.shutdown }; server.start'
else
  printf 'No compatible preview runtime was found.\nUse the VS Code Live Server extension and open dist/index.html.\nOr install Python 3 or Node.js, then run this command again.\n'
  exit 1
fi
