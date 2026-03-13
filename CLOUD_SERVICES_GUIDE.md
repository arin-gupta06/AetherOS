# Cloud Services Node Model Guide

## Overview

The Cloud Services Node Model extension enables AetherOS to support multi-cloud architecture design and deployment configuration. Nodes can now be configured to target specific cloud providers (Azure, AWS, GCP) or run locally, with provider-specific resource allocation, scaling, and region selection.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Cloud Provider Configuration](#cloud-provider-configuration)
3. [Node Cloud Properties](#node-cloud-properties)
4. [Provider-Specific Options](#provider-specific-options)
5. [Auto-Scaling Configuration](#auto-scaling-configuration)
6. [Export & Deployment](#export--deployment)
7. [Best Practices](#best-practices)
8. [Cost Considerations](#cost-considerations)

---

## Quick Start

### Configuring a Node for Cloud Deployment

1. **Select a Node** in the canvas
2. **Click the "Cloud" tab** in the right panel
3. **Choose a Cloud Provider:**
   - **Local** - Development/local deployment
   - **Azure** - Microsoft Cloud platform
   - **AWS** - Amazon Web Services
   - **GCP** - Google Cloud Platform
4. **Configure Region & Instance Type** - Options update based on selected provider
5. **Set Tier/SKU** - Service tier (Free, Standard, Premium, etc.)
6. **Configure Replicas** - Number of instances (1-100)
7. **Enable Auto-Scaling** - Toggle for automatic scaling behavior
8. **Set Max Replicas** (if auto-scaling enabled) - Maximum instances during peak load

### Example: Azure Backend Service

```
Cloud Provider: Azure
Region: eastus
Instance Type: Standard B1
Tier: Standard
Replicas: 2
Auto-Scale: Enabled
Max Replicas: 10
```

---

## Cloud Provider Configuration

### Azure

**Available Regions:**
- `eastus` - US East (Virginia)
- `westus` - US West (California)
- `uksouth` - UK South
- `northeurope` - North Europe
- `westeurope` - West Europe
- `australiaeast` - Australia East
- `southindia` - South India
- `japaneast` - Japan East

**Available Instance Types:**
- `Standard_B0s` - Burstable, 0.5 vCPU, 1 GB RAM (Free tier eligible)
- `Standard_B1s` - Burstable, 1 vCPU, 1 GB RAM
- `Standard_B1ms` - Burstable, 1 vCPU, 2 GB RAM
- `Standard_B2s` - Burstable, 2 vCPU, 4 GB RAM
- `Standard_B2ms` - Burstable, 2 vCPU, 8 GB RAM
- `Standard_D2s_v3` - Compute optimized, 2 vCPU, 8 GB RAM
- `Standard_D4s_v3` - Compute optimized, 4 vCPU, 16 GB RAM

**Common Azure Tiers:**
- `Free` - Shared resources, limited performance
- `Standard` - Production-grade performance
- `Premium` - High-performance SLA

---

### AWS

**Available Regions:**
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - EU (Ireland)
- `eu-central-1` - EU (Frankfurt)
- `ap-southeast-1` - Asia Pacific (Singapore)
- `ap-northeast-1` - Asia Pacific (Tokyo)
- `ca-central-1` - Canada (Central)
- `sa-east-1` - South America (São Paulo)

**Available Instance Types:**
- `t3.micro` - Burstable, 0.5-1 vCPU, 1 GB RAM (Free tier eligible)
- `t3.small` - Burstable, up to 2 vCPU, 2 GB RAM
- `t3.medium` - Burstable, up to 2 vCPU, 4 GB RAM
- `t3.large` - Burstable, up to 2 vCPU, 8 GB RAM
- `m5.large` - General purpose, 2 vCPU, 8 GB RAM
- `m5.xlarge` - General purpose, 4 vCPU, 16 GB RAM
- `c5.large` - Compute optimized, 2 vCPU, 4 GB RAM
- `c5.2xlarge` - Compute optimized, 8 vCPU, 16 GB RAM

**Common AWS Tiers:**
- `Free` - AWS Free Tier eligible
- `Standard` - Standard EC2 pricing
- `Reserved` - Reserved instance discount (1-3 year commitment)

---

### GCP

**Available Regions:**
- `us-central1` - US Central (Iowa)
- `us-east1` - US East (South Carolina)
- `us-west1` - US West (Oregon)
- `europe-west1` - Europe (Belgium)
- `europe-west4` - Europe (Netherlands)
- `asia-east1` - Asia (Taiwan)
- `asia-northeast1` - Asia (Tokyo)
- `australia-southeast1` - Australia (Sydney)

**Available Instance Types:**
- `e2-micro` - Shared cores, 0.25-0.5 vCPU, 1 GB RAM (Free tier eligible)
- `e2-small` - Shared cores, 0.5-1 vCPU, 2 GB RAM
- `e2-medium` - Shared cores, 1-2 vCPU, 4 GB RAM
- `n1-standard-1` - General purpose, 1 vCPU, 3.75 GB RAM
- `n1-standard-2` - General purpose, 2 vCPU, 7.5 GB RAM
- `n1-standard-4` - General purpose, 4 vCPU, 15 GB RAM
- `n1-highmem-2` - Memory optimized, 2 vCPU, 13 GB RAM
- `n1-highcpu-4` - CPU optimized, 4 vCPU, 3.6 GB RAM

**Common GCP Tiers:**
- `Free` - GCP Free Tier eligible
- `Committed` - 1-year or 3-year commitments
- `Standard` - Pay-as-you-go pricing

---

### Local

**Purpose:** Development, testing, or on-premises deployment

**Configuration:**
- No region selection needed
- No specific instance type required
- Useful for localhost testing before cloud deployment
- Maintains same interface for consistency

---

## Node Cloud Properties

### Data Structure

Each node stores cloud configuration in the following structure:

```javascript
{
  id: "node-123",
  data: {
    label: "API Backend",
    type: "backend",
    cloudProvider: "Azure",      // Current cloud provider
    cloudConfiguration: {
      region: "eastus",          // Provider-specific region
      instanceType: "Standard_B2s",  // Provider-specific size
      tier: "Standard",           // Service tier/SKU
      replicas: 2,                // Current instance count
      autoScale: true,            // Enable auto-scaling
      maxReplicas: 10,            // Maximum under auto-scale
      customProps: {              // Custom metadata
        environment: "production",
        team: "backend-team"
      }
    }
  }
}
```

### Accessing Cloud Properties in Code

**In Frontend Components:**
```javascript
const { cloudProvider, cloudConfiguration } = nodeData;

console.log(`Running on ${cloudProvider}`);
console.log(`Region: ${cloudConfiguration.region}`);
console.log(`Instance: ${cloudConfiguration.instanceType}`);
```

**In Backend Services:**
```javascript
// From exported architecture JSON
const nodes = exportData.architecture.layers;

nodes.forEach(node => {
  console.log(`${node.label} on ${node.cloudProvider}`);
  if (node.configuration?.region) {
    console.log(`  Region: ${node.configuration.region}`);
  }
});
```

---

## Provider-Specific Options

### Azure Workflow

1. Select **Azure** from Cloud Provider dropdown
2. Choose region from **Azure-specific regions**:
   - Recommended: `eastus` or `westus` for US
   - Recommended: `northeurope` or `westeurope` for Europe
3. Select instance type:
   - Budget: `Standard_B0s` - `Standard_B1ms` (free/low cost)
   - Standard: `Standard_B2s` - `Standard_B2ms` (balanced performance)
   - High Performance: `Standard_D2s_v3` or higher (compute intensive)
4. Choose tier: **Free** (limited), **Standard** (production), **Premium** (SLA)

### AWS Workflow

1. Select **AWS** from Cloud Provider dropdown
2. Choose region from **AWS-specific regions**:
   - Recommended: `us-east-1` (most services, lowest cost)
   - Recommended: `eu-west-1` for Europe
3. Select instance type:
   - Budget: `t3.micro` - `t3.small` (free tier, burstable)
   - Standard: `t3.medium` - `m5.large` (balanced)
   - High Performance: `c5.large` or higher (compute optimized)
4. Choose tier: **Free** (eligible), **Standard**, **Reserved** (cost savings)

### GCP Workflow

1. Select **GCP** from Cloud Provider dropdown
2. Choose region from **GCP-specific regions**:
   - Recommended: `us-central1` (supported everywhere)
   - Recommended: `europe-west1` for Europe
3. Select instance type:
   - Budget: `e2-micro` - `e2-small` (free tier, shared cores)
   - Standard: `n1-standard-1` - `n1-standard-2` (general purpose)
   - Memory Heavy: `n1-highmem-*` machines
   - CPU Heavy: `n1-highcpu-*` machines
4. Choose tier: **Free**, **Committed** (1-3 year), **Standard**

---

## Auto-Scaling Configuration

### What is Auto-Scaling?

Auto-scaling automatically adjusts the number of running instances based on demand:
- **Increases replicas** during high traffic/load
- **Decreases replicas** during low traffic to save costs
- **Min Replicas** (fixed) - Always running
- **Max Replicas** - Cannot exceed this during peak load

### Configuration Steps

1. **Enable Auto-Scaling** - Toggle the "Auto-Scale" switch
2. **Set Min Replicas** - Number from the "Replicas" field (always running)
3. **Set Max Replicas** - Maximum instances (appears when auto-scale enabled)

### Example Configuration

**Light Traffic Service:**
```
Replicas: 1        (min)
Max Replicas: 3    (max during peak)
```

**Heavy Traffic Service:**
```
Replicas: 3        (always running)
Max Replicas: 15   (max during peak)
```

**Scalable Database:**
```
Replicas: 2        (min)
Max Replicas: 10   (max during peak)
```

### Cost Impact

- **Without Auto-Scaling:** Fixed cost = instances × instance cost
- **With Auto-Scaling:** Variable cost = avg instances × instance cost
- **Recommendation:** Enable for unpredictable/variable workloads

---

## Export & Deployment

### Including Cloud Configuration in Exports

When you export an architecture, cloud configuration is automatically included:

```json
{
  "status": "success",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "totalComponents": 5,
    "layers": {
      "frontend": 1,
      "backend": 1,
      "ai": 1,
      "infrastructure": 1,
      "data": 1
    }
  },
  "architecture": {
    "summary": {
      "client": [
        {
          "name": "React Dashboard",
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
          "name": "Cosmos DB",
          "cloudProvider": "Azure",
          "region": "eastus",
          "instanceType": "Standard_S2",
          "tier": "Standard"
        }
      ]
    },
    "layers": { ... },
    "connections": { ... }
  },
  "diagram": "ASCII diagram with cloud info..."
}
```

### Deployment Workflow

1. **Design architecture** using cloud-aware nodes
2. **Configure cloud properties** for each component
3. **Export architecture** to JSON
4. **Review exported configuration** - Verify cloud settings
5. **Validate cloud quotas** - Ensure providers have capacity
6. **Deploy using exported config** - Use in IaC tools (Terraform, CloudFormation)

### Integration with Infrastructure-as-Code

**Example Terraform from exported architecture:**
```hcl
# From AetherOS export
resource "azurerm_app_service" "api_backend" {
  name              = "api-server"
  location          = "East US"           # from export
  service_plan_id   = azurerm_service_plan.standard.id
  
  # Instance type info
  app_settings = {
    SKU = "Standard_B2s"  # from export
  }
  
  # Scaling config
  autoscale_settings = {
    min_capacity = 2      # from replicas
    max_capacity = 10     # from maxReplicas
  }
}
```

---

## Best Practices

### Multi-Cloud Architecture

**Avoid Cross-Cloud Dependencies**
```
❌ BAD:  Frontend (Azure) → Backend (AWS) → Database (GCP)
✅ GOOD: Frontend (Azure) → Backend (Azure) → Database (Azure)
```

**Reasons:**
- Reduced latency within same cloud
- Simplified compliance/data residency
- Higher transfer costs between clouds
- Vendor lock-in is minimal

### High-Availability Configuration

**For Critical Services:**
```
Replicas: 3 (min)
Max Replicas: 12 (peak)
Regions: Primary + Secondary (disaster recovery)
```

**For Standard Services:**
```
Replicas: 2 (min)
Max Replicas: 6 (peak)
Single Region: Primary
```

**For Development:**
```
Replicas: 1 (min)
Max Replicas: 2 (peak)
Region: Single dev region
```

### Cost Optimization

**Regional Considerations:**
- **US regions**: Lowest cost, most services
- **EU regions**: Mid-range cost, GDPR compliant
- **APAC regions**: Higher cost, low latency for Asia

**Instance Type Selection:**
```
✅ Burstable (t3/e2/B series) - Development, light web traffic
✅ General (m5/n1-standard) - Most applications
✅ Compute (c5/n1-highcpu) - CPU-intensive, batch jobs
✅ Memory (n1-highmem) - In-memory databases, caching
```

**Auto-Scaling Strategy:**
```
Variable workload ➜ Enable auto-scaling
Fixed workload ➜ Disable, set fixed replicas
Predictable spikes ➜ Pre-scale before events
```

### Security Best Practices

1. **Enable network isolation** - Use private endpoints
2. **Restrict regions** - Keep data in compliance zones
3. **Document tier selection** - Premium = SLA, Standard = shared
4. **Auto-scaling limits** - Prevent DDoS via max replicas
5. **Custom properties** - Store encryption, compliance settings

---

## Cost Considerations

### Per-Provider Pricing Guide

#### Azure Estimates (Monthly)
```
Standard_B0s (1x) + eastus:     $5
Standard_B1s (2x) + eastus:     $17
Standard_B2s (3x) + eastus:     $80
Standard_D2s_v3 (1x) + eastus:  $140
```

#### AWS Estimates (Monthly)
```
t3.micro (1x) + us-east-1:      $8 (free tier)
t3.small (2x) + us-east-1:      $22
m5.large (3x) + us-east-1:      $140
c5.large (2x) + us-east-1:      $140
```

#### GCP Estimates (Monthly)
```
e2-micro (1x) + us-central1:    $7 (free tier)
e2-small (2x) + us-central1:    $20
n1-standard-1 (3x) + us-central1: $100
n1-standard-2 (2x) + us-central1: $150
```

### Cost Optimization Formula

```
Monthly Cost = (Base Instance Cost × Min Replicas) 
             + (Average Peak Cost × (Max Replicas - Min Replicas) × Peak Usage %)
```

**Example:**
```
Standard_B2s = $26/month each
Min replicas = 2
Max replicas = 6
Peak usage = 20% of time (5 days/month avg)

Cost = (26 × 2) + (26 × 4 × 0.20)
     = $52 + $20.80
     = $72.80/month
```

---

## Troubleshooting

### Cloud Provider Not Showing

**Issue:** Cloud Provider dropdown empty or greyed out
**Solution:** 
- Refresh the browser
- Check RightPanel "Cloud" tab is selected
- Verify node is properly selected in canvas

### Region/Instance Type Not Available

**Issue:** Expected region/instance missing for cloud provider
**Solution:**
- Region/instance lists are hardcoded for each provider
- Contact development if specific region needed
- Can manually add custom instance type via customProps

### Auto-Scale Not Working

**Issue:** Max Replicas field not appearing after enabling auto-scale
**Solution:**
- Click "Auto-Scale" toggle again
- Refresh the component
- Verify toggle shows as "Enabled"

### Cloud Config Not Exporting

**Issue:** Cloud information missing from exported JSON
**Solution:**
- Verify cloud provider is set (not empty)
- Check node is in canvas
- Perform fresh export
- Inspect exported JSON for "cloudProvider" field

---

## Further Reading

- See [AZURE_INFRASTRUCTURE_GUIDE.md](./AZURE_INFRASTRUCTURE_GUIDE.md) for Azure-specific services
- See [ARCHITECTURE_EXPORT_GUIDE.md](./ARCHITECTURE_EXPORT_GUIDE.md) for export functionality
- See [AI_ARCHITECTURE_ADVISOR_GUIDE.md](./AI_ARCHITECTURE_ADVISOR_GUIDE.md) for architecture analysis

---

## Support

For issues or feature requests related to cloud services:
1. Check this guide's troubleshooting section
2. Review exported JSON structure for debugging
3. Verify cloud provider/region combinations are valid
4. Post issues with exported architecture JSON for debugging
