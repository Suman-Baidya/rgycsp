## Chapter 11: System Audit Logs & Security Governance

### 11.1 Platform Audit Logging
In a nationwide educational network handling financial transactions, student personal data, and accredited certification, transparency and non-repudiation are essential. The **System Logs Module** (`/super-admin/logs`) records an immutable trail of administrative actions.

---

### 11.2 Monitored Administrative Events
Every critical operation is captured automatically with user identity, timestamp, and IP address:
- **Franchise Operations**: New center provisioning, status suspension, and document authority toggles.
- **Financial Events**: Wallet recharge approvals, manual token credits/debits, and merchant payment setting updates.
- **Academic Modifications**: Global course creation, syllabus edits, and baseline fee changes.
- **Certification Events**: Central certificate approvals and registration card verifications.
- **Security Incidents**: Repeated failed login attempts and unauthorized privilege escalation attempts.

---

### 11.3 Filtering & Exporting Audit Records
1. Go to **System Logs** (`/super-admin/logs`).
2. **Filter by Event Category**: Isolate *Authentication*, *Financial*, *Franchise*, or *Academic* actions.
3. **Filter by Administrator**: Audit actions performed by specific `SUPER_ADMIN_MANAGER` team members.
4. **Export Audit Trail**: Click **"Export CSV / Excel"** to generate timestamped reports for annual legal and academic compliance reviews.

---

### 11.4 Backup Protocols & Disaster Recovery
- **Database Backups**: The underlying Neon PostgreSQL database maintains point-in-time recovery with continuous write-ahead logging.
- **Media Asset Redundancy**: All uploaded student photographs, government IDs, and payment receipts are backed up in secure cloud storage.
- **Service Status**: Central platform uptime and API health can be monitored in real-time from the System Health monitor.
