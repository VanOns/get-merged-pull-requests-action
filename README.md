[![Test build](https://github.com/VanOns/get-merged-pull-requests-action/actions/workflows/test.yml/badge.svg)](https://github.com/VanOns/get-merged-pull-requests-action/actions/workflows/test.yml)

<!-- start title -->

# GitHub Action: Get merged pull requests

<!-- end title -->

<!-- start description -->

Compare 2 tags and retrieve all the pull requests merged between them.

<!-- end description -->

# Return format

The pull requests are returned in a certain format, depending on the `return_type` value:

- **`title_only` (default)**
  ```json
  [{ "title": "Title of the pull request" }]
  ```
- **`all`**: see [here](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-issues-and-pull-requests) for a full overview.

# Usage

<!-- start usage -->

```yaml
- uses: VanOns/get-merged-pull-requests-action@v1
  with:
    # The GitHub token to use.
    github_token: ""

    # The repository to use. Defaults to current repository. Expected format:
    # `owner/repo`.
    repo: ""

    # The current tag to use. Defaults to current/latest tag.
    current_tag: ""

    # The previous tag to use. Defaults to one tag before the current tag.
    previous_tag: ""

    # What data to return. Options are: `title_only`, `all`.
    # Default: title_only
    return_type: ""

    # The regex to use to determine if a commit is a pull request merge commit. This
    # is checked against a commit's title. Default regex: `^Merge pull request.*`.
    commit_is_pull_request_regex: ""

    # The regex to use if you want to filter the pull requests. This is checked
    # against a pull request's title. Example regex: `^\[Feat].*`.
    pull_request_regex: ""
```

<!-- end usage -->

# Inputs

<!-- start inputs -->

| **Input**                          | **Description**                                                                                                                                             | **Default**  | **Required** |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------ |
| **`github_token`**                 | The GitHub token to use.                                                                                                                                    |              | **true**     |
| **`repo`**                         | The repository to use. Defaults to current repository. Expected format: `owner/repo`.                                                                       |              | **false**    |
| **`current_tag`**                  | The current tag to use. Defaults to current/latest tag.                                                                                                     |              | **false**    |
| **`previous_tag`**                 | The previous tag to use. Defaults to one tag before the current tag.                                                                                        |              | **false**    |
| **`return_type`**                  | What data to return. Options are: `title_only`, `all`.                                                                                                      | `title_only` | **false**    |
| **`commit_is_pull_request_regex`** | The regex to use to determine if a commit is a pull request merge commit. This is checked against a commit's title. Default regex: `^Merge pull request.*`. |              | **false**    |
| **`pull_request_regex`**           | The regex to use if you want to filter the pull requests. This is checked against a pull request's title. Example regex: `^\[Feat].*`.                      |              | **false**    |

<!-- end inputs -->

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
