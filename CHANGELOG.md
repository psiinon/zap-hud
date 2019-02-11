# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2019-01-11
 - Many thanks to Matt Austin (@mattaustin) for reporting security vulnerabilities with the HUD and working with us to fix them.

### Added
 - Add API endpoints for getting and setting UI options. [#319](https://github.com/zaproxy/zap-hud/issues/319)
 - Add tasks for Enable, Show and Break tutorial pages
 - Add plain text/regex filtering capability to History section [#233](https://github.com/zaproxy/zap-hud/issues/233)
 - Add tutorial index page [#333](https://github.com/zaproxy/zap-hud/issues/333)
 - Add tutorial pages for tool configuration and the HTML report tool.
 - Add -hud ZAP command line option which launches Firefox configured to proxy through ZAP with the HUD enabled, for use in daemon mode

### Fixed
 - Correct handling of upgraded domains on startup. [#162](https://github.com/zaproxy/zap-hud/issues/162)
 - Stop the tutorial server when the add-on is uninstalled.
 - Perform stricter validation and filtering on messages from the target domain.

### Changed
 - Use websockets instead of HTTP for all ZAP API calls
 - Replaced link to ZAP User Group with one to the new ZAP HUD group and added a desktop menu item for it.
 - Refresh HUD iframes individually instead of refreshing whole page

## [0.2.0] - 2018-12-31

### Added
 - Add option to control on-domain messages. [#294](https://github.com/zaproxy/zap-hud/issues/294)
 - Add HTML report tool. [#312](https://github.com/zaproxy/zap-hud/issues/312)
 - Require cookie on all API calls

### Changed

 - Changed Attack Mode icon to crosshairs. [#221](https://github.com/zaproxy/zap-hud/issues/221)

### Fixed
 - Upgraded vue.js to 2.5.21 and vue-i18n to 8.5.0

## [0.1.2] - 2018-12-17

### Fixed
 - Fix bug where field alert flags don't show alert dialog. [#290](https://github.com/zaproxy/zap-hud/issues/290)

## [0.1.1] - 2018-12-06

## [0.1.0] - 2018-12-03
First alpha release.

[0.3.0]: https://github.com/zaproxy/zap-hud/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/zaproxy/zap-hud/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/zaproxy/zap-hud/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/zaproxy/zap-hud/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/zaproxy/zap-hud/compare/f41b7a279a3a2d86edbf22e7d48d6b9c24e768c8...v0.1.0
