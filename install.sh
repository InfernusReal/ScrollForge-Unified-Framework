#!/bin/bash

# ScrollForge Installation Script
# Installs dependencies and builds the framework

echo ""
echo "== ScrollForge Installation =="
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[!] Node.js is not installed. Please install Node.js first."
    echo "    Visit: https://nodejs.org/"
    exit 1
fi

echo "[ok] Node.js detected: $(node --version)"
echo "[ok] npm detected: $(npm --version)"
echo ""

# Install dependencies
echo "== Installing dependencies =="
npm install

if [ $? -ne 0 ]; then
    echo "[!] Failed to install dependencies"
    exit 1
fi

echo "[ok] Dependencies installed"
echo ""

# Build the framework
echo "== Building ScrollForge =="
npm run build

if [ $? -ne 0 ]; then
    echo "[!] Build failed"
    exit 1
fi

echo "[ok] Build complete"
echo ""

# Display success message
echo "=============================="
echo "ScrollForge is ready!"
echo ""
echo "Next steps:"
echo "  * Try the examples: cd examples/counter && open index.html"
echo "  * Create a project: npx scrollforge create my-app"
echo "  * Read the docs:    cat README.md"
echo ""
echo "Happy forging!"
echo ""
