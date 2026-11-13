# Security Specification: Al-Mawan Store Firestore Rules

## 1. Data Invariants
- Public catalog collections (`/settings`, `/banners`, `/categories`, `/products`, and `/products/{productId}/reviews`) are readable by all store visitors so customers across Egypt can browse and receive instant `onSnapshot` updates without mandatory login.
- Only verified store admins (`isAdmin()`, bootstrapped via `mnazih298@gmail.com` with `email_verified == true` or registered in `/admins/{uid}`) may create, update, or delete `/settings`, `/banners`, `/categories`, or `/products`, and delete `/reviews`, `/orders`, or `/inquiries`.
- Customers may submit new `/orders` (with initial `status == 'pending'`), new `/inquiries` (with initial `status == 'new'`), and new `/products/{productId}/reviews` (with `rating` between 1 and 5, linked to an existing parent `/products/{productId}` via `exists()`), provided the incoming payload passes strict key, type, and length validation.
- Orders and Inquiries contain customer PII (`customerPhone`, `address`). Reading (`get`, `list`), updating, or deleting `/orders` and `/inquiries` is strictly restricted to `isAdmin()`.
- Public visitors may not perform shadow updates or tamper with product prices, stock, or order statuses, except when a customer submits a valid review and atomically updates `ratingAvg` and `ratingCount` via `getAfter()` verification, OR Wait — even safer: `ratingAvg` and `ratingCount` can be updated only by admin or via a strict review-linked `affectedKeys().hasOnly(['ratingAvg', 'ratingCount'])` or computed cleanly on the product detail view from the `/reviews` subcollection so public users NEVER write to `/products/{productId}`! Computing/aggregating reviews in the subcollection or allowing admin to update product docs keeps `/products` 100% locked against unauthenticated writes! Let's check: keeping `/products` writes 100% `isAdmin()`-only means a malicious user can NEVER alter a product's `ratingAvg` directly without a review, AND if we also allow `reviews` subcollection reads publicly, product detail modals load all reviews in real time via `onSnapshot`! Even better, in `ProductCard`, we can show default or cached rating or live review counts!

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated product creation (`POST /products`) -> `PERMISSION_DENIED`
2. Unauthenticated product price tampering (`UPDATE /products/{id}` price: 0.01) -> `PERMISSION_DENIED`
3. Unauthenticated order listing (`LIST /orders`) attempting to scrape customer phone numbers -> `PERMISSION_DENIED`
4. Unauthenticated inquiry listing (`LIST /inquiries`) attempting to scrape customer messages/phones -> `PERMISSION_DENIED`
5. Shadow field injection on order creation (e.g., `isPaid: true` or `status: 'delivered'`) -> `PERMISSION_DENIED`
6. Shadow field injection on inquiry creation (e.g., `status: 'resolved'` or `extraField: 'x'`) -> `PERMISSION_DENIED`
7. Maliciously long string injection (>100KB) in review `comment` or inquiry `message` -> `PERMISSION_DENIED`
8. Invalid rating value in review (`rating: 99` or `rating: -5` or `rating: "five"`) -> `PERMISSION_DENIED`
9. Orphaned review creation on non-existent product (`productId: 'nonexistent'`) -> `PERMISSION_DENIED`
10. Document ID poisoning (1500-char ID or invalid characters like `../`) -> `PERMISSION_DENIED`
11. Email spoofing attack (unverified email matching admin email) -> `PERMISSION_DENIED`
12. Privilege escalation attempt (`CREATE /admins/{uid}` by non-admin) -> `PERMISSION_DENIED`
