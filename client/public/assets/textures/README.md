# Papyrus Texture Assets

## Source and License
- `papyrus_base.webp` and `papyrus_fibers.webp` are original, procedurally generated assets created in-house with `ffmpeg` noise/perlin synthesis.
- License: project-owned original artwork (no third-party attribution required).

## Optimization
- `papyrus_base.webp`: 2400x3200, quality 80, 134,314 bytes (~131 KB).
- `papyrus_fibers.webp`: 1800x2400, quality 72, 194,082 bytes (~190 KB).
- Combined payload for modal texture layers: 328,396 bytes (~321 KB), loaded only when the modal mounts.

## Processing Notes
- Contrast and saturation were intentionally restrained to preserve text readability.
- Fiber intensity is applied via a separate layer at low CSS opacity to avoid visual competition with body copy.
