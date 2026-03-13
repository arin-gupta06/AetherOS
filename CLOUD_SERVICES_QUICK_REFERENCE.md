# Cloud Services Node Model - Quick Reference

## Cloud Services at a Glance

**What:** Extend architecture nodes with multi-cloud provider support  
**Where:** Right Panel → Cloud Tab  
**When:** Configure cloud deployment for any node  
**Why:** Enable cloud-agnostic architecture design and export

---

## Quick Configuration

### Step 1: Select Cloud Provider
```
Options: Local | Azure | AWS | GCP
Default: Local
```

### Step 2: Choose Region (Provider-Specific)
**Azure:**
```
eastus | westus | uksouth | northeurope | 
westeurope | australiaeast | southindia | japaneast
```

**AWS:**
```
us-east-1 | us-west-2 | eu-west-1 | eu-central-1 | 
ap-southeast-1 | ap-northeast-1 | ca-central-1 | sa-east-1
```

**GCP:**
```
us-central1 | us-east1 | us-west1 | europe-west1 | 
europe-west4 | asia-east1 | asia-northeast1 | australia-southeast1
```

### Step 3: Select Instance Type (Provider-Specific)
**Azure:**
```
Standard_B0s | Standard_B1s | Standard_B1ms | Standard_B2s | 
Standard_B2ms | Standard_D2s_v3 | Standard_D4s_v3
```

**AWS:**
```
t3.micro | t3.small | t3.medium | t3.large | 
m5.large | m5.xlarge | c5.large | c5.2xlarge
```

**GCP:**
```
e2-micro | e2-small | e2-medium | n1-standard-1 | 
n1-standard-2 | n1-standard-4 | n1-highmem-2 | n1-highcpu-4
```

### Step 4: Set Tier/SKU
```
Common: Free | Standard | Premium
```

### Step 5: Configure Replication
```
Replicas: 1-100 (currently running instances)
```

### Step 6: Enable Auto-Scaling
```
Toggle: Yes | No
If Yes → Max Replicas field appears
```

### Step 7: Set Max Replicas (if auto-scaling)
```
Must be ≥ Min Replicas
Typical: 2x to 5x min replicas
```

---

## Data Structure

```javascript
node.data = {
  label: "API Backend",
  type: "backend",
  cloudProvider: "Azure",         // Set in cloud tab
  cloudConfiguration: {
    region: "eastus",             // Set in cloud tab
    instanceType: "Standard_B2s",  // Set in cloud tab
    tier: "Standard",              // Set in cloud tab
    replicas: 2,                   // Set in cloud tab
    autoScale: true,               // Set in cloud tab
    maxReplicas: 10,               // Set in cloud tab
    customProps: {}                // (Reserved for future use)
  }
}
```

---

## Common Configurations by Use Case

### Lightweight Web Frontend
```
Cloud Provider: Azure
Region: eastus
Instance Type: Standard_B1s
Tier: Standard
Replicas: 1
Auto-Scale: Yes
Max Replicas: 3
```

### Standard API Backend
```
Cloud Provider: AWS
Region: us-east-1
Instance Type: t3.small
Tier: Standard
Replicas: 2
Auto-Scale: Yes
Max Replicas: 6
```

### High-Performance Database
```
Cloud Provider: Azure
Region: eastus
Instance Type: Standard_D4s_v3
Tier: Premium
Replicas: 3
Auto-Scale: No
Max Replicas: N/A
```

### Cost-Optimized Development
```
Cloud Provider: GCP
Region: us-central1
Instance Type: e2-micro
Tier: Free
Replicas: 1
Auto-Scale: No
Max Replicas: N/A
```

### AI/ML Service
```
Cloud Provider: Azure
Region: eastus
Instance Type: Standard_D2s_v3
Tier: Standard
Replicas: 1
Auto-Scale: Yes
Max Replicas: 8
```

---

## Export Format

### Cloud Info in Exports

When you export architecture, each node includes:

```json
{
  "client": [
    {
      "name": "React App",
      "cloudProvider": "Azure",
      "region": "eastus"
    }
  ],
  "backend": [
    {
      "name": "API Server",
      "cloudProvider": "Azure",
      "region": "eastus",
      "instanceType": "Standard_B2s"
    }
  ],
  "data": [
    {
      "name": "Database",
      "cloudProvider": "Azure",
      "region": "eastus",
      "instanceType": "Standard_B2s",
      "tier": "Standard"
    }
  ]
}
```

### ASCII Diagram with Cloud Info

```
=== ARCHITECTURE DIAGRAM ===

┌─ FRONTEND LAYER ─┐
│ • React App [Azure - eastus]
└────────────────────┘

┌─ BACKEND LAYER ─┐
│ • API Server [Azure - eastus / Standard_B2s]
└────────────────┘

┌─ DATA LAYER ─┐
│ • Database [Azure / eastus / Standard_B2s / Standard]
└────────────────┘
```

---

## Regional Guidance

| Region Type | Best For | Cost Level |
|-------------|----------|-----------|
| us-east-1/eastus/us-central1 | Default, most services | Low |
| us-west/westus/us-west1 | US West coast | Low |
| eu-west-1/northeurope | Europe, GDPR | Medium |
| APAC (Asia-Pacific) | Asia region | High |
| Free tier regions | Development, testing | Lowest |

---

## Instance Type Guidance

| Category | Best For | Example |
|----------|----------|---------|
| Burstable (t3/e2/B) | Light web, dev, burst traffic | Standard_B1s |
| General (m5/n1-std) | Most applications | m5.large |
| Compute (c5/n1-cpu) | CPU-heavy, batch jobs | c5.large |
| Memory (n1-mem) | Databases, caching, analytics | n1-highmem-2 |

---

## Cost Estimates (Monthly)

### Budget Options
```
Azure Standard_B0s (1x) eastus:     $5
AWS t3.micro (1x) us-east-1:        $8
GCP e2-micro (1x) us-central1:      $7
```

### Standard Options
```
Azure Standard_B2s (2x) eastus:     $52
AWS t3.small (2x) us-east-1:        $22
GCP n1-standard-1 (2x) us-central1: $67
```

### High-Performance
```
Azure Standard_D2s_v3 (2x) eastus:  $280
AWS m5.large (2x) us-east-1:        $140
GCP n1-standard-2 (2x) us-central1: $150
```

---

## Auto-Scaling Tips

### Enable When
- ✅ Variable traffic patterns
- ✅ Unpredictable load
- ✅ Cost-sensitive (spike handling)
- ✅ Services behind load balancer

### Disable When
- ❌ Fixed, predictable load
- ❌ Stateful services (database)
- ❌ Expensive scale up/down (cold start)
- ❌ Minimal load variation

### Auto-Scale Formula
```
Min Cost = Base Instance Cost × Min Replicas

Peak Cost = Base Instance Cost × Max Replicas

Avg Cost = Min Cost + ((Peak Cost - Min Cost) × Peak Usage %)
```

---

## Validation Checklist

Before exporting your architecture:

- [ ] Each node has a cloud provider set
- [ ] Cloud provider + region combination valid
- [ ] Instance types available in selected region
- [ ] Tier/SKU supported for instance type
- [ ] Min replicas ≤ Max replicas (for auto-scale)
- [ ] Critical services have auto-scale enabled
- [ ] All regions are reasonable for deployment
- [ ] No mixed-cloud cross-layer dependencies

---

## Exporting with Cloud Config

1. **Design & Configure**
   - Set cloud provider for each node
   - Configure regions and instance types
   - Set replication strategy

2. **Export Architecture**
   - Click "Export" panel
   - View generated JSON with cloud config
   - Download or copy to clipboard

3. **Deploy**
   - Use exported JSON for IaC templates
   - Reference cloud provider/region in deployment
   - Verify instance types available
   - Deploy using Terraform, CloudFormation, etc.

---

## Provider Hints

**Choosing Between Providers:**

| Criterion | Azure | AWS | GCP |
|-----------|-------|-----|-----|
| Services | Most complete | Widest variety | Growing rapidly |
| Cost | Mid-range | Most competitive | Competitive long-term |
| UI/DX | Excellent | Somewhat complex | Very good |
| Learning Curve | Easy | Moderate | Easy |
| Compliance | Strong | Strongest | Growing |

**Recommendation for Hackathon:**
```
Start with: One cloud provider (Azure/AWS/GCP)
Avoid: Multi-cloud complexity
Focus on: Single region, consistent instance types
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Provider dropdown empty | Refresh browser, check RightPanel |
| Region not in list | Not available for provider, use different region |
| Instance type grayed out | Not available in selected region, try different instance |
| Auto-scale toggle stuck | Refresh component, try toggling again |
| Cloud info missing from export | Verify cloudProvider is set (not empty) |

---

## Next Steps

1. **Design** your architecture with cloud-aware nodes
2. **Configure** cloud properties for each component
3. **Export** to JSON to see full cloud configuration
4. **Review** exported JSON for deployment readiness
5. **Deploy** using IaC tools (Terraform, CloudFormation, GCP Deployment Manager)

See **CLOUD_SERVICES_GUIDE.md** for detailed documentation.
