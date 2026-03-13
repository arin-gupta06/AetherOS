# AI Architecture Advisor — Quick Reference Card

## 🚀 Quick Start (90 seconds)

### Step 1: Design (30s)
1. Click **Layers icon** (left sidebar)
2. Add components (Frontend, API, Database, etc.)
3. Connect with edges

### Step 2: Analyze (5s)
1. Click **Sparkles icon** ✨ (left sidebar)
2. Click **"Analyze Architecture"** button
3. Wait for AI analysis (2-5 seconds)

### Step 3: Review (55s)
1. Check **Architecture Summary**
2. Review **Detected Issues** ⚠️
3. Explore **Optimization Suggestions** 💡
4. See **Resilience Improvements** ✓

## 🎯 What It Analyzes

| Category | What It Checks |
|----------|----------------|
| **Scalability** | Bottlenecks, load distribution, caching |
| **Resilience** | Failure points, recovery strategies |
| **Design** | Service boundaries, coupling, patterns |
| **Optimization** | Performance, cost, resource efficiency |
| **Reliability** | Single points of failure, redundancy |

## 📋 4 Result Sections

### 1. Architecture Summary 📊
- Overall assessment (2-3 sentences)
- Component count
- Connection count

### 2. Detected Issues ⚠️
- **Scalability Risks** - Can it grow?
- **Dependency Issues** - Tight coupling?
- **Failure Points** - Where can it break?

### 3. Optimization Suggestions 💡
- Performance improvements
- Cost reductions
- Resource efficiency
- Best practice recommendations

### 4. Resilience Improvements ✓
- Redundancy patterns
- Failure handling
- Recovery strategies
- Reliability improvements

## 🔑 Key Features

| Feature | Benefit |
|---------|---------|
| AI-Powered | Uses Azure OpenAI for intelligent analysis |
| Real-Time | Analyzes your current architecture |
| Contextual | Understands your component types |
| Actionable | Practical, implementable recommendations |
| Grouped | Organized into 4 clear sections |
| Expandable | Click to open/close sections |
| Badged | Shows count of each section |

## ⚡ UI Navigation

```
Sidebar Left           Canvas               Sidebar Right
┌─────────────┐       ┌───────────┐       ┌──────────────┐
│ ⬛ Nodes    │       │           │       │ Properties   │
│ ⬛ Infer    │       │ Your      │       │              │
│ ⬛ Rules    │       │ Architecture       │              │
│ ⬛ Simulate │       │           │       │              │
│ ⬛ CBCT     │       │           │       │              │
│ ⬛ Events   │       │           │       │              │
│ ✨ AI Advisor ← CLICK HERE
│              │       │           │       │              │
└─────────────┘       └───────────┘       └──────────────┘
```

## 💻 API Endpoint

```
POST /api/ai/analyze-architecture

Input:
{
  "nodes": [...], 
  "edges": [...]
}

Output:
{
  "analysis": "string",
  "recommendations": {
    "scalability_risks": [...],
    "dependency_issues": [...],
    "resilience_recommendations": [...],
    "optimization_opportunities": [...]
  }
}
```

## 🎨 Component Properties

| Property | Recommended | Avoid |
|----------|-------------|-------|
| **Labels** | "React Frontend" | "Component1" |
| **Types** | Frontend, API, Database | Unknown |
| **Connections** | Show all dependencies | Missing edges |
| **Details** | Include service names | Generic names |

## 🔧 Configuration

### Required for Full AI Analysis
```bash
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
```

### Without Configuration
- System still works
- UI fully functional
- Shows setup instructions
- Perfect for testing

## 📊 Example Analyses

### 3-Tier Web App
```
Frontend → API → Database
```
**Analysis includes:**
- Scalability of single API instance
- Database as bottleneck
- Caching opportunities
- Load balancing needs

### Microservices
```
Gateway → [Service1, Service2, Service3]
           ↓ Queue ↓
          Cache
```
**Analysis includes:**
- Inter-service coupling
- Message queue bottleneck
- Circuit breaker patterns
- Service discovery needs

### Real-Time App
```
Frontend → WebSocket → Cache → Database
                       ↓
                    Queue
```
**Analysis includes:**
- Pub/sub patterns
- Data consistency
- Connector reliability
- Scaling WebSockets

## ⚙️ Buttons & Icons

| Button/Icon | Action |
|----------|--------|
| **"Analyze Architecture"** | Send architecture to AI |
| **[v] / [^]** | Expand/collapse section |
| **Badge (2)** | Count of items in section |
| **✨** | AI Advisor sidebar icon |
| **⚡** | Refresh/action icon |

## 🎨 Color Coding

| Color | Section | Meaning |
|-------|---------|---------|
| 🔵 Blue | Summary | Overview |
| 🔴 Red | Issues | Problems |
| 🟡 Yellow | Optimization | Improvements |
| 🟢 Green | Resilience | Hardening |

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Button disabled | Add at least one component |
| No results | Check console, verify API |
| "Unconfigured" | Set Azure env variables |
| Empty sections | That category has no items |
| Slow response | Large architecture, wait 5-10s |

## 📝 Tips for Best Results

1. **Clear labels** → Better understanding
2. **All components** → Complete picture
3. **Show connections** → Reveals dependencies
4. **Use types** → Categorizes properly
5. **Multiple runs** → See improvements

## 🎯 When to Use

- ✅ Designing new architecture
- ✅ Reviewing existing design
- ✅ Planning scaling improvements
- ✅ Assessing resilience
- ✅ Finding optimization opportunities
- ✅ Learning architecture best practices

## ⏱️ Typical Response Times

| Action | Time |
|--------|------|
| Click analyze | 1 second |
| Send to OpenAI | 1-2 seconds |
| AI processes | 2-5 seconds |
| Display results | 1 second |
| **Total** | **5-8 seconds** |

## 📱 Keyboard Shortcuts

Currently none defined, but you can:
- **Tab** - Navigate sections
- **Enter** - Expand/collapse
- **Scroll** - Browse results

## 🔍 What Gets Sent to Azure OpenAI

**Your architecture description:**
- Component names and types
- Connection directions
- System structure
- NOT: Your code, credentials, or secrets

## 💾 Storage

- ✅ Analysis shown in UI
- ⏳ History not saved (future feature)
- ✅ Can screenshot or copy text

## 🌐 Network Requirements

- ✅ Internet connection needed for Azure OpenAI
- ✅ Works offline (with unconfigured message)
- ✅ Proxy-friendly (standard HTTPS)

## 📞 Support Commands

**Check if working:**
1. Add simple 3-node architecture
2. Click Analyze
3. Should get results in seconds

**Debug issues:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Look at server logs

## 🚀 Full Workflow Example

```
1. Open AetherOS
   ↓
2. Design architecture
   - Add Frontend (React)
   - Add API (Node.js)
   - Add Database (PostgreSQL)
   - Connect all
   ↓
3. Click Sparkles icon (✨)
   ↓
4. Click "Analyze Architecture"
   ↓
5. Wait 5-10 seconds
   ↓
6. Review recommendations
   • Expand each section
   • Read issues carefully
   • Note suggestions
   ↓
7. Improve design
   • Add cache layer
   • Set up replication
   • Add load balancer
   ↓
8. Re-analyze
   • Click analyze again
   • See improved score
   • Iterate until satisfied
   ↓
9. Export/save results
   • Take screenshot
   • Copy text
   • Share with team
```

## 🎓 Learning Path

### Beginner
1. Design simple 3-tier app
2. Analyze to see issues
3. Read first section only

### Intermediate
4. Design microservices
5. Analyze and expand all sections
6. Understand each recommendation

### Advanced
7. Design complex architecture
8. Use findings to optimize
9. Re-analyze and compare
10. Share patterns with team

## 📚 Related Commands

| Command | File | Purpose |
|---------|------|---------|
| Infer | Infer tab | Extract from repo |
| Rules | Rules tab | Define constraints |
| Simulate | Simulate tab | Test resilience |
| CBCT | CBCT tab | Analyze codebase |
| Events | Events tab | Track changes |
| **Analyze (NEW)** | **AI tab** | **AI recommendations** |

## ✨ Example Insights You'll Get

**For bottleneck:**
> "Single API instance is a bottleneck. Add load balancing with 3+ replicas."

**For resilience:**
> "Database is single point of failure. Set up multi-region replication."

**For optimization:**
> "Add Redis cache between API and database to reduce query load by 80%."

**For design:**
> "Services are too tightly coupled. Consider event-driven architecture."

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Panel opens without errors
- ✅ Architecture sends to backend
- ✅ Gets response from Azure OpenAI
- ✅ Results display in 4 sections
- ✅ Recommendations are relevant
- ✅ Insights are actionable

## 🏁 Final Checklist

- [ ] Click Sparkles icon ✨
- [ ] See "AI Architecture Advisor" panel
- [ ] Add components to canvas
- [ ] Click "Analyze Architecture"
- [ ] See results in 4 sections
- [ ] Expand each section
- [ ] Read recommendations
- [ ] Improve your design
- [ ] Re-analyze to verify
- [ ] Share insights with team

---

**Need more help?** See `AI_ARCHITECTURE_ADVISOR_GUIDE.md` for detailed documentation.

**Ready to go?** Click the Sparkles icon and start analyzing! ✨
