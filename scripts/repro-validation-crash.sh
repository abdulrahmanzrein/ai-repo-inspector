#!/usr/bin/env bash
# same deal as repro-mcp-bug.mjs - run the tool exactly the way the readme
# documents it and watch what happens. "--validate npm test" is literally
# the second example in the readme's CLI section, and any validate command
# that exits nonzero triggers this, not just npm test specifically
set -x

rm -f review-report.md

npm run inspector -- review --repo . --validate "exit 1"
echo "cli exit code: $?"

if [ -f review-report.md ]; then
  echo "report was written"
else
  echo "no report was written - the whole review blew up instead of reporting a failed validation"
fi
