# Kinichi Design

## UI Direction

### Design Concept

Kinichi's design theme is:

old UFO reference chart x modern interactive 3D atlas

The visual references are 1960s to 1970s UFO shape classification charts, monochrome line drawings, museum panels, and old file cards.

Even with those references, the actual UI should feel modern and comfortable on smartphones.

### Visual Direction

#### Color

Base colors:

- `background`: `#050505`
- `panel`: `#111111`
- `panelAlt`: `#181818`
- `textPrimary`: `#F4F4F0`
- `textSecondary`: `#A8A8A0`
- `line`: `#E8E8DC`
- `accent`: `#B7FFCE`
- `warning`: `#F2D16B`

The base look should be white line work on a black background.

Even if the main UFO Lab Tokyo brand stays light, Kinichi can remain dark to preserve a self-contained archive room or night observation atmosphere.

#### Typography

- Headings: a sans serif with a slight archival or retro-document feeling
- Body: a readable sans serif
- English labels: monospace may be used selectively

Representative heading stack:

- `KINICHI`
- `UFO SHAPE ATLAS`
- `UFO形体事典`

#### Texture

Light noise, scanlines, or paper-grain texture may be used.

These effects should remain subtle and must not reduce readability.

### Interaction Style

Kinichi should feel like a research card catalog combined with a tactile 3D specimen viewer.

The UI should avoid flashy sci-fi dashboards and avoid military simulation aesthetics. The tone is observational, diagrammatic, and archival.

### Filtering And Search

Initial filters:

- Classic
- Modern UAP
- Light / Orb
- Disk
- Polygonal
- Cigar / Cylinder
- Famous Models
- NUFORC

Search should cover:

- Japanese shape names
- English shape names
- Representative cases
- NUFORC categories
- Related people

### Disclaimer Presentation

Place the disclaimer near the bottom of the page in a compact but readable panel.

Recommended text:

「本アプリの形体分類は、目撃証言・報告データ上の便宜的分類です。同じ形状が同一の物体や同一現象を意味するものではありません。また、掲載する3Dモデルは証言や写真に基づく概念モデルであり、実在物の正確な再現を保証するものではありません。」

## Screens

### Top Page

The top page should be structured as:

1. Hero
2. Representative UFO Shapes
3. Famous Craft Gallery
4. NUFORC Shape Index
5. Notes / Disclaimer
6. Related UFO Lab Tokyo Products

### Hero

Hero content:

- `Kinichi`
- `UFO Shape Atlas`
- `UFO形体事典`
- Main copy
- Sub copy

Suggested main copy:

「UFOは、まず“かたち”として現れる。」

Suggested sub copy:

「円盤、球体、葉巻型、三角形、Tic Tac。目撃された形から、事件と時代をたどる3D形体事典。」

The hero should include a slowly rotating representative 3D model.

On smartphones, a static silhouette is acceptable if needed for performance.

### Representative UFO Shapes Section

This section should use a card grid.

Card content:

- Top: 2D silhouette or small 3D preview
- Middle: shape name
- Bottom: short description
- Tags: `3D`, `classic`, `modern`, `nuforc`

Card mood:

- Black background
- White line drawing
- Thin border
- Old archive card feeling
- Border glow on hover

### Shape Detail Page

Each shape detail page should be structured as:

1. 3D Viewer
2. Shape Summary
3. Features
4. Representative Cases
5. Misidentification Notes
6. Related Famous Craft
7. NUFORC Related Shapes
8. Related Links

The shape detail page should place the viewer first and make it visually dominant on mobile.

Under the 3D viewer, show direct control buttons for:

- Auto rotate
- Wireframe
- Silhouette
- Night mode
- Reset

### 3D Viewer UI

3D models should appear on a black background with white to silver material treatment.

Supported display modes:

1. Solid
2. Wireframe
3. Silhouette
4. Night Lights

Night Lights may show glowing points for shapes such as triangles.

The viewer should remain visually enjoyable without drifting into overly realistic military simulation.

### Famous Craft Gallery

Place this section below Representative UFO Shapes.

Headings:

- `Famous Craft Gallery`
- `有名UFOモデル`

Description:

「特定の事件、写真、人物と結びついた有名UFOモデル。」

Target cards:

- Tic Tac
- Adamski
- Paul Villa
- Billy Meier

Cards should use larger thumbnails than the shape family cards to give the section a stronger gallery feel.

### NUFORC Shape Index

Place this section below Famous Craft Gallery.

Headings:

- `NUFORC Shape Index`
- `NUFORC形状分類と目撃数`

Description:

「NUFORCの報告データで使われる形状分類を、2Dシルエットと目撃数で一覧する。」

UI fields:

- 2D silhouette
- English category name
- Sighting count
- Related Kinichi classification
- Last updated date

This section should not show 3D models. It should feel halfway between a data table and a visual atlas.

### Related Product Links

At the bottom of the top page and in shape detail pages, show pathways to:

- Ohtsuki
- Ruppelt
- Kean
- Jacques

These should read as research pathways, not promotional banners.

## Responsive Behavior

Mobile-first behavior is required.

### Smartphone

At iPhone-width sizes:

- Keep the hero compact
- Use a lighter 3D viewer or a static silhouette when needed
- Show shape cards in a single column
- Allow Famous Craft Gallery to scroll horizontally
- Show NUFORC Shape Index as stacked cards
- Keep the main viewer large and near the top on shape detail pages

### Desktop

On desktop:

- Split the 3D viewer and explanatory content into left and right columns when space allows
- Show shape cards in a 3-4 column grid
- Allow NUFORC Shape Index to use a table layout
- Let the top page sections breathe with wider spacing and stronger panel framing

## Motion And Effects

### Hover And Tap

On hover:

- White outlines become slightly brighter
- Thumbnails rotate very slightly

On mobile tap:

- Cards should scale up lightly or feel pressed

### Hero Motion

The hero model should rotate slowly and calmly.

This motion should communicate study and inspection rather than spectacle.

### Viewer Motion

3D interaction should feel smooth and precise.

Transitions between display modes should be simple and fast, without theatrical animations.

### Background Effects

Subtle ambient motion such as grain shimmer or faint scanline movement may be used sparingly.

Effects should support atmosphere without distracting from labels, silhouettes, or data.

## Implementation Notes

- Use Next.js and React
- Use Three.js or React Three Fiber
- Use Drei `OrbitControls`
- Use `useGLTF` for GLB display
- Build procedural UFO forms as reusable components
- Prefer SVG for 2D silhouettes
- Manage NUFORC silhouettes as SVG assets
- Prefer SVG over raster imagery wherever possible so the visual system stays consistent as white line art

## Asset Policy

- Do not use attached classical UFO classification charts directly as UI assets
- Use them only as references for classification, atmosphere, and layout ideas
- Draw new SVG silhouettes for actual UI use
- Use existing 3D models in the Famous Craft Gallery
