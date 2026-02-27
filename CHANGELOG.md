# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Initial project setup with React Vite frontend, FastAPI backend, and Docker configuration.
- Localized the application with i18n support for English (en), Egyptian Arabic (ar-EG), and French (fr).

### Fixed
- Fixed board orientation and rendering in Right-to-Left (RTL) languages by explicitly forcing LTR physical grid progression.
- Handled mixed-directionality formatting in the history log by transitioning to an `i18n` structured parsing flow instead of static string formatting.

### Changed
- Refactored `App.tsx` side panel to display dynamic rules based on the currently selected game mode, replacing the generic historical note.

### Removed
- Removed the 'Museum Classroom' and 'Custom (Toggleable)' gamemodes/rulesets from the engine to focus strictly on the historically detailed 'Common Reconstruction' option.
