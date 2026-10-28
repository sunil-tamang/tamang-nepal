# Replace photographs and brand assets

All imagery is stored locally. There are no external image hotlinks. Keep your replacement at the same path to update all uses, or change the relevant data field. Prefer compressed WebP/JPG photographs with similar aspect ratios and meaningful alt text.

| Area                    | Asset or source                                                    | Notes                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Simplified logo         | `assets/images/tamang-logo.svg`                                    | Exact vector wordmark + mountain. No tagline.                                                                             |
| Homepage banner         | `assets/images/scenes/tote-right.webp`, referenced in `index.html` | Illustrative product/landscape scene; replace with a wide campaign photograph. Adjust `object-position` in CSS as needed. |
| Place imagery           | `assets/images/objects/kakani.webp`                                | Illustrative landscape, also used by the invitation and catalogue title band.                                             |
| Co-founder              | `assets/images/brand/founder.webp`                                 | Actual Yujin Tamang / Sita portrait.                                                                                      |
| Crochet hands           | `assets/images/brand/community.webp`                               | Actual TAMANG photograph.                                                                                                 |
| Four origin photographs | `_data/materials.yml` → `photo`                                    | Illustrative material studies in `assets/images/editorial/`.                                                              |
| Product photographs     | `_products/*.md` → `image`, `image_alt`, dimensions                | Actual source photos. Change one record to update cards, details and saved items.                                         |
| Laptop Cover            | `assets/images/real-products/laptop-cover-original.jpg`            | Original from TAMANG's website, preserving the grass composition, buttons and string.                                     |
| Journal                 | `_notes/*.md` → `image`, `image_alt`, `caption`                    | Existing material studies and real TAMANG photos.                                                                         |
| Instagram               | `_data/instagram.yml`                                              | Local thumbnail, exact original post URL, caption and dimensions.                                                         |

`ASSETS.md` records source provenance and licenses. Illustration placeholders should be replaced with verified brand photographs before presenting them as documentary evidence. No generated portrait is used as a named team member.

The product gallery's closer view is a CSS crop of the same source image, not a fabricated second photograph. To add real additional angles later, extend the product data and gallery script together.

To add a product, copy a Markdown file in `_products`, give it a unique filename/slug and number, and fill in its facts. Cards, filters, related products and enquiry choices are generated from this collection. To discontinue one, remove its Markdown record. Existing saved identifiers are filtered against the current collection.

After source or image changes, rebuild Jekyll; `dist` is generated output.
