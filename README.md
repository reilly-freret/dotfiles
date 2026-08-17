# Dotfiles

Managed with [chezmoi](https://github.com/twpayne/chezmoi), currently for macOS.

## Bootstrap

```sh
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply reilly-freret
```

## Repository layout (why things are symlinked)

Most managed files are symlink entries that point to backing files in this repo.
This keeps target paths (`~/.zshrc`, `~/.config/zed/settings.json`, etc.) stable
while letting backing files live in organized source folders.

- `symlink_*.tmpl` entries define where the real file should appear on disk.
- `.chezmoitemplates/` stores normal backing files (zsh, zed, nvim, starship, etc.).
- `.dotfiledata/` stores raw backing files that should not be parsed as chezmoi
  templates (for example, `kitty.conf` with brace-heavy syntax).

Examples:

- `symlink_dot_zshrc.tmpl` -> `.chezmoitemplates/zsh/zshrc`
- `private_dot_config/kitty/symlink_kitty.conf.tmpl` -> `.dotfiledata/kitty/kitty.conf`

## zsh + OMZ setup

`~/.zshrc` is symlinked from `.chezmoitemplates/zsh/zshrc`.

Current shell stack:

- Oh My Zsh is initialized via `$ZSH/oh-my-zsh.sh`.
- Custom completion directory `~/.zfunc` is prepended to `fpath` before OMZ loads.
- `mise` is activated with `eval "$(mise activate zsh)"`.
- `starship` is initialized at the end of `zshrc`.
- `~/.zshenv` sources Rust cargo env (`$HOME/.cargo/env`).

## Generated completions (mise-managed tools)

Completions for tools without OMZ plugins are generated into `~/.zfunc`:

- `scripts/run_onchange_10-generate-just-completions.sh.tmpl` writes `~/.zfunc/_just`
  using `mise x just -- just --completions zsh`.
- `scripts/run_onchange_11-generate-pnpm-completions.sh.tmpl` writes `~/.zfunc/_pnpm`
  using `mise x pnpm -- pnpm completion zsh`.

Notes:

- Completion files are runtime artifacts in `$HOME`, not versioned in this repo.
- These scripts are `run_onchange_*`, so they run when their script/template
  changes (or on first apply), not on every `chezmoi apply`.

## Firefox + Tridactyl

Replaces the qutebrowser setup. Firefox has no single static config file, so
this splits across three plain-text files:

- `.chezmoitemplates/tridactyl/tridactylrc` -> `~/.tridactylrc`
  Jump targets ported from qutebrowser quickmarks, as `searchurls`. Tridactyl
  `quickmark`s are limited to a single character (`go<key>`), so `searchurls`
  are used instead to keep semantic multi-word names: `o convex-staging`,
  `t github-ploutos` (new tab), `w axiom` (new window).
- `.chezmoitemplates/firefox/user.js` -> `<profile>/user.js`
  Prefs, re-applied by Firefox at every startup. The closest analogue to
  qutebrowser's `config.py`.
- `.chezmoitemplates/firefox/userChrome.css` -> `<profile>/chrome/userChrome.css`
  UI chrome, roughly qutebrowser's `window.hide_decoration`. Requires
  `toolkit.legacyUserProfileCustomizations.stylesheets`, set in `user.js`.

Note that `~/.tridactylrc` is not read automatically the way `config.py` was.
Tridactyl stores its config in Firefox's internal database, so on a fresh
profile you must run `:source` once (or set an `autocmd`) to load it.

The Firefox profile directory carries a machine-specific random prefix
(`txjxifdm.default-release`), so `user.js` and `userChrome.css` cannot be
static `symlink_` entries. `scripts/run_onchange_20-link-firefox-profile.sh.tmpl`
resolves the active profile from `profiles.ini` at apply time and links them.

Bookmarks are deliberately not managed. They live in `places.sqlite`, a binary
database Firefox rewrites constantly. The only statically-declarable option is
an enterprise `policies.json`, which must live inside `/Applications/Firefox.app`
(outside chezmoi's reach, and replaced on every Firefox update) and produces
read-only bookmarks. The `searchurls` above cover the same need.

## Chezmoi script behavior

- `run_once_before_*`: executes once before apply workflow.
- `run_onchange_*`: executes when source content changes.

Current scripts:

- `scripts/run_once_before_00-install-homebrew.sh.tmpl`: installs NanoBrew.
- `scripts/run_onchange_00-install-brew-items.sh.tmpl`: installs packages from `Nanobrew`.
- `scripts/run_onchange_10-generate-just-completions.sh.tmpl`: generates `just` completion.
- `scripts/run_onchange_11-generate-pnpm-completions.sh.tmpl`: generates `pnpm` completion.
- `scripts/run_onchange_20-link-firefox-profile.sh.tmpl`: links `user.js` and
  `userChrome.css` into the active Firefox profile.
