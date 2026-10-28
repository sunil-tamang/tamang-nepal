#!/bin/bash
# Shared runtime discovery. Source this from the project launchers.
modern_ruby() {
  command -v ruby >/dev/null 2>&1 && ruby --disable-gems -e 'v = RUBY_VERSION.split(".").map(&:to_i); exit(v[0] == 3 && v[1] >= 2 ? 0 : 1)'
}
if ! modern_ruby; then
  for prefix in /opt/homebrew/opt /usr/local/opt; do
    for version in 3.3 3.2 3.4 3.5; do
      if [ -x "$prefix/ruby@$version/bin/ruby" ]; then
        export PATH="$prefix/ruby@$version/bin:$PATH"
        unset GEM_HOME GEM_PATH
        if modern_ruby; then break 2; fi
      fi
    done
  done
fi
if ! modern_ruby; then
  printf '\nTAMANG needs Ruby 3.2 or newer (Ruby 3.x).\n'
  printf 'On Mac: brew install ruby@3.3\nThen run this launcher again.\n'
  printf 'For an immediate preview: bash Preview.command\nSee START-HERE.md for setup.\n'
  return 1
fi
printf 'Using: '
ruby --disable-gems -v
if ! ruby -S bundle --version >/dev/null 2>&1; then
  printf '\nBundler is missing for this Ruby. Run: gem install bundler\n'
  return 1
fi
ruby -S bundle config set --local path vendor/bundle || return 1
ruby -S bundle check >/dev/null 2>&1 || ruby -S bundle install || return 1
