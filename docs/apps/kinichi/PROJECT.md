# Kinichi Project

Kinichi is a UFO shape atlas app for UFO Lab Tokyo.

## Overview

Kinichi is a UFO shape atlas that helps users understand representative UFO forms through 3D models, 2D silhouettes, famous cases, and sighting statistics.

The name comes from Japanese UFO researcher Kinichi Arai. Unlike the existing product line that often references overseas researchers, Kinichi should establish a distinctly Japan-originated UFO research tool inside UFO Lab Tokyo.

## Purpose

UFOs are often discussed first as shapes.

Kinichi organizes forms that appear in sighting reports, such as disks, domed disks, spheres, cigars, triangles, boomerangs, and Tic Tac types, so users can compare them visually.

Kinichi is not just a 3D gallery. It should connect:

- UFO shape classification
- Representative sighting cases
- Famous UFO models
- NUFORC shape categories and sighting counts
- Common misidentification targets
- Internal pathways to other UFO Lab Tokyo products

Each page should clearly state that these categories are practical labels for reports and testimony, not proof that similarly shaped sightings represent the same object or phenomenon.

Suggested notice text:

「この分類は目撃証言・報告データ上の便宜的な分類であり、同じ形状が同一の物体や同一現象を意味するものではありません。」

## Audience

- Users who want to compare major UFO shapes visually
- Readers who know common UFO terms such as disk, triangle, orb, or Tic Tac but want clearer structure
- UFO Lab Tokyo users moving between shape study, sighting records, documents, and image analysis

## Product Structure

Kinichi consists of three major layers.

### 1. Representative UFO Shapes

An encyclopedia section that displays representative UFO forms in Three.js.

Initial target examples:

- Disk
- Domed disk
- Adamski type
- Sphere / orb
- Cigar
- Cylinder
- Triangle
- Boomerang
- Tic Tac
- Egg
- Cone
- Diamond

Basic UFO forms should be built with Three.js primitives or procedural modeling.

### 2. Famous Craft Gallery

A lower gallery section that presents already-owned 3D models.

Initial targets:

- Tic Tac
- Adamski-type UFO
- Paul Villa UFO
- Billy Meier UFO

This section should be treated not as a taxonomy layer, but as a gallery of famous craft associated with specific incidents, photos, or people.

### 3. NUFORC Shape Index

A list view of NUFORC shape categories using 2D silhouettes and sighting counts.

This layer does not need to be fully represented in 3D. Its purpose is to show which shape labels are actually used in reported sighting data.

Display items:

- Shape name
- 2D silhouette
- Sighting count
- Related Kinichi shape page
- NUFORC reference link when needed

Initial examples:

- Light
- Triangle
- Circle
- Disk
- Sphere
- Oval
- Cigar
- Cylinder
- Fireball
- Chevron
- Cone
- Egg
- Diamond
- Rectangle
- Formation
- Other

## Product Connections

- Ohtsuki: route users toward misidentification examples and image analysis
- Ruppelt: route users toward source documents and government materials
- Kean: route users toward related people and modern UAP history
- Jacques: route users toward folklore, visionary, and anomaly comparison patterns

## MVP Scope

The first MVP should include:

- A top page
- A representative shape card grid
- Three.js views for eight primary shapes
- A famous UFO gallery
- A NUFORC Shape Index showing 2D silhouettes and sighting counts
- Short explanations for each shape
- Representative incidents and likely misidentification candidates

The priority of the MVP is to make UFO shape learning visually engaging and easy to enter. It should not attempt a complete incident database in the first release.

## Out Of Scope

- A complete incident database
- Exhaustive 3D coverage for every NUFORC category
- Claims about the identity or reality of any observed object based only on shape class
- Expanding beyond the documented three-layer structure before the MVP is complete
