# Security Requirements

Before production:
- Replace in-memory authentication and sessions with secure OTP/OIDC-compatible authentication.
- Require MFA for privileged roles.
- Enforce resource ownership and role permissions on every protected route.
- Validate and sanitize uploads.
- Configure malware scanning and object-storage allowlists.
- Restrict CORS to explicit origins.
- Verify payment webhooks and enforce idempotency.
- Encrypt secrets through a secrets manager.
- Add rate limiting, audit logs and account-protection controls.
- Complete qualified Indian legal, privacy and financial review.
