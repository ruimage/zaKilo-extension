# Improvement Tasks for zaKilo Extension

This document contains a detailed checklist of actionable improvement tasks for the zaKilo Extension project. Tasks are
organized by category and should be completed in the order presented when possible.

## 1. Testing Improvements

[ ] Increase test coverage by creating test files for all strategies

- [ ] Create tests for OzonStrategy
- [ ] Create tests for DeliveryClubStrategy
- [ ] Create tests for KuperStrategy
- [ ] Create tests for MagnitStrategy
- [ ] Create tests for PerekrestokStrategy
- [ ] Create tests for PyaterochkaStrategy
- [ ] Create tests for SamokratStrategy
- [x] Create tests for AuchanStrategy

[x] Add unit tests for core classes

- [x] Create tests for BaseParser
- [x] Create tests for ParserStrategy abstract class

[ ] Add integration tests for content scripts

- [ ] Test content script injection
- [ ] Test interaction between strategies and parsers

[ ] Set up end-to-end testing with Cypress

- [ ] Create basic E2E test workflow
- [ ] Add tests for each supported website

[ ] Implement test coverage reporting

- [x] Configure Vitest for coverage reporting
- [ ] Set coverage thresholds (aim for at least 80%)

## 2. Code Quality and Architecture

[ ] Refactor converters.ts to support more units

- [ ] Add support for additional weight units (oz, lb, etc.)
- [ ] Add support for additional volume units (fl oz, pt, qt, gal)
- [ ] Add support for area units (m², ft²)

[ ] Improve error handling

- [ ] Add more specific error types
- [ ] Implement better error reporting to users
- [ ] Add error logging/telemetry

[ ] Enhance the ParserStrategy abstract class

- [ ] Add more helper methods for common parsing tasks
- [ ] Implement caching for repeated operations
- [ ] Add validation for parsed values

[ ] Optimize performance

- [ ] Reduce DOM operations in BaseParser
- [ ] Implement throttling for scroll events
- [ ] Add performance metrics collection

[ ] Implement a configuration system

- [ ] Allow users to customize unit display preferences
- [ ] Add ability to enable/disable specific websites
- [ ] Create a settings UI

## 3. Feature Enhancements

[ ] Add support for more e-commerce websites

- [ ] Add support for Wildberries
- [ ] Add support for SberMarket
- [ ] Add support for Lenta
- [ ] Add support for Metro

[ ] Implement price comparison features

- [ ] Add ability to compare prices across websites
- [ ] Create a popup with price comparison results
- [ ] Add price history tracking

[ ] Enhance unit price display

- [ ] Add color coding based on price ranges
- [ ] Implement different display modes (inline, tooltip, etc.)
- [ ] Add ability to sort products by unit price

[ ] Add internationalization support

- [ ] Extract all text strings to localization files
- [ ] Add support for multiple languages
- [ ] Implement locale-specific formatting for prices and units

[ ] Implement data persistence

- [ ] Save user preferences
- [ ] Store price history
- [ ] Add favorites/watchlist functionality

## 4. Documentation and Maintenance

[ ] Improve code documentation

- [ ] Add JSDoc comments to all classes and methods
- [ ] Create API documentation
- [ ] Add inline comments for complex logic

[ ] Enhance project documentation

- [ ] Create a comprehensive developer guide
- [ ] Add architecture diagrams
- [ ] Document the strategy pattern implementation

[ ] Set up continuous integration

- [ ] Configure GitHub Actions for automated testing
- [x] Add linting and formatting checks
- [ ] Implement automated builds for both browsers

[ ] Implement semantic versioning

- [ ] Define version numbering scheme
- [ ] Create a changelog
- [ ] Set up automated release notes

[ ] Conduct security audit

- [ ] Review permissions in manifest files
- [ ] Check for potential XSS vulnerabilities
- [ ] Implement Content Security Policy

## 5. Build and Deployment

[ ] Optimize build configuration

- [ ] Implement code splitting
- [ ] Add tree shaking
- [ ] Minimize bundle size

[ ] Improve development workflow

- [ ] Add hot module replacement for faster development
- [ ] Create development-specific configuration
- [ ] Implement watch mode for tests

[x] Enhance browser compatibility

- [x] Test on different browser versions
- [x] Address browser-specific issues
- [x] Implement feature detection for API compatibility

[ ] Set up automated deployment

- [ ] Create scripts for Chrome Web Store submission
- [ ] Create scripts for Firefox Add-ons submission
- [ ] Implement version bumping automation

[ ] Add analytics and monitoring

- [ ] Implement usage analytics
- [ ] Add error tracking
- [ ] Create a dashboard for monitoring extension health
