#!/usr/bin/env bash
# proves there's no cap on how long a --validate command can run. sleep 6
# is just a stand-in here - nothing internal stops this at any point, so
# a command that hangs forever would just as happily block the tool
# forever too. we're timing it to show it runs the *entire* duration
# with no early cutoff, not just that it eventually finishes.
set -x

time npm run inspector -- review --repo . --validate "sleep 6"
