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

- `.chezmoiscripts/run_onchange_10-generate-just-completions.sh.tmpl` writes `~/.zfunc/_just`
  using `mise x just -- just --completions zsh`.
- `.chezmoiscripts/run_onchange_11-generate-pnpm-completions.sh.tmpl` writes `~/.zfunc/_pnpm`
  using `mise x pnpm -- pnpm completion zsh`.

Notes:

- Completion files are runtime artifacts in `$HOME`, not versioned in this repo.
- These scripts are `run_onchange_*`, so they run when their script/template
  changes (or on first apply), not on every `chezmoi apply`.

## Firefox + Tridactyl

Replaces the qutebrowser setup, whose files have been removed from this repo.
Firefox has no single static config file, so this splits across four
plain-text files:

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
  Deliberately minimal now that tabs are handled natively.

- `.chezmoitemplates/firefox/policies.json` -> inside `Firefox.app` (see below)
  Enterprise policy: auto-installs extensions, disables telemetry/Pocket/
  onboarding, kills the built-in password manager, and turns on native
  vertical tabs.

`~/.tridactylrc` is sourced automatically at startup, but *only* when the
Tridactyl native messenger is installed -- Tridactyl is a WebExtension and
otherwise cannot read the filesystem. Without native, `o <alias>` silently
falls through to a web search. `:findrc` shows which rc file was picked up.

### Artifacts that live outside this repo

Some of these cannot be normal chezmoi entries, because chezmoi manages
`$HOME` and they live elsewhere. They are deployed by scripts, with the
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

Extensions use `force_installed`: they auto-install on a new machine with **no
permission prompt**, and cannot be removed or disabled from `about:addons`.
(`normal_installed` also skips the prompt -- policy-installed extensions go
through `AddonManager` directly rather than the install doorhanger -- the only
difference is that it still allows disabling them.) To take one back under
manual control, change its mode to `allowed` and re-apply.

Currently declared: uBlock Origin, Tridactyl, Bitwarden.

Extension IDs are the addon's internal GUID, not its AMO slug, and a wrong ID
fails silently. Look one up with:

```sh
curl -fsSL https://addons.mozilla.org/api/v5/addons/addon/<slug>/ | jq -r .guid
```

### Setting up a new machine

Firefox itself is installed by hand -- it's commented out in `Nanobrew`
because casks are unreliable there. Everything after that is automated:

```sh
# install Firefox manually, then:
git pull && chezmoi apply
```

`chezmoi apply` will, in order: create a Firefox profile if none exists
(headlessly, via `-CreateProfile` -- no need to launch Firefox first), symlink
`user.js` and `userChrome.css` into it, copy `policies.json` into the app
bundle, and install the Tridactyl native messenger.

Then launch Firefox once. Extensions install on that first launch, not at
apply time, so `about:addons` will be empty until then.

Two things are inherently manual, being per-profile UI state rather than
config files:

- Sign in to Bitwarden.

(Vertical tabs come up automatically -- they are prefs, not UI state.)

### New tab vs new window (Tridactyl)

**New tabs work.** Tridactyl overrides `about:newtab` via `chrome_url_overrides`
in its manifest, and `.tridactylrc` sets `newtab about:blank` so a new tab is
instant and empty. Tridactyl still binds there -- it special-cases this exact
setup (tridactyl#829), and a tab opened from an existing one inherits a
principal so the content script is injected.

**New windows do not work, and cannot be made to.** This was investigated
properly rather than patched around:

Firefox loads a new window's first tab from `browser.startup.homepage` itself,
before any extension can claim it. Every reachable target is a page Tridactyl
cannot run on:

| Homepage value | Why it fails |
|---|---|
| `about:home`, `about:newtab` | privileged pages; Firefox refuses content scripts. `BROWSER_NEW_TAB_URL` resolves the extension override only on the new-*tab* path, not for the homepage -- there is no channel-level redirect for `about:newtab` |
| `about:blank` | top-level, so it has a null principal. `match_about_blank` only covers `about:blank` that inherits a principal from an opener |
| `moz-extension://<uuid>/static/newtab.html` | would work -- that page loads `content.js` from its own `<script>` tag -- but the UUID is generated per profile. `UUIDMap.get()` returns any existing entry, so it cannot be pinned on a profile that already has one, and writing the whole map would clobber the other extensions' UUIDs |

Upstream treats this as a WebExtension limitation
([tridactyl#775](https://github.com/tridactyl/tridactyl/issues/775),
labelled `webext-limitation`; the related startup race
[bug 1518863](https://bugzilla.mozilla.org/show_bug.cgi?id=1518863) was fixed
in Firefox 67 and is *not* this).

The homepage is therefore just `about:blank`: instant and empty rather than
Firefox's newtab page with its search box and content. On a new window, press
`Ctrl-,` or navigate somewhere to get Tridactyl back. If you want a new window
that *does* have Tridactyl, open it from an existing one with `:winopen`.

### Passwords

Bitwarden is the only password manager in play. Firefox's built-in one is
turned off by policy rather than by preference, so it cannot drift:

- `OfferToSaveLogins: false` -- never prompts to save a password.
- `PasswordManagerEnabled: false` -- removes the built-in manager.
- `signon.rememberSignons` / `signon.autofillForms` / `signon.generation.enabled`
  are also set `locked`, which greys them out in Settings.
- `DisableFormHistory`, `AutofillAddressEnabled`, `AutofillCreditCardEnabled`
  are off so Firefox stops competing with Bitwarden on form fills.

There is no "default password manager" switch in Firefox -- disabling the
built-in one *is* the mechanism.

### Tabs (native vertical tabs)

Tabs are Firefox's **native vertical tabs**, not an extension. Tree Style Tab
was used briefly and then dropped: Firefox 154 does this natively, and the
classic sidebar TST depends on is on Mozilla's deprecation path (see the
`old-sidebar-is-going-away-soon` rollout in `about:studies`).

Four prefs, all set in `policies.json` and mirrored in `user.js`:

| Pref | Value | Why |
|------|-------|-----|
| `sidebar.revamp`         | `true`        | vertical tabs live in the revamped sidebar and do not render without it |
| `sidebar.verticalTabs`   | `true`        | tabs in the sidebar instead of across the top |
| `sidebar.visibility`     | `always-show` | otherwise the launcher hides itself on close |
| `sidebar.position_start` | `false`       | sidebar on the **right** |

The first three are `locked`, which is what makes them stick: Firefox ships a
Nimbus rollout that controls the sidebar, and a locked pref reads from the
default branch and outranks both the experiment and any stale user value.

**Do not add `#TabsToolbar { visibility: collapse }` to `userChrome.css`.**
With vertical tabs on, Firefox *reparents the real tab strip* into the
sidebar's vertical toolbar (`SidebarController.toggleTabstrip`) rather than
drawing a second one -- collapsing `#TabsToolbar` therefore hides the actual
tabs and leaves no tab UI at all. That combination is what produced the
"tabs are simply not there" symptom.

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

- `.chezmoiscripts/run_once_before_00-install-homebrew.sh.tmpl`: installs NanoBrew.
- `.chezmoiscripts/run_onchange_00-install-brew-items.sh.tmpl`: installs packages from `Nanobrew`.
- `.chezmoiscripts/run_onchange_10-generate-just-completions.sh.tmpl`: generates `just` completion.
- `.chezmoiscripts/run_onchange_11-generate-pnpm-completions.sh.tmpl`: generates `pnpm` completion.
- `.chezmoiscripts/run_onchange_20-link-firefox-profile.sh.tmpl`: creates a Firefox
  profile if none exists, then links `user.js` and `userChrome.css` into it.
- `.chezmoiscripts/run_onchange_21-install-firefox-policies.sh.tmpl`: copies `policies.json`
  into the Firefox app bundle.
- `.chezmoiscripts/run_once_22-install-tridactyl-native.sh.tmpl`: installs the Tridactyl
  native messenger (required for `~/.tridactylrc` to be read at all).
