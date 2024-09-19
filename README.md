# Ready2React

Setup
```sh
pnpm install
```

## Development

Create a `.env.development(.local?)` based on `.env.example`

```sh
pnpm dev
```

### Devtools

Come with [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector)

To open, use keyboard shortcuts:

- On macOS: `Ctrl + Shift + Command + C`
- On Windows / Linux: `Ctrl + Shift + Alt + C`

## Staging (Test)

Create a `.env.staging(.local?)` based on `.env.example`

```sh
pnpm build --mode staging
```

## Production

Create a `.env.production(.local?)` based on `.env.example`

```sh
pnpm build
```

## Notes

About SWC version:
- `swc-jotai/react-refresh`, `swc-jotai/debug-label` is on `swc_core` version `0.90.37`
- So in order for everything to work properly, we locked `@swc/plugin-react-remove-properties` at `2.0.7` and `@swc/core` at `1.6.13`
