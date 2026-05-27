# Elev8 Group App Security Specification

This security design documents data invariants, the "Dirty Dozen" abusive configurations, and testing structures to verify our zero-trust security configuration.

## 1. Core Data Invariants

1. **Identity & Authority Verification**: All transactional writes (file updates, status modifications) must be committed by non-anonymous, authenticated users.
2. **Immutability of History**: Core audit timestamps such as `createdAt` must be identical to `request.time` during creation, and cannot be changed during any update.
3. **No Self-Elevated Roles**: Profile configurations under `/users/{uid}` cannot have their `role` updated self-sufficiently by a common user to prevent privilege escalation.
4. **Isolated File Verification**: Uploaded file data (represented as base64 in `fileData`) cannot exceed limits and must remain tied strictly to valid document statuses.

---

## 2. The "Dirty Dozen" Abusive Payloads

Here are 12 destructive JSON payloads trying to force insecure state changes on our Firestore database:

### Payload 1: Privilege Escalation on Creation
* **Target Path**: `/users/attacker_uid`
* **Intent**: Force user profile to write an `ADMIN` role on registration despite having standard credentials.
```json
{
  "userId": "attacker_uid",
  "email": "malicious@attacker.net",
  "role": "ADMIN",
  "fullName": "Imposter Admin"
}
```

### Payload 2: Remote User Profile Hijack
* **Target Path**: `/users/victim_uid`
* **Intent**: Overwrite some other user's record with custom values using custom requests.
```json
{
  "userId": "victim_uid",
  "email": "hacked@company.com",
  "role": "GUEST_AUDITOR"
}
```

### Payload 3: Spoofed Document Ownership
* **Target Path**: `/company_documents/DOC-099`
* **Intent**: Upload a document setting `uploadedBy` to a senior compliance auditor who did not authorize compilation.
```json
{
  "id": "DOC-099",
  "documentType": "MNDA Agreement",
  "subsidiary": "HOLDINGS",
  "fileName": "forged_mnda.pdf",
  "status": "valid",
  "expiryDate": "2030-01-01",
  "uploadedBy": "senior.officer@elev8.com",
  "uploadedAt": "2026-05-27T08:00:00Z"
}
```

### Payload 4: Arbitrary Key Injection ("Ghost Fields")
* **Target Path**: `/company_documents/DOC-102`
* **Intent**: Bypassing validators by attaching a system properties override field `isBypassed: true`.
```json
{
  "id": "DOC-102",
  "documentType": "Tax Certificate",
  "subsidiary": "MEDIA",
  "fileName": "tax_form_2026.pdf",
  "status": "valid",
  "uploadedBy": "user@elev8.com",
  "uploadedAt": "2026-05-27T08:00:00Z",
  "isBypassed": true
}
```

### Payload 5: File Size Value Overload (Resource Exhaustion)
* **Target Path**: `/compliance_checks/CC-X1`
* **Intent**: Deny corporate wallet resources by submitting a 1GB simulated image string size.
```json
{
  "id": "CC-X1",
  "vendorId": "V-001",
  "vendorName": "Apex Media",
  "checkType": "SLA Assurance",
  "status": "passed",
  "updatedAt": "2026-05-27T08:00:00Z",
  "fileSize": "1000 GB",
  "fileData": "Maliciously bloated string payload..."
}
```

### Payload 6: Force Illegal State Jump (Terminal Status Bypass)
* **Target Path**: `/compliance_checks/CC-Y2`
* **Intent**: Re-enable or pass a compliance record that failed audits without changing remarks or fixing concerns.
```json
{
  "status": "passed",
  "remarks": "Overwritten without auditing check",
  "updatedAt": "2026-05-27T08:00:00Z"
}
```

### Payload 7: Anonymous Upload Submission
* **Target Path**: `/company_documents/DOC-F3`
* **Intent**: Injecting dynamic corporate filings without joining the authorized context (via Anonymous users).
```json
{
  "id": "DOC-F3",
  "documentType": "SEC Filings",
  "subsidiary": "TRADING",
  "fileName": "anonymous_corrupt.pdf",
  "status": "pending_verification",
  "uploadedBy": "anonymous",
  "uploadedAt": "2026-05-27T08:00:00Z"
}
```

### Payload 8: Immutable File Creation Spoofing
* **Target Path**: `/company_documents/DOC-A1`
* **Intent**: Attempting to backdate `uploadedAt` to bypass SLA deadline audits.
```json
{
  "id": "DOC-A1",
  "uploadedAt": "2024-01-01T00:00:00Z",
  "documentType": "Mayor's Permit"
}
```

### Payload 9: Orphan Record Injection (Forged Parent Relations)
* **Target Path**: `/compliance_checks/CC-M9`
* **Intent**: Uploading vendor-independent compliance checks mapped to non-existent or arbitrary vendor IDs.
```json
{
  "id": "CC-M9",
  "vendorId": "V-NULL-INVALID-99-88-77",
  "vendorName": "Mystery Non-Existent Vendor",
  "checkType": "Auditors License",
  "status": "passed",
  "updatedAt": "2026-05-27T08:00:00Z"
}
```

### Payload 10: Unauthorized Modification of PII
* **Target Path**: `/users/auditor_uid`
* **Intent**: Malicious representative modifying another auditor's name to frame them on subsequent operations.
```json
{
  "fullName": "Framed Representative",
  "role": "COMPLIANCE_OFFICER"
}
```

### Payload 11: System Log Sabotage
* **Target Path**: `/logs/audit_log_record`
* **Intent**: A rogue guest auditor attempting to purge compliance logs or delete a paper trail directly via the client SDK.
```json
Action: DELETE on /logs/audit_log_record
```

### Payload 12: Bypassing Verified Email Constraint
* **Target Path**: `/company_documents/DOC-Z1`
* **Intent**: Post documents using a newly created, unverified personal auth email address.
```json
{
  "id": "DOC-Z1",
  "status": "pending_verification",
  "uploadedBy": "fake.user@gmail.com",
  "uploadedAt": "2026-05-27T08:00:00Z"
}
```

---

## 3. Test Outline (`firestore.rules.test.ts`)

A clean file testing structure to implement:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Verification testing module structure for the Elev8 database
describe('Elev8 Zero-Trust Firestore Security Gate', () => {
  it('protects users against privilege escalation', async () => {
    // Assert that writes containing higher-tier parameters are rejected.
  });

  it('rejects unauthenticated document uploads', async () => {
    // Assert that null authorization blocks creation.
  });

  it('prohibits state alterations once terminals are hit', async () => {
    // Assert state locking.
  });
});
```
