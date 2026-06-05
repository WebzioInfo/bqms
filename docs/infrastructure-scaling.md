# BQMS Infrastructure Scaling Sizing Guidelines

## Sizing Profiles

### 1. 100 Concurrent Users (Current Phase)
- **Web App (Vercel/Node.js):** 2 Instances (1 vCPU, 1GB RAM)
- **Database (AWS RDS):** db.t4g.small (2 vCPU, 2GB RAM)
- **Redis (ElastiCache):** cache.t4g.micro (1 Node)
- **Meilisearch:** 1 Instance (2 vCPU, 4GB RAM)
- **BullMQ Workers:** 1 Instance (1 vCPU, 1GB RAM)

### 2. 1,000 Concurrent Users (Mid-Scale Phase)
- **Web App:** 5+ Instances with Auto-Scaling (2 vCPU, 2GB RAM)
- **Database:** db.r6g.large (Multi-AZ) (2 vCPU, 16GB RAM) + 1 Read Replica for Search/Analytics
- **Redis:** cache.t4g.medium (2 Node Cluster)
- **Meilisearch:** 2 Instances behind Load Balancer (4 vCPU, 8GB RAM)
- **BullMQ Workers:** 3 Instances (2 vCPU, 2GB RAM)

### 3. 10,000 Concurrent Users (Enterprise Scale Phase)
- **Web App:** EKS Kubernetes Cluster (Auto-scaling Pods, min 20)
- **Database:** db.r6g.4xlarge (16 vCPU, 128GB RAM) + 3 Read Replicas (for separation of analytical/reporting queries from transactional writes).
- **Database Optimization:** Active table partitioning for `VerificationScan` and `AuditLog` by Month.
- **Redis:** cache.r6g.large (3 Node Cluster)
- **Meilisearch:** Managed Enterprise Tier or 5-node Custom Cluster
- **BullMQ Workers:** 10+ Pods autoscaling based on queue length metrics (KEDA integration).
