import os from 'os'
import path from 'path'
import execa from 'execa'
import fs from 'fs-extra'
;(async function () {
  try {
    let tmpdir = path.join(os.tmpdir(), `next-swc-${Date.now()}`)
    await fs.ensureDir(tmpdir)
    let cwd = process.cwd()
    let pkgJson = {
      name: 'dummy-package',
      version: '1.0.0',
      optionalDependencies: {
        '@next/swc-android-arm64': 'canary',
        '@next/swc-darwin-arm64': 'canary',
        '@next/swc-darwin-x64': 'canary',
        '@next/swc-linux-arm-gnueabihf': 'canary',
        '@next/swc-linux-arm64-gnu': 'canary',
        '@next/swc-linux-arm64-musl': 'canary',
        '@next/swc-linux-x64-gnu': 'canary',
        '@next/swc-linux-x64-musl': 'canary',
        '@next/swc-win32-arm64-msvc': 'canary',
        '@next/swc-win32-ia32-msvc': 'canary',
        '@next/swc-win32-x64-msvc': 'canary',
      },
    }
    await fs.writeFile(
      path.join(tmpdir, 'package.json'),
      JSON.stringify(pkgJson)
    )
    let { stdout } = await execa('yarn', ['--force'], { cwd: tmpdir })
    console.log(stdout)
    let pkgs = await fs.readdir(path.join(tmpdir, 'node_modules/@next'))
    await fs.ensureDir(path.join(cwd, 'node_modules/@next'))

    await Promise.all(
      pkgs.map((pkg) =>
        fs.move(
          path.join(tmpdir, 'node_modules/@next', pkg),
          path.join(cwd, 'node_modules/@next', pkg),
          { overwrite: true }
        )
      )
    )
    await fs.remove(tmpdir)
    console.log('Installed the following binary packages:', pkgs)
  } catch (e) {
    console.error(e)
    console.error('Failed to load @next/swc binary packages')
  }
})()
