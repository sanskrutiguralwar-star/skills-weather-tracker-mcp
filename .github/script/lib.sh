#!/usr/bin/env bash
# Shared helpers for the exercise workflows. Requires GH_TOKEN and GH_REPO.
set -uo pipefail

ISSUE=$(gh issue list --label exercise --state open --json number --jq '.[0].number // empty')
[ -n "$ISSUE" ] || { echo "No open exercise issue found."; exit 0; }

current_step() {
  gh issue view "$ISSUE" --json labels --jq '[.labels[].name | select(startswith("step-"))][0] // ""'
}

# Skip quietly unless the learner is on the given step.
require_step() {
  [ "$(current_step)" = "step-$1" ] || { echo "Not on step $1, skipping."; exit 0; }
}

# Tell the learner what's missing, then stop without failing the workflow.
fail() {
  gh issue comment "$ISSUE" --body "❌ **Step $1 isn't complete yet.** $2"
  exit 0
}

# Move from step $1 to step $2 and post the next lesson.
advance() {
  gh issue edit "$ISSUE" --remove-label "step-$1" --add-label "step-$2"
  sed "s#{{repo}}#$GH_REPO#g" ".github/steps/$2-step.md" > /tmp/next.md
  gh issue comment "$ISSUE" --body-file /tmp/next.md
}

# Close out the exercise.
finish() {
  gh issue edit "$ISSUE" --remove-label "step-$1"
  gh issue comment "$ISSUE" --body-file .github/steps/x-review.md
  gh issue close "$ISSUE"
}
