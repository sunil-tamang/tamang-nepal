#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
source scripts/ruby-env.sh || exit 1
exec ruby -S bundle exec jekyll build "$@"
