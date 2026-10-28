# TAMANG Nepal — Jekyll website

A complete, responsive website built from the approved warm cream editorial direction: regular serif headings, the simplified TAMANG mountain logo, original product photographs and material storytelling.

**Start with [START-HERE.md](START-HERE.md).** It includes a no-install preview and the fix for macOS system Ruby 2.6.

## Included

- Homepage with feature stories, material selector and horizontal product browsing.
- Four-product collection with category filters, search, sorting, comparison and saved pieces.
- Tote Bag, Laptop Cover, Chalk Bag and Toiletries Bag detail pages with image crop/zoom, construction, care, related pieces and enquiry links.
- Our Story, Makers, interactive Materials, Care and Get Involved pages.
- Journal with six linked notes and working category filters.
- Curated real Instagram posts. Native Instagram embeds load only when requested.
- Local enquiry preparation with validation, copy/download and saved-piece inclusion. No form data is sent automatically.
- Responsive menu, keyboard controls, focus handling, reduced-motion support and self-hosted fonts.
- Prebuilt `dist` folder, Mac/Windows preview launchers and VS Code tasks.
- A manual GitHub Pages workflow for later deployment.

Boxy Pouch and Slipper Carrier are discontinued. Their old URLs show a short notice, with no product controls, rather than reintroducing them into the catalogue. Stale saved identifiers are ignored.

## Run locally

Immediate view of the included build:

```bash
bash Preview.command
```

Open http://127.0.0.1:5500. Requires Python 3, Node.js or a compatible local Ruby/WEBrick.

Editable Jekyll development (Ruby 3.2–3.x; Ruby 3.3 recommended):

```bash
gem install bundler
bash scripts/serve.sh
```

Open http://127.0.0.1:4000. If you have Apple's Ruby 2.6, follow the Homebrew commands in `START-HERE.md` first. The launcher detects supported Homebrew Ruby, installs dependencies locally and starts Jekyll. On Windows with Ruby+Devkit installed, use `bundle install` then `bundle exec jekyll serve --baseurl ""`.

Build without serving:

```bash
bash scripts/build.sh
```

Or, with the correct Ruby already on your PATH:

```bash
bundle install
bundle exec jekyll build
```

## Structure

```text
_config.yml              Site configuration (default noindex)
_data/                   Navigation, material stories, Instagram data
_includes/               Shared cards, menu, Instagram and invitation
_layouts/                Default shell, product and journal layouts
_products/               The four current products
_notes/                  Six journal notes
assets/                  Editable CSS, plain JavaScript, fonts and images
dist/                    Included generated preview (rebuilt by Jekyll)
scripts/                 Local launchers and verification scripts
.github/workflows/       Manual Pages deployment workflow
.vscode/                 Recommended settings, extensions and tasks
```

All routes and asset references use Jekyll's `relative_url`, including data passed to JavaScript. The project supports both a root domain and a GitHub repository subpath. No Jekyll theme, Node build or paid service is required.

## Content and imagery

Product and founder photography comes from TAMANG sources. The Laptop Cover uses the original JPG on grass, without replacing its setting. Product detail crops use that same original photo. Material and landscape photographs include clearly documented illustrative placeholders; replace them with your own assets using `IMAGE-REPLACEMENT.md`.

Journal entries are editorial material notes, not dated reports of events. Sizes, current colours, composition, price and delivery are confirmed by enquiry. There are no invented impact figures, testimonials or price claims.

Saved product identifiers stay in the visitor's browser when local storage is available. The enquiry form keeps its input only in the current page. The optional Instagram embed contacts Instagram after a click. See Care & Information on the site for the visitor-facing explanation.

## GitHub Pages later

Follow [GITHUB-PAGES.md](GITHUB-PAGES.md). The workflow does not run on push; you decide when to run it. No deployment has been performed for this deliverable.

## Checks

After building:

```bash
python3 scripts/verify-links.py
node --check assets/js/site.js
```

Optional DOM integration checks (requires Node.js):

```bash
npm install --no-save --package-lock=false jsdom@26.1.0
node scripts/verify-interactions.cjs
```

`QA.md` records the verification completed for this edition. A subpath build can also be checked using `python3 scripts/verify-links.py --root /path/to/build --baseurl /repo-name`.
