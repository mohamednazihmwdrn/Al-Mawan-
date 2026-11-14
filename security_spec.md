# Security Specification: Al-Mawan Store Firestore Rules

## 1. Data Invariants
- Public catalog collections (`/banners`, `/categories`, `/subpages`, `/paint_catalogs`, `/brands`, `/features`, `/products`, and `/products/{productId}/reviews`) plus `/settings/store` (`get` only) are readable by store visitors so customers receive real-time `onSnapshot` catalog updates without requiring login.
- **Zero-Trust Store Owner Exclusivity:** ONLY verified store admins (`isAdmin()`, bootstrapped via verified `mnazih298@gmail.com` with `request.auth.token.email_verified == true` or registered in `/admins/{uid}`) may `create`, `update`, or `delete` `/settings`, `/banners`, `/categories`, `/subpages`, `/paint_catalogs`, `/brands`, `/features`, or `/products`, and `update` or `delete` `/products/{productId}/reviews`.
- **Client UI Dual-Layer Lock:** Access to `AdminDashboard` requires both the secret owner entry modal + secret PIN and verified Firebase Auth owner sign-in (`mnazih298@gmail.com`).
- **PII Isolation:** `/orders` and `/inquiries` contain customer PII (`customerPhone`, `customerPhoneAlt`, `address`). Reading (`get`, `list`), updating, or deleting `/orders` and `/inquiries` is strictly restricted to `isAdmin()`.
- Public visitors may only `create` new `/orders` (enforced `status == 'pending'`), new `/inquiries` (enforced `status == 'new'`), and new `/products/{productId}/reviews` (linked to an existing `/products/{productId}` via `exists()`, `verifiedPurchase == false`, rating `1..5`), with strict key allowlists (`hasAll` + `hasOnly`), document ID consistency (`data.id == docId`), and string/array length limits.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated or non-owner product creation (`CREATE /products/{id}`) -> `PERMISSION_DENIED`
2. Unauthenticated or non-owner product price/field tampering (`UPDATE /products/{id}`) -> `PERMISSION_DENIED`
3. Unauthenticated or non-owner deletion of products/categories/subpages/banners/brands/features/paint_catalogs -> `PERMISSION_DENIED`
4. Unauthenticated order listing or lookup (`GET/LIST /orders`) attempting to scrape customer phone numbers -> `PERMISSION_DENIED`
5. Unauthenticated inquiry listing or lookup (`GET/LIST /inquiries`) attempting to scrape customer messages/phones -> `PERMISSION_DENIED`
6. Shadow field injection on order or inquiry creation (e.g., `status: 'delivered'`, `isPaid: true`, or extra keys) -> `PERMISSION_DENIED`
7. Maliciously long string injection (>maxLength) in product, review, or inquiry fields -> `PERMISSION_DENIED`
8. Invalid rating value (`rating: 99`, `-5`, or string) or spoofed `verifiedPurchase: true` in review creation -> `PERMISSION_DENIED`
9. Orphaned subpage creation referencing a non-existent category ID or orphaned review on non-existent product -> `PERMISSION_DENIED`
10. Document ID poisoning (1500-char ID, invalid characters, or `data.id != docId`) -> `PERMISSION_DENIED`
11. Email spoofing attack (`email == 'mnazih298@gmail.com'` with `email_verified == false`) -> `PERMISSION_DENIED`
12. Privilege escalation attempt (`CREATE/UPDATE/DELETE /admins/{uid}` by any client) -> `PERMISSION_DENIED`
