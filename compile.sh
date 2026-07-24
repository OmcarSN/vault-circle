#!/bin/bash
export PATH="/home/omcar/.local/bin:$PATH"

cd /mnt/c/Users/Devyani/vault-circle

# Run tests
npx vitest run 2>&1
