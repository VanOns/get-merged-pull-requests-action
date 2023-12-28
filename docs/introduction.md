# Introduction

This GitHub action can be used in a workflow to retrieve the pull requests that were merged between two tags.

A fully filled-in example action would look like this:

```yaml
- name: Get merged pull requests
  uses: VanOns/get-merged-pull-requests-action@v1
  id: pull_requests
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    repo: "VanOns/cool-repo"
    current_tag: "v2.0.0"
    previous_tag: "v1.0.0"
    return_type: "all"
    commit_is_pull_request_regex: "^PR:.*"
    apply_commit_is_pull_request_regex: true
    pull_request_regex: "^\[ABC-.*].*"
```

However, you do not necessarily need to use all the inputs. If you only want the titles, you would use the following:

```yaml
- name: Get merged pull requests
  uses: VanOns/get-merged-pull-requests-action@v1
  id: pull_requests
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

If you prefix your pull requests with a Jira ticket number, you would use the following:

```yaml
- name: Get merged pull requests
  uses: VanOns/get-merged-pull-requests-action@v1
  id: pull_requests
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    pull_request_regex: "^\[ABC-.*].*"
```

## Inputs

The following inputs can be used to configure the action:

| **Input**                                | **Description**                                                                                                                                             | **Default**  | **Required** |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|--------------|
| **`github_token`**                       | The GitHub token to use.                                                                                                                                    |              | **true**     |
| **`repo`**                               | The repository to use. Defaults to current repository. Expected format: `owner/repo`.                                                                       |              | **false**    |
| **`current_tag`**                        | The current tag to use. Defaults to current/latest tag.                                                                                                     |              | **false**    |
| **`previous_tag`**                       | The previous tag to use. Defaults to one tag before the current tag.                                                                                        |              | **false**    |
| **`return_type`**                        | What data to return. Options are: `title_only`, `all`.                                                                                                      | `title_only` | **false**    |
| **`commit_is_pull_request_regex`**       | The regex to use to determine if a commit is a pull request merge commit. This is checked against a commit's title. Default regex: `^Merge pull request.*`. |              | **false**    |
| **`apply_commit_is_pull_request_regex`** | Whether to apply `commit_is_pull_request_regex` to the commits.                                                                                             |              | **false**    |
| **`pull_request_regex`**                 | The regex to use if you want to filter the pull requests. This is checked against a pull request's title. Example regex: `^\[Feat].*`.                      |              | **false**    |

## Using the output

The next step would be to do something with the output. The output is stored under `steps.<action_id>.outputs.pull_requests`
(which in the example above would be `steps.pull_requests.outputs.pull_requests`). This output is a JSON string, which can be
parsed using something like `jq`.

An example of using the output with `jq` would be:

```yaml
- name: Print merged pull requests
  env:
    PULL_REQUESTS: ${{ steps.pull_requests.outputs.pull_requests }}
  run: |
    titles=$(jq -r '.[].title' <<<"$PULL_REQUESTS")
    if [ -z "$titles" ]; then
      echo "No pull requests were merged between the current and previous tag."
    else
      echo "The following pull requests were merged between the current and previous tag:"
      echo "$titles" | while read -r title; do
        echo "- $title"
      done
    fi
```

If there are no pull requests merged between the current and previous tag, this action would output:

```yaml
No pull requests were merged between the current and previous tag.
```

However, if there are pull requests merged between the current and previous tag, this action would output:

```yaml
The following pull requests were merged between the current and previous tag:
  - Title of the first pull request
  - Title of the second pull request
  - Title of the third pull request
```
