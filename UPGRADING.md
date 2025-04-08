# Upgrading

We aim to make upgrading between versions as smooth as possible, but sometimes it involves specific steps to be taken.
This document will outline those steps. And as much as we try to cover all cases, we might miss some. If you come
across such a case, please let us know by [opening an issue][issues], or by adding it yourself and creating a pull request.

## v1.3.0

This release contains a bugfix for situations where the action returns too much data, causing it to crash. To solve this,
instead of returning an array, the results are written to a JSON file. For clarity, this output is returned under a new
key, `pull_requests_file`, and now contains the path to the JSON file instead of the array itself.

Depending on your setup, you might not need to change a lot. If you used our example, you would only have to change the following:

```diff
name: Print merged pull requests
env:
-  PULL_REQUESTS: ${{ steps.pull_requests.outputs.pull_requests }}
+  PULL_REQUESTS_FILE: ${{ steps.pull_requests.outputs.pull_requests_file }}
run: |
+  if [ -z "$PULL_REQUESTS_FILE" ] || [ ! -f "$PULL_REQUESTS_FILE" ]; then
+    echo "No pull requests were merged between the current and previous tag."
+    exit 0
+  fi

-  titles=$(jq -r '.[].title' <<<"$PULL_REQUESTS")
+  titles=$(jq -r '.[].title' "$PULL_REQUESTS_FILE")

  if [ -z "$titles" ]; then
    echo "No pull requests were merged between the current and previous tag."
  else
    echo "The following pull requests were merged between the current and previous tag:"
    echo "$titles" | while read -r title; do
      echo "- $title"
    done
  fi
```

[issues]: https://github.com/VanOns/get-merged-pull-requests-action/issues
