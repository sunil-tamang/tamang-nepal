#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
source scripts/ruby-env.sh || exit 1
exec ruby -S bundle exec jekyll serve --baseurl "" --host 127.0.0.1 --port 4000 --livereload "$@"
