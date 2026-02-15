# Design Tokens (`packages/design-tokens`) 🖌️

`design-tokens` is the shared style foundation package for web applications in
this monorepo. It is intentionally **not** a full design system with React
components; instead, it provides the base token layer (branding and visual
variables) that apps can consume and adapt.

The purpose is simple: centralize core visual decisions in one place so changes
to branding can propagate consistently across multiple apps. Today this package
is consumed by `apps/web`, and the same model is ready for future web projects
inside `apps/`.

---

## 🌐 How This Package Is Used

This package is installed as a dependency by apps and exports CSS variables
through `@repo/design-tokens/foundation`. Consumer apps import this CSS in their
global stylesheet and decide how to map these variables into their own theme
layer (Tailwind tokens, shadcn semantic variables, or both).

That means each app keeps control over how much it wants to override. One app
may only remap background/foreground, while another app may replace almost the
entire UI theme. The token package stays stable as the common foundation while
consumer apps apply their own integration strategy.

---

## 🧱 Why Design Tokens Were Created

The package exists to separate **brand foundation** from **app implementation**.
Branding concerns (color palette, spacing rhythm, radii, shadow language, etc.)
should not be scattered in each app. By keeping these primitives in one package,
you gain easier maintenance, stronger consistency, and faster rebranding.

This model also supports multi-project scenarios. If a new project requires a
different company style, tokens can be replaced or remapped at the foundation
layer, enabling broad visual changes with less effort and without rewriting app
business logic.

---

## 🛠️ Package Model and Technology

This package is CSS-first. It uses PostCSS to compose source token files into a
single exportable foundation CSS. No runtime framework is required, and no UI
components are shipped from here.

### Main tech

- CSS custom properties
- PostCSS (`postcss-cli`, `postcss-import`)
- Package export via `package.json` style entry

---

## 🗂️ Folder Structure

```bash
packages/design-tokens
├─ src/
│  └─ foundation/
│     ├─ index.css
│     ├─ colors.css
│     ├─ spacing.css
│     ├─ radius.css
│     └─ shadows.css
├─ dist/
│  └─ foundation/
│     └─ index.css
├─ postcss.config.cjs
└─ package.json
```

---

## 🔁 Export and Consumption Flow

The token source files are composed in `src/foundation/index.css`, then built
into `dist/foundation/index.css`. The package exposes this output through the
`./foundation` export path.

In consumer apps (currently `apps/web`), importing
`@repo/design-tokens/foundation` makes token variables available globally. The
app then maps those values to Tailwind and shadcn variable namespaces as needed.

> [IMAGE PLACEHOLDER: Token source -> build -> export -> app consumption flow]

---

## 🧠 Architecture Approaches

### Foundation-First Theming Approach

This package follows a foundation-first approach: define primitive brand tokens
once, then let each app compose its own semantic theme layer on top. This keeps
global visual language consistent while still allowing app-level flexibility. It
also avoids turning each app’s `globals.css` into a full branding definition,
which would duplicate effort and increase drift.

### Dependency-Oriented Reuse Approach

Instead of copying CSS files between projects, apps consume this package as a
regular dependency. This enforces a cleaner contract between token producer and
token consumers. As long as token names remain stable, apps can update package
versions and inherit branding improvements without local duplication.

### Controlled Override Approach

The package is designed for selective override behavior. An app can map only a
small subset of token variables (for example, just color background and
foreground) or map a full theme surface. This strategy gives teams gradual
adoption and avoids all-or-nothing migration pressure when integrating tokens
into existing applications.

> [IMAGE PLACEHOLDER: Selective override strategy (Tailwind + shadcn mapping)]

---

## 🧩 Design Patterns Used

### Design Token Pattern

Visual values are represented as named, reusable tokens (`--ds-*`) instead of
hardcoded literals spread across app styles. This pattern makes visual decisions
explicit, reusable, and easier to evolve. It also improves communication between
design and engineering because style changes can be discussed as token updates
instead of component-by-component edits.

### Layered Theme Mapping Pattern

Tokens are exported as a base layer, then consumer apps map them into framework
specific layers. In the current web app, token variables map to Tailwind and
shadcn variables in `app/globals.css`. This layered mapping pattern keeps the
token package framework-neutral while still enabling framework-native theming in
apps.

### Single Source of Truth Pattern

By centralizing token definitions in one package, the monorepo avoids parallel
style definitions across apps. The package becomes the single source of truth
for foundational visual primitives, reducing inconsistency and simplifying
cross-app brand updates.

---

## 🎯 Current Token Scope

Current foundation categories include:

- Colors (with light and dark token values)
- Spacing scale
- Radius scale
- Shadow scale

The exported naming convention uses `--ds-*` variables.

---

## ⚙️ Scripts

From repository root:

```bash
pnpm --filter @repo/design-tokens build
pnpm --filter @repo/design-tokens dev
pnpm --filter @repo/design-tokens clean
```

What happens on build:

- `css:build` composes `src/foundation/index.css` into `dist/foundation/index.css`
- `css:foundation` runs a copy helper step (kept for compatibility)

---

## 🔌 Integration Example (App Side)

In a consumer app, import foundation CSS globally:

```css
@import "@repo/design-tokens/foundation";
```

Then map token variables according to app strategy:

- map only core values (`background`, `foreground`) for lightweight adoption, or
- map broad semantic surfaces (Tailwind + shadcn theme variables) for full
  theming control.

---

## 🧪 Validation Checklist

When updating tokens:

1. Build this package successfully.
2. Build consumer app(s) to verify no broken mappings.
3. Visually validate critical surfaces (background, text, interactive elements).
4. Confirm token naming remains compatible with existing app mappings.

---

## 📚 Related References

- [Monorepo README](../../README.md)
- [Design Tokens Architecture Blueprint](../../.agents/design-tokens/ARCHITECTURE.md)
- [Current consumer example (`apps/web/app/globals.css`)](../../apps/web/app/globals.css)
