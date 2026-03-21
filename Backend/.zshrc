cat << 'EOF' > ~/.zshrc
# Python Management (Pyenv)
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv init -)"

# Flutter & Android Development
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH="$PATH:$HOME/development/flutter/bin"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Node & Global Tools
export PATH="$PATH:/Users/samenergy/.npm-global/bin"
export PATH="/Users/samenergy/.codeium/windsurf/bin:$PATH"

# Pipx (Global Python Apps)
export PATH="$PATH:/Users/samenergy/.local/bin"

# (OpenClaw completion removed until re-installed)
EOF

source ~/.zshrc
