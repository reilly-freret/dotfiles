# `.dotfiledata`

This directory stores backing files for symlink-managed dotfiles that should be
tracked in git but **must not** be parsed by chezmoi as source entries or
templates.

## Why this exists

chezmoi ignores paths that start with `.` (except `.chezmoi*`). That makes this
directory safe for raw data files that may contain template-like syntax such as
`{{` or `{{{` (for example, `kitty.conf`), which can cause parse errors if
stored in `.chezmoitemplates/`.

## When to use this directory

Use `.dotfiledata/` for symlink backing files when:

- the file contains template-like braces or other content that breaks chezmoi
  template parsing, or
- the file should be treated as opaque data and not as a chezmoi-managed source
  file.

## Typical pattern

1. Store the backing file in `.dotfiledata/...`.
2. Create a `symlink_*.tmpl` source entry at the managed target path.
3. Point it to the backing file with `joinPath`, for example:

```tmpl
{{ joinPath .chezmoi.sourceDir ".dotfiledata" "kitty" "kitty.conf" }}
```
