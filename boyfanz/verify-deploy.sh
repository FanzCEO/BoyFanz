#!/bin/bash
EXPECTED_HASH="91d24fe509143191d1de388e8d62584fb4cd0a569f95f6d7d28927e7943f0fad"
INPUT_HASH=$(echo -n "$1" | sha256sum | cut -d" " -f1)
if [ "$INPUT_HASH" = "$EXPECTED_HASH" ]; then
  echo "✅ VERIFIED: Deploy authorized for boyfanz"
  exit 0
else
  echo "❌ DENIED: Invalid deploy code for boyfanz"
  exit 1
fi
