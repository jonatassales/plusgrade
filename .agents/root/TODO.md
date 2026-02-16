# Project TODO

## Web App Documentation
- [x] Build out `apps/web/README.md` with:
  - [x] Setup instructions (local and Docker)
  - [x] Environment variables (`API_TAX_BASE_URL`, `API_TAX_TIMEOUT_MS`, `WEB_INTERNAL_API_TIMEOUT_MS`)
  - [x] Feature overview (income-tax flow)
  - [x] Error handling strategy (server action + result error boundary)
  - [x] QA scenarios (success and failure cases)
  - [ ] Add screenshots/images for key flows

## Testing Strategy (Web)
- [ ] Configure Jest for `apps/web`
- [ ] Document explicit testing scope:
  - [ ] Jest for isolated functions/utilities/actions
  - [ ] Do not use Jest for component rendering tests
  - [ ] Cypress will be used later for component/UI/e2e behavior
- [ ] Add first tests for isolated logic:
  - [ ] `requestIncomeTax` behavior (success/failure)
  - [ ] Input schema validation rules
  - [ ] Timeout/env parsing helpers

## Observability
- [x] Implement Axiom integration across apps
- [ ] Define logging guidelines:
  - [x] Error context fields
  - [x] Correlation/request IDs
  - [ ] Environment-aware verbosity

## Accessibility (WCAG 2)
- [ ] Run accessibility audit for web app
- [ ] Align components with WCAG 2 requirements:
  - [ ] Keyboard navigation
  - [ ] Focus visibility
  - [ ] Semantic labels/roles
  - [ ] Color contrast checks
  - [ ] Error-message accessibility (screen readers)
- [ ] Add accessibility checklist to PR template or docs

## Error Handling Improvements
- [x] Implement retry action wiring in result error boundary
- [x] Improve action/route error reporting with safe structured logs
- [x] Define user-facing error message patterns

## UI Branding
- [ ] Replace favicon with Plusgrade brand asset
- [ ] Update font to Plusgrade font across the web app

## Architecture and Code Design
- [ ] Read codebase fully and draft `code-design.md`
- [ ] Define conventions for:
  - [ ] Interface/type placement and naming
  - [ ] Props typing style
  - [ ] Props destructuring pattern (signature vs function body)
  - [ ] Import/path conventions
  - [x] Server/client component boundaries
  - [x] Action structure (`ui`, `domain`, `actions`)
  - [x] Enum conventions (`PascalCase` key + `CAPS_UNDERSCORE` value)
- [ ] Review and align existing code with new conventions

## Validation Tooling and Developer Experience
- [x] Move root executable scripts to `bin/` (`docker`, `hooks`, `validation`)
- [x] Split commands by responsibility:
  - [x] `docker:*` for compose lifecycle only
  - [x] `validation:*` for API business-rule checks only
- [x] Wire Husky hooks to thin wrappers in `bin/hooks`
- [x] Add reusable API validation scripts:
  - [x] Tax rule scenarios (2022 expected totals)
  - [x] Tax negative validations (400 checks)
  - [x] Auth flow smoke validation (signup/login/me/refresh/logout)
- [x] Replace manual curl blocks in READMEs with `pnpm` command entry points

## Nice-to-have Follow-ups
- [ ] Add `.env` documentation consistency across all apps
- [ ] Add healthcheck/readiness checks for Docker services
- [ ] Add smoke-test script for full chain:
  - [ ] UI -> Next API -> api-tax -> plusgrade API
