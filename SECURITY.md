# Security Vulnerabilities

## MJML Dependency Vulnerabilities

**Status:** Known, Unresolved (upstream)

**Description:**
As of July 12, 2025, the `mjml` package and its transitive dependencies (specifically `html-minifier` and `nth-check`) have reported high severity vulnerabilities. Attempts to resolve these using `npm audit fix` and `npm audit fix --force` have been unsuccessful, as the recommended fixes involve downgrading `mjml` to a version that would introduce breaking changes to the application.

**Impact:**
These vulnerabilities are present in the `mjml` library, which is used for compiling email templates. The direct impact on this application's runtime security is limited as `mjml` is primarily used during the build process. However, it is a best practice to address all known vulnerabilities.

**Mitigation:**
- The `mjml` package is used offline during the build process, reducing the immediate risk of remote exploitation.
- We will continue to monitor the `mjml` project for updates that address these vulnerabilities without requiring a significant downgrade or breaking changes.

**Resolution:**
Resolution is dependent on the `mjml` project releasing updated versions of their packages that resolve these transitive dependencies. We will periodically re-run `npm audit` to check for new fixes.
