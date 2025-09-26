#!/bin/zsh
set -e
mmdc -i platforms.mmd -o payments_map.png -b transparent
mmdc -i platforms.mmd -o payments_map.svg -b transparent
echo "🖼  Updated: $(pwd)/payments_map.png"