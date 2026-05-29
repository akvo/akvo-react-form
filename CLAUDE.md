# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Akvo React Form is a React component library for building dynamic, configurable webforms with advanced features like dependency logic, multi-language support, repeatable question groups, auto-save, and multiple field types. The library is built with React 16.x, Ant Design 4.x, and uses microbundle-crl for bundling.

## Build and Development Commands

### Primary Commands
- `npm run build` or `yarn build` - Build the library for distribution (creates `dist/` directory)
- `npm start` or `yarn start` - Start development mode with watch (auto-rebuilds on changes)
- `npm test` or `yarn test` - Run full test suite (unit tests, linting, and build verification)
- `npm run test:unit` or `yarn test:unit` - Run unit tests only
- `npm run test:lint` or `yarn test:lint` - Run ESLint on `src/` directory
- `npm run test:watch` or `yarn test:watch` - Run tests in watch mode

### Example Application
- `cd example && yarn install && yarn start` - Run the example/demo application
- `npm run deploy` or `yarn deploy` - Build and deploy example to GitHub Pages

### Publishing
- The library is published to npm as `akvo-react-form`
- Main entry: `dist/index.js` (CommonJS)
- Module entry: `dist/index.modern.js` (ES Modules)

## Architecture

### Core Components

**Main Entry Point** (`src/index.js`):
- Exports `Webform` component (main form renderer)
- Exports `dataStore` (IndexedDB interface for auto-save)
- Exports `SavedSubmission` (component to list saved submissions)
- Exports `DownloadAnswerAsExcel` utility

**State Management** (`src/lib/store.js`):
- Uses Pullstate for global state management
- `GlobalStore` tracks: form config, initial values, current values, data point names, active group, field changes
- Central state used across form lifecycle for coordination

**Form Transformation** (`src/lib/index.js`):
- `transformForm()` - Processes raw form JSON, resolves dependencies, handles cascading relationships
- `translateForm()` - Applies language translations to form definition
- `validateDependency()` - Evaluates skip logic conditions
- `filterFormValues()` - Cleans form values before submission (removes displayOnly fields, handles empty values)
- `generateDataPointName()` - Constructs submission identifier from meta fields
- `uploadAllAttachments()` - Handles file upload for attachment fields

**Database Layer** (`src/lib/db.js`):
- Uses Dexie.js wrapper around IndexedDB
- Stores draft submissions with `dataId`, `questionId`, and `repeat` index
- Auto-save feature persists responses locally for later completion
- `ds.list(formId)` - Retrieve saved submissions for a form
- `ds.new(formId, name)` - Create new draft
- `ds.get(id)` - Load saved responses into form

### Field Types

Located in `src/fields/`, each field type has its own component:
- `TypeInput` - Text input
- `TypeNumber` - Numeric input with validation
- `TypeText` - Multi-line textarea
- `TypeDate` - Date picker
- `TypeOption` - Single-choice radio/select
- `TypeMultipleOption` - Multi-choice checkboxes
- `TypeCascade` - Cascading dropdown (supports JSON and API sources)
- `TypeEntity` - Entity-based cascade with parent dependency
- `TypeTree` - Tree select with hierarchical options
- `TypeTable` - Repeatable sub-questions in table format
- `TypeAutoField` - Computed field based on function string
- `TypeImage` - Image upload with preview
- `TypeSignature` - Signature canvas
- `TypeAttachment` - File upload (any type)
- `TypeGeo` - Single point geographic coordinates with Leaflet map
- `TypeGeoDrawing` - Geographic tracing (geotrace) and shapes (geoshape) with Leaflet map

### Component Structure

**QuestionGroup** (`src/components/QuestionGroup.jsx`):
- Renders a group of questions
- Handles repeatable groups (add/remove instances)
- Manages dependency visibility logic
- Controls question rendering order

**Support Components** (`src/support/`):
- `Sidebar` - Form navigation and progress tracking
- `MobileFooter` - Mobile-optimized navigation
- `Print` - Print-friendly form rendering
- `LeftDrawer` - Drawer for saved submission list
- `ErrorComponent` - Error boundary for custom components

### Form Definition Structure

Forms are defined as JSON with this hierarchy:
```
Form (root)
├── name, languages, defaultLanguage, translations
├── cascade definitions (e.g., cascade.administration)
├── tree definitions (e.g., tree.administration)
└── question_group[] (ordered groups)
    ├── name, order, description, repeatable
    └── question[] (ordered questions)
        ├── id, name, type, required, order
        ├── dependency[] (skip logic)
        ├── option[] (for option types)
        ├── rule (validation rules)
        ├── extra[] (custom components before/after)
        ├── api (for cascade/entity API endpoints)
        └── translations[]
```

### Key Form Processing Flow

1. **Form Load**: `transformForm()` processes raw JSON, resolves dependencies, orders questions
2. **Translation**: `translateForm()` applies language-specific strings
3. **Rendering**: `Webform` component renders question groups based on visibility rules
4. **User Input**: Form values trigger `onValuesChange` callback
5. **Dependency Evaluation**: `validateDependency()` determines which questions to show/hide
6. **Completion Tracking**: Tracks which groups are complete based on required fields
7. **Submission**: `onFinish` callback receives filtered values, uploads attachments, generates datapoint name

### Repeatable Question Groups

- Groups can have `repeatable: true` to allow multiple instances
- Each instance tracked with repeat index (e.g., `questionId-0`, `questionId-1`)
- `updateRepeat()` handles add/delete operations
- Completion logic evaluates each instance independently
- Initial values can specify `repeatIndex` to populate specific instances

### Dependency (Skip Logic) System

Dependencies control question visibility based on other answers:
- Multiple dependencies supported with configurable logic via `dependency_rule`
- **NEW**: `dependency_rule` property controls how multiple dependencies are evaluated:
  - `"AND"` (default) - All dependencies must be satisfied
  - `"OR"` - At least one dependency must be satisfied
  - Backward compatible: if not specified, defaults to `"AND"`
- Supports ancestor dependencies (if A depends on B, and B depends on C)
- Types of dependency conditions:
  - `options[]` - Answer must match one of these options
  - `min/max` - Numeric range validation
  - `equal` - Exact match
  - `notEqual` - Answer exists and doesn't match
- Dependencies automatically adjusted for repeatable groups
- Use `isDependencySatisfied(question, answers)` function to evaluate dependencies with `dependency_rule` support
- Legacy code can still use `validateDependency(dependency, value)` for single dependency checks

### Auto-Save Feature

When `autoSave` prop provided with `formId` and `name`:
- Responses automatically saved to IndexedDB on every change
- Saved submissions can be loaded via `SavedSubmission` component
- Use `leftDrawerConfig` to show saved submission list in drawer
- Call `refreshForm()` in `onFinish` callback to clear saved draft after successful submission

### Geographic Field Data Formats

Different geographic field types use different coordinate formats:

**Single Point (`geo` type)**:
- Format: `{ lat: number, lng: number }`
- Example: `{ lat: 9.156840981798862, lng: 40.47912597656251 }`
- Component: `TypeGeo` (`src/fields/TypeGeo.jsx`)
- Stored as object with `lat` and `lng` properties

**Polylines and Polygons (`geotrace` and `geoshape` types)**:
- Format: `[[lng, lat], [lng, lat], ...]` (GeoJSON standard - longitude first!)
- Example: `[[-7.3912967, 109.4652897], [-7.3911063, 109.465008]]`
- Component: `TypeGeoDrawing` (`src/fields/TypeGeoDrawing.jsx`)
- **Important**: Array order is `[longitude, latitude]`, opposite of `geo` type's `{lat, lng}` object
- Stored as array of coordinate pairs

**Center Prop Formats**:
- `geo` type: `{ lat: number, lng: number }`
- `geotrace`/`geoshape` types: `[lng, lat]` array or `{ lat: number, lng: number }` object

**Leaflet Coordinate Conversion**:
- React-Leaflet expects coordinates in `[lat, lng]` order
- When rendering `geotrace`/`geoshape` data, convert from `[lng, lat]` to `[lat, lng]`
- Conversion: `coordinates.map(([lng, lat]) => [lat, lng])`

## Important Development Patterns

### Adding New Field Types

1. Create new component in `src/fields/TypeYourField.jsx`
2. Export from `src/fields/index.js`
3. Add case in `QuestionGroup.jsx` to render your field type
4. Update form transformation logic if special handling needed

### Working with Translations

- All user-facing strings support multi-language via `translations[]` arrays
- `translateObject()` helper retrieves translated string or falls back to default
- Form definition, questions, options, and extra components all translatable
- UI text (buttons, labels) customizable via `UIText` prop

### Testing Considerations

- Test files use Jest with React Testing Library
- Run tests before committing: `npm run test:lint && npm run test:unit`
- Example app in `example/` folder serves as integration test
- Test with different form configurations in `example/src/example*.json` files

### Styling

- Uses Ant Design CSS (must import `antd/dist/antd.min.css`)
- Custom styles in `src/styles.module.css` with `arf-` prefix
- CSS modules enabled with `arf-[local]` naming convention
- Mobile-responsive with breakpoint at 1064px

### Working with Form JSON

- Extensive form examples in `example/src/`:
  - `example.json` - Comprehensive example with most features
  - `example-cascade.json` - Cascade dropdown data
  - `example-initial-value.json` - Pre-populating form values
  - `example-tree-select.json` - Tree select data
  - `example-custom-component.json` - Custom component usage
  - `example-dependency-rule.json` - Demonstrates `dependency_rule` (OR/AND) feature
- Validate JSON structure against README.md property tables before testing

## Common Gotchas

- **Initial Values**: When setting `initialValue`, ensure `question` IDs match exactly; use `repeatIndex` for repeatable groups
- **Cascade API**: Cascade API responses must return `{id, name}` structure; use `api.list` property if data nested in response
- **Entity Fields**: Entity cascade requires `parentId` pointing to another question; parent must be answered first
- **Display Only Fields**: Questions with `displayOnly: true` are shown but excluded from submission payload
- **Required Fields**: Use `partialRequired: true` for cascade fields to allow submission without selecting all levels
- **Auto-Save**: When using auto-save, always call `refreshForm()` in `onFinish` after successful submission to prevent data loss
- **Field Changes State**: When programmatically updating field values, use `GlobalStore.update((gs) => { gs.fieldChanges = {fieldId: value} })` to trigger proper re-rendering and dependency checks
- **Dependency Rule**: When using `dependency_rule: "OR"`, question appears if ANY dependency is satisfied; without `dependency_rule` or with `"AND"`, ALL dependencies must be satisfied
- **Geographic Coordinates**: `geo` type uses `{lat, lng}` object format, while `geotrace`/`geoshape` use `[[lng, lat]]` arrays in GeoJSON format (longitude first). React-Leaflet expects `[lat, lng]` order, so coordinate conversion is needed when rendering geotrace/geoshape geometry

## Git Workflow

- Main branch: `main`
- Current feature branch pattern: `feature/{issue-number}-description`
- Use descriptive commit messages referencing issue numbers: `[#{issue}] Description`
- Recent work focused on field state management and administration level filtering
