# Open TAMANG in VS Code

1. Unzip the download.
2. In VS Code choose **File → Open Folder** and select the `TAMANG-Nepal` folder, or open `TAMANG-Nepal.code-workspace`.
3. Open **Terminal → New Terminal**. It should be inside the project folder.

## View it immediately — no Jekyll installation needed

On Mac or Linux:

```bash
bash Preview.command
```

Open **http://127.0.0.1:5500**. Press **Control+C** to stop.

On Windows double-click `Preview.bat`, or use the VS Code task **TAMANG: Preview prebuilt site**. Python 3 or Node.js is enough. VS Code Live Server also works with the included settings: open `dist/index.html` using Live Server.

This displays the included `dist` build. Source edits need a Jekyll rebuild before they appear here. Do not open the HTML by double-clicking it in Finder: use the local server so all page links work.

## Edit with Jekyll on your Mac

Your previous errors came from Apple's `/usr/bin/ruby` version 2.6. Use a separate Ruby 3.3. Do not use `sudo gem install` and do not modify Apple's Ruby.

If Homebrew is already installed, run:

```bash
brew install ruby@3.3
export PATH="$(brew --prefix ruby@3.3)/bin:$PATH"
unset GEM_HOME GEM_PATH
gem install bundler
bash scripts/serve.sh
```

If Homebrew is missing, install it from https://brew.sh first, then run the commands above. The launcher also automatically detects Ruby 3.3 in the usual Apple Silicon and Intel Homebrew locations.

Open **http://127.0.0.1:4000**. Edit the source files and refresh; Jekyll rebuilds as you save. Restart the server after changing `_config.yml` or adding a new collection.

The launcher installs project gems into `vendor/bundle`. If your terminal still reports Ruby 2.6, run `bash scripts/serve.sh` directly; plain `bundle` can still refer to Apple's installation. To configure new Terminal windows, add the Homebrew Ruby `PATH` line above to `~/.zshrc`.

## What to edit

| Change                                 | Source                                     |
| -------------------------------------- | ------------------------------------------ |
| Homepage                               | `index.html`                               |
| Colours, spacing, fonts, mobile design | `assets/css/site.css`                      |
| Navigation                             | `_data/navigation.yml`                     |
| Product text and photograph            | `_products/*.md`                           |
| All product detail layouts             | `_layouts/product.html`                    |
| Material stories                       | `_data/materials.yml` and `materials.html` |
| Journal notes                          | `_notes/*.md`                              |
| Instagram posts                        | `_data/instagram.yml`                      |
| Logo                                   | `assets/images/tamang-logo.svg`            |
| Shared header and footer               | `_layouts/default.html`                    |

Edit source files, not `dist`: Jekyll regenerates `dist`.

Read `IMAGE-REPLACEMENT.md` for photographs and `GITHUB-PAGES.md` when you choose to deploy. Nothing has been published from this download, and there is no checkout or payment integration.
