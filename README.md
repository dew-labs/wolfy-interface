# Wolfy Interface

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

About `abi-wan-kanabi`:

- Using version `2.2.3` will result in type errors, must pin at `2.2.2`
