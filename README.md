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

- `.chezmoitemplates/firefox/policies.json` -> inside `Firefox.app` (see below)
  Enterprise policy: auto-installs extensions, disables telemetry/Pocket/onboarding.

`~/.tridactylrc` is sourced automatically at startup, but *only* when the
Tridactyl native messenger is installed -- Tridactyl is a WebExtension and
otherwise cannot read the filesystem. Without native, `o <alias>` silently
falls through to a web search. `:findrc` shows which rc file was picked up.

### Artifacts that live outside this repo

Two of the four files cannot be normal chezmoi entries, because chezmoi manages
`$HOME` and these live elsewhere. Both are deployed by scripts, with the
versioned copy in this repo remaining the source of truth. Edit the file here,
run `chezmoi apply`, never edit the deployed copy.

| Source of truth (versioned)                    | Deployed to                                        | By |
|------------------------------------------------|----------------------------------------------------|----|
| `.chezmoitemplates/firefox/user.js`            | `<profile>/user.js`                                 | `run_onchange_20` |
| `.chezmoitemplates/firefox/userChrome.css`     | `<profile>/chrome/userChrome.css`                   | `run_onchange_20` |
| `.chezmoitemplates/firefox/policies.json`      | `Firefox.app/Contents/Resources/distribution/`      | `run_onchange_21` |

**Profile files** (`user.js`, `userChrome.css`) are *symlinked*, so edits take
effect on the next Firefox launch with no re-apply. The profile directory has a
machine-specific random prefix (`txjxifdm.default-release`), so the script
resolves it from `profiles.ini` rather than hardcoding it.

**`policies.json`** is *copied*, not symlinked -- symlinking into a signed
`.app` bundle is fragile. Two consequences:

- Editing the source requires `chezmoi apply` to redeploy.
- **A Firefox update replaces the `.app` bundle and deletes the file.** Already
  installed extensions survive (they live in the profile), but policy stops
  being enforced. Re-run `chezmoi apply` after updating Firefox.

If `/Applications/Firefox.app` is not writable, the script prints the `sudo`
command to run instead of failing the whole apply.

Verify policy is live at `about:policies`; verify extensions at `about:addons`.

Extensions use `normal_installed`, so they auto-install on a new machine but
remain removable. Switch to `force_installed` in `policies.json` to lock them.

### Bookmarks

Deliberately not managed. They live in `places.sqlite`, a binary database
Firefox rewrites constantly. `policies.json` can declare them, but they become
read-only and re-asserted at every launch. The `searchurls` above cover the same
need with better ergonomics.

Settings changed through Firefox's UI (`Cmd+,`) are written to `prefs.js` and do
**not** flow back to this repo. Prefs listed in `user.js` are re-applied at every
startup, so UI changes to those revert; prefs not listed drift silently per
machine. Treat `user.js` as the source of truth.

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
- `scripts/run_onchange_21-install-firefox-policies.sh.tmpl`: copies `policies.json`
  into the Firefox app bundle.
- `scripts/run_once_22-install-tridactyl-native.sh.tmpl`: installs the Tridactyl
  native messenger (required for `~/.tridactylrc` to be read at all).
