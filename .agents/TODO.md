# Project TODO

## Web App Documentation
- [ ] Build out `apps/web/README.md` with:
  - [ ] Setup instructions (local and Docker)
  - [ ] Environment variables (`API_TAX_BASE_URL`, `API_TAX_TIMEOUT_MS`, `WEB_INTERNAL_API_TIMEOUT_MS`)
  - [ ] Feature overview (income-tax flow)
  - [ ] Error handling strategy (server action + result error boundary)
  - [ ] QA scenarios (success and failure cases)
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
- [ ] Implement Axiom integration across apps
- [ ] Define logging guidelines:
  - [ ] Error context fields
  - [ ] Correlation/request IDs
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
- [ ] Implement retry action wiring in result error boundary
- [ ] Improve action/route error reporting with safe structured logs
- [ ] Define user-facing error message patterns

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
  - [ ] Server/client component boundaries
  - [ ] Action structure (`ui`, `domain`, `actions`)
- [ ] Review and align existing code with new conventions

## Nice-to-have Follow-ups
- [ ] Add `.env` documentation consistency across all apps
- [ ] Add healthcheck/readiness checks for Docker services
- [ ] Add smoke-test script for full chain:
  - [ ] UI -> Next API -> api-tax -> plusgrade API
