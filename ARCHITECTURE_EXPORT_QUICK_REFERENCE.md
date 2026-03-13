# Architecture Export — Quick Reference

## ⚡ 30-Second Quick Start

```
1. Design your architecture on canvas
   ↓
2. Click Download icon (📥) in left sidebar
   ↓
3. Click "Export Architecture Diagram" button
   ↓
4. Choose:
   • Download JSON → Save file for submission
   • Copy JSON → Paste into documentation
   ↓
Done! ✓
```

## 🎯 What Gets Exported

Your architecture is automatically organized into layers:

```json
{
  "client": "React Frontend",
  "backend": "Node.js API",
  "ai": "Azure OpenAI",
  "data": "PostgreSQL",
  "infrastructure": "Redis Cache"
}
```

## 📊 Export Includes

| Item | Details |
|------|---------|
| **Components** | All nodes, categorized by layer |
| **Connections** | All edges with labels |
| **Statistics** | Count by layer type |
| **Summary** | Human-readable component list |
| **Diagram** | ASCII art representation |
| **Metadata** | Timestamps, totals |

## 🔑 Key Features

✅ **Auto Categorization** - Detects component types automatically
✅ **Multiple Formats** - Download or copy to clipboard
✅ **Statistics** - See breakdown by layer
✅ **No Config** - Works out of the box
✅ **Hackathon Ready** - Perfect for submissions

## 📥 How to Access

1. Click the **Download icon** (📥) in left sidebar
2. You'll see the **Export Architecture** panel
3. Your current architecture is ready to export
4. Click **"Export Architecture Diagram"** button

## 📋 Layer Categories

| Layer | Examples |
|-------|----------|
| 🎨 **Frontend** | React, Vue, Angular, SPA, Web App |
| ⚙️ **Backend** | Node.js, API, Server, Microservices |
| 🤖 **AI** | Azure OpenAI, GPT, LLM, ML Models |
| 🏭 **Infrastructure** | Cache, Queue, Storage, CDN, Cloud Services |
| 💾 **Data** | PostgreSQL, MongoDB, CosmosDB, Redis |
| 📦 **Other** | Everything else |

## 🚀 Common Workflows

### Hackathon Submission
```
1. Design architecture
2. Click Export
3. Click "Download JSON"
4. Submit architecture.json
```

### Team Documentation
```
1. Design architecture
2. Click Export
3. Click "Copy JSON"
4. Paste into shared doc
5. Share with team
```

### Architecture Comparison
```
1. Export v1 → Save
2. Make improvements
3. Export v2 → Save
4. Compare files
```

## 📊 Example Output

### For 3-tier app:

**Input:**
- React Frontend
- Node.js API
- PostgreSQL

**Exported Summary:**
```json
{
  "client": "React Frontend",
  "backend": "Node.js API",
  "data": "PostgreSQL"
}
```

**Statistics:**
- Total Components: 3
- Total Connections: 2
- Frontend: 1 | Backend: 1 | Data: 1

## 🔌 API Endpoints

```
POST /api/architecture/export
  Input: { nodes, edges }
  Output: Complete architecture structure

GET /api/architecture/templates
  Output: Pre-built architecture templates
```

## 💾 File Format

Downloaded file: `architecture-YYYY-MM-DD.json`

Example filename:
- `architecture-2026-03-13.json`
- `architecture-2026-03-14.json`

## 🎨 Buttons & Actions

| Button | Action |
|--------|--------|
| **Export Architecture Diagram** | Generate export |
| **Download JSON** | Save as file |
| **Copy JSON** | To clipboard |

## 📈 Statistics Shown

After export, you'll see:

```
Architecture Layers:
├─ Frontend: 1
├─ Backend: 2
├─ AI Services: 1
├─ Infrastructure: 1
├─ Data: 1
└─ Other: 0

Component Summary:
├─ Client: React Frontend
├─ Backend: Node.js API, Auth Service
├─ AI: Azure OpenAI
├─ Data: PostgreSQL
└─ Infrastructure: Redis Cache
```

## ❓ Common Questions

**Q: Where does the exported file go?**
A: Check your Downloads folder. File is named `architecture-YYYY-MM-DD.json`

**Q: Can I export without internet?**
A: Yes! No external APIs. Everything is local.

**Q: What if I have no components?**
A: Export button will be disabled. Add components first.

**Q: Can I edit the exported JSON?**
A: Yes! It's plain JSON. Edit as needed.

**Q: How large are exports?**
A: Typically 1-10 KB depending on architecture size.

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Button disabled | Add at least one component |
| No data in export | Set component types properly |
| File not downloading | Check browser downloads |
| Copy not working | Try again or reload page |

## 📱 UI Locations

```
Left Sidebar:
┌──────────────┐
│ ⬛ Nodes     │
│ ⬛ Infer     │
│ ⬛ Rules     │
│ ⬛ Simulate  │
│ ⬛ CBCT      │
│ ⬛ Events    │
│ ✨ AI Advisor│
│ 📥 Export    │ ← Click here
└──────────────┘
```

## 📚 Use Cases

```
✓ Hackathon submission
✓ Documentation
✓ Team review
✓ Architecture tracking
✓ Integration testing
✓ Portfolio projects
✓ Architecture patterns
✓ Design verification
```

## ⏱️ Time Required

| Task | Time |
|------|------|
| Design architecture | 2-15 min |
| Click export | 10 sec |
| Review results | 30 sec |
| Download file | 5 sec |
| **Total** | **3-16 min** |

## 🎓 Best Practices

1. **Use clear names** → "React Frontend", not "Component1"
2. **Set component types** → Ensures proper categorization
3. **Connect components** → Shows dependencies
4. **Export regularly** → Track evolution
5. **Download early** → Backup your design

## 🔗 Related Features

| Feature | Icon | Purpose |
|---------|------|---------|
| Nodes | ⬛ | Add components |
| Inference | ⬛ | Extract from repo |
| Rules | ⬛ | Define constraints |
| AI Advisor | ✨ | Analyze architecture |
| **Export** | **📥** | **Export to JSON** |

## 📊 Export Structure

```
Export JSON contains:
├─ status: "success"
├─ timestamp: "2026-03-13T15:30:45Z"
├─ metadata
│  ├─ totalComponents: 6
│  └─ layers breakdown
├─ architecture
│  ├─ summary (human readable)
│  ├─ layers (organized by type)
│  └─ connections (node relationships)
└─ diagram (ASCII art)
```

## ✨ What Makes It Special

- 🚀 **Zero Configuration** - Works immediately
- 🎯 **Smart Detection** - Auto-categorizes by type
- 📥 **Easy Sharing** - Download or clipboard
- 📊 **Rich Metadata** - Statistics and diagrams
- 🔒 **Privacy** - All local processing
- ⚡ **Fast** - < 1 second export time

## 🎯 Next Steps

1. **Design** - Add architecture components
2. **Export** - Click Download icon → Export
3. **Download** - Save for hackathon
4. **Share** - Copy to documentation
5. **Iterate** - Analyze & improve
6. **Re-export** - Track evolution

## 🎉 You're Ready!

Everything is set up:
✅ Backend service ready
✅ Frontend panel ready
✅ API client ready
✅ Export button ready

**Click the Download icon to get started!** 📥

---

**Need more help?** See `ARCHITECTURE_EXPORT_GUIDE.md` for detailed docs.
