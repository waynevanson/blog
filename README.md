# waynevanson.com blog

An [Astro](https://astro.build) site with [Keystatic](https://keystatic.com) as
the CMS. Content is stored in git, in this repository.

- Site: <https://blog.waynevanson.com>
- Admin: <https://blog.waynevanson.com/keystatic>
- Feed: <https://blog.waynevanson.com/rss.xml>

## Content

The home page lives in `content/home.yaml`. It holds the heading, intro, and
social links, all editable from the admin UI under **Home page**.

Posts live in `content/posts/*.mdoc` and are listed at `/posts/`. Each entry has
a title, description, publication date, draft flag, optional series name and
series part number, and a Markdoc body. The slug is derived from the title and
becomes the file name.

Posts with the same `series` value are grouped together. Give each one a
`seriesOrder` to control its position; unnumbered posts fall back to publish
date. A post that belongs to a series shows the other parts and its position at
the top of the page.

Keystatic runs in `github` mode, so edits made in the admin UI are committed
straight to `waynevanson/blog` through a GitHub App.

## Local development

```sh
nix develop
npm install
npm run dev
```

Node.js is pinned to `nodejs_24` in `flake.nix`. With [direnv] and
[nix-direnv] installed, `.envrc` activates the dev shell automatically (run
`direnv allow` once), so the flake's `node`/`npm` are used instead of any
system-wide versions.

[direnv]: https://direnv.net
[nix-direnv]: https://github.com/nix-community/nix-direnv

The admin UI is at <http://127.0.0.1:4321/keystatic>.

To use GitHub mode locally you need the GitHub App credentials:

```sh
KEYSTATIC_GITHUB_CLIENT_ID=...
KEYSTATIC_GITHUB_CLIENT_SECRET=...
KEYSTATIC_SECRET=...
```

## Production

The site is rendered on demand from a checkout of this repository, so published
content appears without a rebuild. The app is packaged with Nix:

```sh
nix build
```

The NixOS deployment (`modules/custom/services/blog.nix` in the `nix-config` repository) runs the
server, keeps a shallow checkout of this repository at `/var/lib/blog/repo`,
and proxies it at `blog.waynevanson.com`.

The reverse proxy must forward `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`,
and `X-Forwarded-Port` so Astro can trust the public origin (see
`security.allowedDomains` in `astro.config.mjs`). If those headers are missing,
`src/middleware.ts` falls back to the configured `site` origin for Keystatic's
GitHub OAuth login, so the callback URL is never `localhost`.

## GitHub App

Create a GitHub App at <https://github.com/settings/apps/new>:

- Homepage: `https://blog.waynevanson.com`
- Callback URL: `https://blog.waynevanson.com/api/keystatic/github/oauth/callback`
- Webhook: disabled
- Repository permissions: `Contents: Read and write`, `Metadata: Read-only`

Install it on `waynevanson/blog`, then put the app's client ID, client secret,
and a random `KEYSTATIC_SECRET` into the server's sops secrets.
