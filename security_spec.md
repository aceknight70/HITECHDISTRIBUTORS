# Security Specification: HiTech Distributors Firestore Rules

## 1. Data Invariants
- **Repairs**:
  - Only authenticated users can submit a repair request.
  - The `status` field defaults to `Received` and can only be updated to allowed enum values.
  - The `submittedAt` and `updatedAt` timestamps must match the server time `request.time`.
  - Customers cannot update other customers' repairs or overwrite critical fields.
- **GM Requests**:
  - Must be authenticated.
  - The status defaults to `pending`.
- **Feedback**:
  - Must be authenticated.
  - Ratings must be an integer between 1 and 5.
- **PickupSchedules**:
  - Must be authenticated.
  - Date and timeslots must be valid strings with size constraints.
- **Orders**:
  - Invoice total must be a positive number.
  - Receipt upload field is only writable by owner/admin.
- **Settings**:
  - Only accessible (read/write) by authenticated administrators or managers.

---

## 2. The "Dirty Dozen" Malicious Payloads
The following payloads attempt to bypass Identity, Integrity, or State invariants. The security rules are designed to strictly reject these payloads.

### Payload 1: Identity Spoofing - Creating Repair with Arbitrary ID
An attacker tries to inject an excessively large or malformed document ID to trigger wallet exhaustion or SQL injection.
- **Path**: `/repairs/MALICIOUS_ID_THAT_IS_1MB_LONG_OR_CONTAINS_SPECIAL_CHARS`
- **Result**: `PERMISSION_DENIED` (Guarded by `isValidId()`)

### Payload 2: State Shortcutting - Direct Status Manipulation on Creation
An attacker tries to submit a repair request that is pre-marked as `Ready for Pickup` to avoid paying or bypassing diagnostics.
- **Path**: `/repairs/rep123`
- **Payload**: `{ "id": "REP-123", "type": "Laptop", "brand": "HP", "problem": "Broken screen", "name": "Attacker", "phone": "123", "status": "Ready for Pickup", "submittedAt": "2026-06-24T16:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Guarded by `status == 'Received'` constraint on creation)

### Payload 3: Temporal Spoofing - Client-Sent Creation Timestamps
An attacker submits a backdated or future-dated record to distort queues or SLAs.
- **Path**: `/repairs/rep123`
- **Payload**: `{ "id": "REP-123", "type": "Laptop", "brand": "HP", "problem": "Broken screen", "name": "Attacker", "phone": "123", "status": "Received", "submittedAt": "1999-01-01T00:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Guarded by `incoming().submittedAt == request.time`)

### Payload 4: Value Poisoning - Malformed Data Types
An attacker tries to pass an array or a massive map into a string field like `brand` or `name` to cause front-end crashes.
- **Path**: `/repairs/rep123`
- **Payload**: `{ "id": "REP-123", "type": "Laptop", "brand": ["malicious", "array"], "problem": "Broken screen", "name": "Attacker", "phone": "123", "status": "Received", "submittedAt": "2026-06-24T16:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Guarded by `isValidRepair()`)

### Payload 5: Unauthorized Global Read (Scraping)
An unauthenticated user attempts to scrape all invoice orders or customer phone numbers.
- **Path**: `/orders/` (List query)
- **Result**: `PERMISSION_DENIED` (Guarded by `isSignedIn()`)

### Payload 6: Shadow Field Injection
An attacker attempts to write unmapped fields (`isVerifiedAdmin: true`) to escalalate privileges or store junk data.
- **Path**: `/repairs/rep123`
- **Payload**: `{ "id": "REP-123", "type": "Laptop", "brand": "HP", "problem": "Broken screen", "name": "Attacker", "phone": "123", "status": "Received", "submittedAt": "2026-06-24T16:00:00Z", "isVerifiedAdmin": true }`
- **Result**: `PERMISSION_DENIED` (Guarded by strict keys constraint)

### Payload 7: State Transition Skipping on Update
A normal customer attempts to directly change their repair status from `Received` to `Returned` without manager diagnostics.
- **Path**: `/repairs/rep123`
- **Payload**: `{ "status": "Returned" }` (Patch)
- **Result**: `PERMISSION_DENIED` (Guarded by action-based update gates or `isAdmin()`)

### Payload 8: Feedback Rating Overflow
An attacker tries to submit feedback with a rating of `100` or `-5` stars.
- **Path**: `/feedback/feed123`
- **Payload**: `{ "id": "REV-123", "name": "Attacker", "rating": 100, "comment": "Too good", "timestamp": "2026-06-24T16:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Guarded by `incoming().rating >= 1 && incoming().rating <= 5`)

### Payload 9: Unauthorized Modification of Settings
An anonymous user tries to set the manager's status to `available` or alter bank routing details.
- **Path**: `/settings/general`
- **Payload**: `{ "managerStatus": "available" }`
- **Result**: `PERMISSION_DENIED` (Guarded by `isAdmin()` check for `/settings/`)

### Payload 10: Sibling Document Bypass (Atomicity Violation)
An attacker attempts to create a pickup schedule for items they do not own or without registering a valid transaction.
- **Path**: `/pickups/pkp123`
- **Payload**: `{ "id": "PKP-123", "name": "Attacker", "phone": "123", "items": "Free Solar Panel", "date": "2026-07-01", "timeSlot": "09:00 AM - 11:00 AM", "status": "scheduled", "timestamp": "2026-06-24T16:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Guarded by verification requirements)

### Payload 11: Denial of Wallet via Unbounded String Length
An attacker submits a comment that is 50MB long to exhaust database read-quota storage.
- **Path**: `/feedback/feed123`
- **Payload**: `{ "id": "REV-123", "name": "Attacker", "rating": 5, "comment": "A".repeat(5000000), "timestamp": "2026-06-24T16:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Guarded by `.size() <= 1000` check on the comment string)

### Payload 12: Order Invoice Self-Approval
An attacker attempts to mark their own pending order invoice as `paid: true` without going through Zenit Bank verification or staff validation.
- **Path**: `/orders/ord123`
- **Payload**: `{ "paid": true }` (Patch)
- **Result**: `PERMISSION_DENIED` (Guarded by strict update permissions restricting `paid` status modification to administrators)

---

## 3. Test Runner Concept (`firestore.rules.test.ts`)
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

describe("HiTech Distributors Firestore Security Rules", () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "gen-lang-client-0703315353",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("should deny unauthenticated users", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.collection("repairs").add({ brand: "HP" }));
  });

  it("should enforce validation logic on repair creation", async () => {
    const authedDb = testEnv.authenticatedContext("user123").firestore();
    const maliciousPayload = {
      id: "REP-123",
      type: "Laptop",
      brand: "HP",
      problem: "Broken screen",
      name: "Attacker",
      phone: "123",
      status: "Ready for Pickup", // Invalid initial status
      submittedAt: new Date().toISOString(),
    };
    await assertFails(authedDb.collection("repairs").doc("REP-123").set(maliciousPayload));
  });
});
```
