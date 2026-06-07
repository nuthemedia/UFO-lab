# Kinichi Features

## Core Features

### 1. Shape Cards

Show representative UFO shape families as a card grid.

Each card should display:

- Shape name in Japanese
- Shape name in English
- 2D silhouette
- Short description
- Whether 3D is supported
- Number of related representative cases
- Related NUFORC categories

Selecting a card should navigate to that shape's detail page.

### 2. 3D Shape Viewer

Display UFO shapes in Three.js.

Base interactions:

- Auto rotation
- Drag rotation
- Pinch or wheel zoom
- Reset
- Wireframe toggle
- Silhouette display toggle
- Lighting toggle: normal, backlit, night

Procedural shapes to support in Three.js:

- `sphere`
- `disk`
- `dome_saucer`
- `cigar`
- `cylinder`
- `triangle`
- `boomerang`
- `tic_tac`
- `cone`
- `egg`
- `diamond`

Existing GLB-backed craft models:

- `tic_tac_model`
- `adamski_model`
- `paul_villa_model`
- `billy_meier_model`

### 3. Shape Detail Page

Each shape page should display:

- A 3D model or 2D silhouette
- Overview of the shape
- Visual characteristics
- Common sighting situations
- Representative cases
- Common misidentification targets
- Related famous craft models
- Related NUFORC categories
- Links to related UFO Lab Tokyo products

Example: triangle UFO

- Characteristics: black triangle, lights at the vertices, slow movement, frequent night reports
- Representative cases: Belgian UFO wave, Phoenix Lights, Hudson Valley sightings
- Misidentification examples: aircraft formations, military aircraft, drones, stars, lighting

### 4. Famous Craft Gallery

Display owned famous UFO 3D models as a gallery.

Initial targets:

- Tic Tac
- Adamski
- Paul Villa
- Billy Meier

Each card should display:

- Model name
- Related person
- Related case or photo
- Era or year
- Shape classification
- 3D model preview
- Link to detail page

This section must stay separate from shape families. It is a gallery of notable individual models, not a classification layer.

### 5. NUFORC Shape Index

Display NUFORC shape categories as an index.

Each item should include:

- `shapeId`
- `name`
- `silhouettePath`
- `sightingCount`
- `relatedKinichiShapeIds`
- `sourceLabel`
- `sourceUrl`

3D representation is not required for this section. The focus is 2D silhouettes and sighting counts.

Because counts can change over time, the data should include `lastUpdated`.

### 6. Related Cases

Attach representative cases to each shape.

Case data should support:

- `caseId`
- `titleJa`
- `titleEn`
- `year`
- `location`
- `shortDescription`
- `relatedShapeIds`
- `relatedCraftIds`
- `sourceType`

The MVP only needs a small number of representative cases. A full incident database is deferred.

### 7. Misidentification Notes

Show common misidentification candidates for each shape.

Examples for sphere or orb:

- Balloon
- Weather balloon
- Drone
- Venus
- Fireball
- Lens flare

Examples for cigar:

- Airship
- Aircraft fuselage
- Cloud
- Rocket
- Telephoto compression

This feature should also act as a pathway into Ohtsuki.

### 8. Data Structure Example

```ts
export type ShapeEntry = {
  id: string
  nameJa: string
  nameEn: string
  family: string
  modelType: 'procedural' | 'glb' | 'image-only'
  proceduralType?: string
  modelPath?: string
  silhouettePath: string
  shortDescription: string
  features: string[]
  representativeCases: string[]
  misidentifications: string[]
  nuforcShapeIds: string[]
  relatedCraftIds: string[]
  relatedProductLinks: {
    label: string
    href: string
  }[]
  caution: string
}

export type FamousCraft = {
  id: string
  nameJa: string
  nameEn: string
  relatedPerson: string
  relatedCase: string
  year?: string
  shapeId: string
  modelPath: string
  thumbnailPath: string
  shortDescription: string
}

export type NuforcShape = {
  id: string
  name: string
  silhouettePath: string
  sightingCount: number
  relatedShapeIds: string[]
  sourceUrl: string
  lastUpdated: string
}
```

## User Flow

Primary MVP flow:

1. User lands on the top page.
2. User browses representative shape cards.
3. User filters or searches for a shape when needed.
4. User opens a shape detail page.
5. User inspects the 3D viewer or silhouette.
6. User reads shape notes, related cases, and misidentification candidates.
7. User moves to the famous craft gallery, NUFORC index, or related UFO Lab Tokyo products.

Secondary gallery flow:

1. User opens the famous craft gallery.
2. User browses notable individual UFO models.
3. User opens a craft detail target from the gallery card.
4. User returns to the related shape family or a connected product.

Secondary data flow:

1. User opens the NUFORC Shape Index.
2. User compares silhouettes and sighting counts.
3. User jumps from a NUFORC category to the related Kinichi shape page.

## States

Important states for the MVP:

- Loading: 3D viewer loading, GLB loading, and data loading
- Empty: no cases yet for a shape, no related craft, or no related NUFORC category
- Error: model load failure, missing silhouette, or missing linked record
- Success: shape page, viewer, gallery, and index render normally
- Mobile: viewer and cards remain usable on small screens
- Non-3D shapes: show 2D silhouette when 3D is unavailable
- Data freshness: show `lastUpdated` for NUFORC counts when present

## Acceptance Criteria

MVP implementation should cover:

- Top page
- Representative shape list
- 3D viewer
- Famous UFO gallery
- NUFORC Shape Index
- Shape detail pages
- Smartphone support
- Basic search and filtering

The MVP should be considered complete when:

- Users can browse major UFO shapes from a single entry page
- At least the primary shape set is visible as cards with silhouette and summary data
- Eight primary shapes can be viewed in Three.js
- Famous craft models are presented separately from shape classification
- NUFORC categories can be compared using silhouettes and sighting counts
- Each shape page includes a summary, related cases, and misidentification notes
- Related product links are visible from the shape detail experience

Deferred features:

- Year-by-year trend charts
- Automatic NUFORC updates
- Full-text search across a case database
- Deep Ruppelt integration
- Multilingual support
- User submissions
