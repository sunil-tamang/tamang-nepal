# Deploy later to GitHub Pages

The source is ready for GitHub Pages, but nothing in this download publishes automatically. The included workflow has **only a manual trigger**.

GitHub Pages websites are normally public, even when their source repository is private. A `noindex` tag discourages search indexing; it is not access control. Keep using the local preview until you are ready to make the website available.

## When you decide to publish

1. Create your own GitHub repository, for example `TAMANG-Nepal`. Upload the contents of this project folder, including `.github/workflows/pages.yml`. The files should be at the repository root, not inside an additional nested folder. Exclude `vendor`, `.bundle`, `.jekyll-cache` and any personal files.
2. In the repository choose **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. In **Actions**, choose **Deploy TAMANG to GitHub Pages → Run workflow** on your default branch. Leave indexing disabled for a review version, or enable it when the content is ready.
4. Wait for the build and deployment jobs to finish. The workflow's deployment result and Settings → Pages show the resulting URL.

For a repository named `TAMANG-Nepal`, the usual URL is `https://YOUR-USERNAME.github.io/TAMANG-Nepal/`. The workflow reads the correct base path from GitHub automatically, so you do not have to hardcode your username or repository name into HTML or JavaScript.

For `YOUR-USERNAME.github.io` or a custom domain, that base path is empty. Set custom domains through GitHub Pages settings when you choose to use one. No custom domain or commerce service is connected by this project.

## After editing

Commit your changed source and push it. This does **not** redeploy by itself. Use **Run workflow** again when you want the next version published. To add automatic deployment in the future, deliberately add a push trigger to the workflow.

You can omit the prebuilt `dist` folder from the GitHub repository if preferred: the workflow rebuilds it from source. Include the original assets and `_products` / `_notes` directories.

## Test a repository subpath locally

With Ruby 3.3 and Bundler active:

```bash
bundle exec jekyll serve --baseurl /TAMANG-Nepal
```

Open `http://127.0.0.1:4000/TAMANG-Nepal/`. For ordinary local development use the provided launcher, which serves at `/`.

## Indexing

`_config.yml` defaults to `indexing: false`. The manual workflow can merge `_config.production.yml` to allow indexing. The `robots.txt` template follows the same setting. This is an editorial readiness setting, not privacy protection.

## Official references

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://jekyllrb.com/docs/github-pages/

The workflow uses GitHub's Pages actions, a Ruby 3.3 build and the `configure-pages` base-path output. It uploads the generated `dist` directory, not the unrendered Jekyll source.
