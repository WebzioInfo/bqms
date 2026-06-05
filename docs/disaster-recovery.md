# BQMS Disaster Recovery & Backup Plan

## Recovery Time Objective (RTO) & Recovery Point Objective (RPO)
- **RTO (Target):** 30 minutes
- **RPO (Target):** 5 minutes

## Backup Strategies

### 1. PostgreSQL (AWS RDS)
- **Continuous Backups:** Enabled with Point-in-Time Recovery (PITR) up to 35 days.
- **Snapshot Frequency:** Automated daily snapshots at 02:00 UTC.
- **Cross-Region Replication:** Snapshots are copied daily to a secondary region (e.g., `us-west-2`) to mitigate full region failures.

### 2. Meilisearch
- **Snapshot Frequency:** Nightly task exports the Meilisearch database dump to AWS S3.
- **Rebuild Strategy:** In the event of total index corruption, the `SearchSyncQueue` (BullMQ) is triggered to rebuild the entire index from the primary PostgreSQL database.

### 3. Redis (ElastiCache)
- **Persistence:** Multi-AZ with auto-failover enabled.
- **Data Loss Risk:** Minimal. Redis is used purely for ephemeral queues (BullMQ) and rate limiting. Total loss requires a worker restart and temporary loss of rate limiting history.

## Disaster Recovery Procedures

### Scenario A: Database Corruption or Dropped Tables
1. Immediately halt all Application traffic to prevent writing corrupted data.
2. Provision a new RDS instance using the Point-in-Time Recovery (PITR) snapshot from immediately before the corruption occurred.
3. Update the `DATABASE_URL` secrets in the environment orchestration (Vercel/EKS).
4. Resume traffic. (Expected time: 15-20 minutes).

### Scenario B: Primary Region Outage (e.g., us-east-1 goes down)
1. Initiate failover of Route 53 DNS to the secondary region (`us-west-2`).
2. Restore the latest RDS cross-region snapshot.
3. Spin up the secondary EKS/Vercel cluster.
4. Scale up the secondary Meilisearch instance.
5. (Expected time: 30-45 minutes).
