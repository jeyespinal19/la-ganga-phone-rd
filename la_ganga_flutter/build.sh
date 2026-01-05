#!/bin/bash

# Clone Flutter into the temporary build environment
git clone https://github.com/flutter/flutter.git --depth 1 -b stable $HOME/flutter

# Add Flutter to the PATH
export PATH="$PATH:$HOME/flutter/bin"

# Pre-download artifacts
flutter precache --web

# Build the web app
flutter build web --release --base-href /
