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

## Chezmoi script behavior

- `run_once_before_*`: executes once before apply workflow.
- `run_onchange_*`: executes when source content changes.

Current scripts:

- `scripts/run_once_before_00-install-homebrew.sh.tmpl`: installs NanoBrew.
- `scripts/run_onchange_00-install-brew-items.sh.tmpl`: installs packages from `Nanobrew`.
- `scripts/run_onchange_10-generate-just-completions.sh.tmpl`: generates `just` completion.
- `scripts/run_onchange_11-generate-pnpm-completions.sh.tmpl`: generates `pnpm` completion.
