#!/bin/bash

# Remove the .mjs files
rm -f postcss.config.mjs
rm -f tailwind.config.mjs

# Remove the .cjs files
rm -f postcss.config.cjs
rm -f tailwind.config.cjs

# Keep only the .js files
# postcss.config.js and tailwind.config.js should remain

echo "Cleanup complete!"