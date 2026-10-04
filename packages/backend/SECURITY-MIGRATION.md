# Authentication migration

Provision independent random secrets for `PROD_MYSTASH_JWT_SECRET` and `PROD_MYSTASH_OAUTH_STATE_SECRET` in SSM before deploying the stack. For local development set `MYSTASH_JWT_SECRET` and `MYSTASH_OAUTH_STATE_SECRET`. The new JWT key invalidates existing login tokens.

Password hashes use salted scrypt with N=131072, r=8, p=1. Hashing requires no application secret. Existing passwords are upgraded after successful password login, with a conditional database update to protect concurrent changes.

To migrate all existing password records, compile the backend with `pnpm --filter @mystash/backend exec tsc`, then run `node packages/backend/dist/scripts/migrate-passwords.js` with `USERS_TABLE_NAME`, AWS credentials/region, and `LEGACY_PASSWORD_SECRET` set to the original 32-byte AES key. Set `DYNAMODB_ENDPOINT` when using a local database. The script is resumable and skips hashes and OAuth users. It logs only the migrated count.

After migrating all passwords, remove the legacy secret from the Lambda environment and remove the imported legacy secret configuration from the stack. Until then, the production stack retains the original AES key only as `LEGACY_PASSWORD_SECRET`. Local development can temporarily set `MYSTASH_LEGACY_PASSWORD_SECRET`.

The users table stores token revocation records separately from users, without email or GitHub index keys. Its `expiresAt` TTL removes records after token expiration. Every authenticated request checks revocation using a consistent read and denies access if the lookup fails. Logout keeps the browser token if server revocation fails so the user can retry.
