# Teddy Typtoes Tickle Tower

![icon](./public/assets/icon.png)

## Development

```sh
npm i # installs dependencies
npm start # starts dev server
npm run build # creates production build
```

Hot-reload is available for:

- textures
- audio

## Release

1. Bump the package version (`npm version patch/minor/major`)
2. Push changes
3. Go to [release action](https://github.com/SweetHeartSquad/ggj2024/actions/workflows/release.yml)
4. Select "Run workflow", and confirm on `main` branch

The workflow will automatically create a build and upload it to itch.io.
