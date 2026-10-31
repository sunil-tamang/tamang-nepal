# Verification — warm editorial edition

## Build

- Built successfully with Jekyll 4.3.2 and Ruby 3.2.3.
- 21 generated routes: eight main pages, four current product details, six journal notes, two legacy discontinuation notices and a 404 page.
- Root build and repository-subpath build (`/TAMANG-Nepal/`) both passed link, fragment, asset, image-alt, JSON, heading and noindex checks: 1,202 local references in each build.
- CSS parses successfully; font and background-image references resolve locally. JavaScript and Bash launcher syntax checks pass.
- The original Laptop Cover JPG is included verbatim. Logo remains the simplified wordmark and mountain, with no additional tagline.

## Interaction checks

The DOM integration suite passed navigation, mobile-menu open/close/Escape/focus and fallback handling; four-product category filtering, searching, sorting and URL state; empty results and comparison-table synchronisation; saved-piece persistence, removal and invalid/retired identifier recovery; each product's crop/zoom/enquiry link; homepage origin choices and keyboard controls; four material stages and keyboard tabs; enquiry validation, preparation, clipboard and note-download paths; subject starters; journal category filters and all linked articles; Instagram preview/embed handoff and blocked-script fallback.

A separate integration run passed all four product → save → enquiry round trips under `/TAMANG-Nepal/`, including product preselection, saved links, material-stage image paths and journal links.

## Rendered browser checks

Inspected the rendered desktop homepage, collection and original Laptop Cover page. Clicked category filtering, product navigation, saving and enquiry preparation. The prepared note included the selected Laptop Cover and stated that nothing had been sent.

Inspected real CSS layouts in 320px, 390px and 560px browser frames. Corrected a narrow-screen headline wrap and logo/saved-count collision. Opened the mobile photographic menu and followed its Journal link; the menu closed correctly. Desktop and responsive layouts use the same HTML, CSS and JavaScript.

## Limits

The launchers were syntax-checked here; they were not run on the user's own Mac or Windows installation. Local editable development requires a supported Ruby and a successful Bundler install. The included prebuilt preview avoids that installation for an immediate view.

Instagram's live service is outside this static project. Local images and original links work independently; native embed availability depends on Instagram and the visitor's browser. The suite checks the blocked-script fallback; no account credentials or API token are included.

No checkout, payments, automated message sending, GitHub publication or hosted Site update was performed.

## Supplied-reference reproduction — 31 October 2026

- Rebuilt the homepage, collection, material library, story and product detail layouts from the supplied references using live HTML/Liquid text and controls.
- Reference imagery is labelled as illustrative where the supplied design labels it. The four original product records and existing routes remain. Three reference example routes are added separately.
- Jekyll build and link/asset/fragment/JSON checks pass for 24 generated pages. Both JavaScript files pass Node syntax checking.
- Browser verified: category filtering (Carry yields one item), product thumbnail switching, saving/removing a reference product, material query links and switches, and mobile menu open/close.
- Browser checked all five reference pages at 390px: no horizontal overflow or broken loaded images. Desktop layouts visually compared with supplied references.
- No commit, push, deployment, DNS or workflow change.
