Build Instructions
==================

Run `make` to build unpacked, or `make dist` to build release packages.

## Dependencies

In order to build successfully, the following are necessary:

 * A standard POSIX-compatible shell
 * Any recent version of GNU make
 * Any recent version of yarn
 * An internet connection, to download package dependencies from npmjs
 * git (dist only)
 * zip (dist only)
 * gpg (dist only)
 * Google Chrome or other Chromium-based browser (crx-* and dist only)

## Build Targets

Depending on the desired output, we have several build targets available.

## all (default)

Builds the extension unpacked, for both Chromium and Firefox browsers. The output from this build will be placed in the `chromium` and `firefox` directories respectively.

## chromium

Builds the extension unpacked, for Chromium browsers. The output is placed in the `chromium` directory.

## firefox

Builds the extension unpacked, for Firefox browsers. The output is placed in the `firefox` directory.

## crx-github

Builds the extension packed, signed for GitHub distribution. Requires the private signing key to be present as `github.pem`. The build output is provided as `browserpass-otp-github.crx`.

## crx-webstore

Builds the extension packed, signed using the same key as the Chrome webstore. Requires the private signing key to be present as `webstore.pem`. The build output is provided as `browserpass-otp-webstore.crx`.

## dist

Builds the extension packed for distribution via Mozilla Addons store, Chrome webstore, and GitHub. GitHub release packages are output to the `dist` directory, along with PGP detached signatures. Webstore release packages are output to the `dist-webstore` directory, along with the required source archive for AMO. Please note that both a working GPG setup and private keys for the CRX targets are required for this build target to complete successfully.
