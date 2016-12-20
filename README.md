# vscode-gfm-preview

Preview Markdown with GFM.
![screenshot](https://raw.githubusercontent.com/tomoki1207/gfm-preview/images/screenshot.png)

## Description

Rendering Markdown preview with GFM using [GitHub API](https://developer.github.com/v3/markdown/).

## Authentication
You can **60 requests per hour** in Unauthenticated mode.
To get more, you have to authenticate via extension configuration.
When authenticated mode, You can **5,000 requests** per hour.
For more infomation, please see [Documentation](https://developer.github.com/guides/getting-started/#authentication).

## Extension Settings

This extension contributes the following settings:

* `gfmpreview.previewUpdateOnChanged`: enable/disable update preview on file changed. If you want to economize API request count, set to false.
* `gfmpreview.githubUsername`: Your GitHub username for API authentication.
* `gfmpreview.githubPassword`: Your GitHub password for API authentication.

## Release Notes

### 0.1.2(2016/12/20)

-  Fixed (#1) does not process relative path.

### 0.1.1(2016/11/28)

Update manifest

### 0.1.0(2016/11/26)

Initial release