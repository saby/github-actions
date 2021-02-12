# github-actions

[![Build Status](https://github.com/saby/github-actions/workflows/workflow/badge.svg)](https://github.com/saby/github-actions/actions)
[![Semantic Release enabled](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

## tslint

### Sample Github Actions Configuration

```yaml
name: workflow
on: [push]
jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      - uses: actions/checkout@v1
      - name: Prepare
        run: npm ci
      - name: Lint
        uses: saby/github-actions/tslint@v1.1.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          pattern: '*.ts'
```
