# Release setup

NetFrame is authored by Cybear Technologies; Jackson Chandler is the developer.
The source repository is https://github.com/JacksonChandler/NetFrame.

## Maintainer setup (required before enabling automation)

1. Create your npm account and confirm ownership/availability of the **package name** `netframe` on the existing npm registry. You do not need to create a registry server.
2. Bootstrap the first publication manually if npm requires an existing package to configure trusted publishing. Review the packed files and run `pnpm run check` first. No first publication has been performed by the coding agent.
3. In GitHub, protect `main` and require CI's **Build & verify** check. Run CI once so GitHub can discover the check. Enable the repository setting allowing GitHub Actions to create pull requests for Changesets version PRs.
4. Create a GitHub environment named **release**. Restrict it to `main`, require reviewer approval, and prevent self-review where supported. Environment protections require GitHub configuration; a YAML reference does not create those protections. The current combined release job requires approval for version PR creation as well as publishing.
5. In the npm package settings, configure a GitHub Actions trusted publisher:
   - Organization/user: `JacksonChandler`
   - Repository: `NetFrame`
   - Workflow filename: `release.yml`
   - Environment: `release`
   - Allow direct `npm publish` if npm presents that permission.
6. Set the GitHub repository Actions variable **NPM_RELEASE_ENABLED** to `true` only after steps 1–5. Until then, the release job is skipped. No npm token is required by the workflow; remove obsolete publishing secrets only after validating OIDC.

## Workflow

`.github/workflows/release.yml` runs on pushes to `main`. It uses SHA-pinned actions and npm 11.21.1 (OIDC requires npm >=11.5.1). Changesets action v2 creates version PRs or runs `pnpm release`. pnpm 9 delegates the package upload to the installed npm CLI. `id-token: write` enables OIDC; `NPM_CONFIG_PROVENANCE=true` requests provenance. No token authentication fallback is configured.

The release job runs lint, typecheck, library tests, docs build, Chromium tests and the dependency audit before invoking Changesets. `pnpm release` also runs typecheck and library tests before publishing. Non-cancelling concurrency serializes releases to avoid partial publication.

These changes are locally checked, not proven against GitHub or npm. Verify the first version PR, protected-environment approval, npm authentication, provenance and tags in the first real run. Do not enable automation before the setup above is complete.
