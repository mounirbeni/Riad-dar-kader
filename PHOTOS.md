# Riad Dar Kader — Photo checklist

Every spot on the site that needs a real photo is now marked with a labelled
**photo slot** (camera icon + name + recommended ratio + a short code like
`H1`, `G3`, `mouassine-2`). Browse the site and you will see exactly where each
photo goes. This file is the master count.

## Summary — how many photos you need

| Group | Slots | Distinct photos needed |
|-------|-------|------------------------|
| Rooms (7 rooms × 4) | 28 | **28** |
| Experiences (1 per extra) | 10 | **10** |
| Gallery / ambiance pool | 12 | **12** |
| Hero & "Le Riad" sections | 5 | reuse gallery/ambiance — **0 extra** |
| **TOTAL** | **55 slots** | **≈ 50 photos** |

> The hero backgrounds and the "Le Riad" page sections reuse photos from the
> gallery/ambiance pool (e.g. the patio photo can appear on the home hero, the
> Le Riad page **and** the gallery). So you can launch beautifully with **~50
> good photos**, or as few as ~38 if you skip room detail shots (1 main photo
> per room instead of 4).

## Minimum viable set (~22 photos)
- 1 main photo per room → 7
- 1 photo per experience → 10
- 5 ambiance photos (patio, terrace, façade, lounge, zellige detail) → 5

---

## Detailed slot list

### Hero & "Le Riad" page (reuse ambiance photos)
| Code | Where | Suggested shot | Ratio |
|------|-------|----------------|-------|
| H1 | Home hero (mobile/tablet background) | Façade or patio | Landscape |
| H2 | Home hero (desktop right pane) | Patio / terrace ambiance | Portrait |
| LR1 | Le Riad — hero | Riad ambiance | 16:9 |
| LR2 | Le Riad — "Le patio" | The central patio | 4:3 |
| LR3 | Le Riad — "La Médina" | Medina street / surroundings | 4:3 |

### Gallery — `/galerie` (canonical ambiance pool, 12)
G1 Patio central · G2 Terrasse panoramique · G3 Chambre Mouassine ·
G4 Salon marocain · G5 Détail zellige · G6 Cour intérieure ·
G7 Coin thé · G8 Façade discrète · G9 Suite Terrasse ·
G10 Escalier traditionnel · G11 Lanternes · G12 Petit-déjeuner
*(The "Le Riad" mini-gallery reuses G1–G8.)*

### Experiences — `/experiences` (1 per extra, 10)
E1 Transfert aéroport · E2 Petit-déjeuner marocain · E3 Dîner sur la terrasse ·
E4 Visite guidée de la Médina · E5 Hammam / spa · E6 Décoration romantique ·
E7 Décoration anniversaire · E8 Atelier cuisine privé ·
E9 Arrivée anticipée · E10 Départ tardif

### Rooms — `/chambres/[slug]` (4 each: 1 main + 3 detail, 28)
For each room: `slug-1` (main, 16:9 / 4:3) + `slug-2/3/4` (details, 1:1).

- mouassine-1…4 — Chambre Mouassine
- saadienne-1…4 — Chambre Saadienne
- bahia-1…4 — Chambre Bahia
- koutoubia-1…4 — Chambre Koutoubia
- medina-1…4 — Suite Medina
- patio-1…4 — Suite Patio
- terrasse-1…4 — Suite Terrasse

---

## How to add the photos

- **Room photos:** upload to the room's `photos` array (admin photo upload can
  be wired up next — ask and I'll add it). As soon as a room has photos, its
  slots are replaced automatically (first photo = main, the rest = gallery).
- **Hero / gallery / experiences:** these currently render from the slot
  components; once you provide the images I'll swap them to `next/image` for
  optimisation. Recommended format: JPG/WebP, longest edge ~2000px.
