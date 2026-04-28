# Security Specification

## Data Invariants
- A `Scan` must have a `userId` matching the authenticated user.
- A `Claim` must have a `userId` matching the authenticated user.
- `createdAt` must be set to the server timestamp on creation and must be immutable.
- `status` in a `Claim` must be 'pending' on creation and can only be changed by an admin (or specific transitions).

## The Dirty Dozen Payloads
1. **Identity Spoofing (Scan)**: Create scan with `userId` of another user.
2. **Identity Spoofing (Claim)**: Create claim with `userId` of another user.
3. **Ghost Fields (Scan)**: Add `isVerified: true` to a scan during creation.
4. **State Shortcutting (Claim)**: Create claim with `status: "verified"`.
5. **Resource Poisoning (Scan)**: Set `imageUrl` to a 1MB string of junk.
6. **Immutable Field Attack (Scan)**: Update `createdAt` after creation.
7. **Unauthorized List (Scan)**: Try to list all scans without `userId` filter.
8. **Unauthorized Read (Claim)**: Randomly fetch a claim ID belonging to someone else.
9. **Ownership Escalation**: Change `userId` on an existing claim.
10. **Terminal State Break**: Modify a claim after status is "verified".
11. **Metadata Injection**: Inject malicious tags into the `metadata` object of a scan.
12. **Unverified Account Write**: Write to claims from an unverified email account (if email verification is required).

## The Test Runner
A `firestore.rules.test.ts` would verify these are `PERMISSION_DENIED`.
