# 🚀 Redis Installation & Integration Guide

## Status Check

- ✅ Redis Service Module Created: `server/src/services/redisService.js`
- ✅ Redis Dependency Added: `server/package.json`
- ✅ Redis Initialization: Integrated in `server/src/index.js`
- ❌ Redis Server NOT YET INSTALLED on system

---

## 📦 Installation Steps

### Option 1: Install Redis (Recommended)

#### Windows Users

**Method A: Using Chocolatey (Easiest)**

```powershell
choco install redis
```

**Method B: Using WSL2 (Windows Subsystem for Linux)**

```powershell
# Enable WSL2 (requires Windows 10 Build 19041 or higher)
wsl --install

# Inside WSL terminal:
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start
```

**Method C: Manual Download**

1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract to a folder (e.g., `C:\redis`)
3. Run: `redis-server.exe`
4. Keep terminal open (Redis runs in foreground)

#### macOS Users

```bash
# Using Homebrew
brew install redis

# Start Redis
brew services start redis

# Or run directly:
redis-server
```

#### Linux Users

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Or using systemd:
sudo systemctl start redis-server
```

---

### Option 2: Docker (Recommended for Development)

```bash
# Pull Redis image
docker pull redis:latest

# Run Redis container
docker run -d -p 6379:6379 --name aetheros-redis redis:latest

# Verify connection
docker exec aetheros-redis redis-cli ping
# Output: PONG
```

---

### Option 3: Use Redis Cloud (For Production)

1. Sign up at: https://redis.com/try-free/
2. Create a free tier database
3. Copy connection URL
4. Set environment variable: `REDIS_URL=redis://user:password@host:port`

---

## ✅ Verify Redis Installation

### Check Redis CLI

```bash
# Should output version e.g., "redis-cli 6.2.7"
redis-cli --version
```

### Test Redis Connection

```bash
# Launch Redis CLI
redis-cli

# Inside CLI - test PING
ping
# Output: PONG

# Exit
exit
```

### Using NetCat (Alternative Test)

```bash
# Should connect and show Redis banner
nc -zv 127.0.0.1 6379
# Output: Connection to 127.0.0.1 6379 port [tcp/*] succeeded!
```

---

## 🔧 Install Node Dependencies

Once Redis is running on your system:

```bash
# Navigate to server directory
cd D:\AetherOS\server

# Install dependencies (includes redis package)
npm install

# Verify redis package installed
npm list redis
# Output: server@1.0.0 └── redis@4.6.13
```

---

## 🏃 Start AetherOS Server

```bash
# In D:\AetherOS\server
npm run dev

# Expected output:
# [AetherOS] Initializing...
# [AetherOS] All routes imported successfully
# [AetherOS] Creating Express app and HTTP server
# [Cache] Initializing Redis...
# [Redis] Connected to 127.0.0.1:6379
# [Redis] Ready to accept commands
# [DB] Attempting to connect to MongoDB...
# [AetherOS] Starting server...
# [AetherOS] Server running on http://127.0.0.1:4000
```

---

## 🔌 Connection Configuration

### Environment Variables

Create or update `.env` file in server root:

```env
# Optional: Specify Redis URL (defaults to localhost:6379)
REDIS_URL=redis://127.0.0.1:6379

# Optional: Separate Redis from MongoDB
# Redis for caching
# MongoDB for persistence
REDIS_URL=redis://127.0.0.1:6379
MONGO_URI=mongodb://127.0.0.1:27017/aetheros
```

### Default Connection

If no `REDIS_URL` is set, the service defaults to:
```
redis://127.0.0.1:6379
```

This assumes:
- Redis running on localhost
- Port: 6379 (default Redis port)
- No authentication required (development only)

---

## 🧪 Test Redis Integration

### Manual Test

```bash
# 1. Start Redis server in one terminal
redis-server

# 2. Start AetherOS server in another terminal
cd D:\AetherOS\server
npm run dev

# 3. In a third terminal, check Redis
redis-cli

# Inside redis-cli:
# Check Redis keys (should see cache keys)
KEYS *

# View specific key
GET "cbct:analysis:user/repo"

# Check memory usage
INFO memory

# Exit
EXIT
```

### Programmatic Test

Create `test-redis.js` in server directory:

```js
const { redisCache, isRedisConnected } = require('./src/services/redisService');

async function testRedis() {
  console.log('Redis Connected:', isRedisConnected());

  // Test SET
  await redisCache.set('test:key', { message: 'Hello Redis' });
  console.log('✅ SET successful');

  // Test GET
  const value = await redisCache.get('test:key');
  console.log('✅ GET:', value);

  // Test EXISTS
  const exists = await redisCache.has('test:key');
  console.log('✅ EXISTS:', exists);

  // Test STATS
  const stats = await redisCache.getStats();
  console.log('✅ STATS:', stats);

  // Test DELETE
  await redisCache.delete('test:key');
  console.log('✅ DELETE successful');

  process.exit(0);
}

testRedis().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
```

Run test:
```bash
node test-redis.js
```

---

## 🎯 Redis in AetherOS Architecture

### CBCT Prefetch Flow

```
1. User loads architecture
   ↓
2. AetherOS adapter calls CBCT prefetch endpoint
   ↓
3. CBCT backend checks Redis cache
   ├─ HIT: Return cached analysis immediately
   └─ MISS: Perform analysis, store in Redis
   ↓
4. Redis stores result with TTL (30 min default)
   ↓
5. Next access: Instant from Redis cache
```

### Cache Keys (Standardized)

```js
// After loading user/repo
cbct:analysis:user/repo          // Full analysis
cbct:graph:user/repo             // Dependency graph
cbct:metrics:user/repo           // Complexity metrics
cbct:deps:user/repo              // Dependencies
cbct:node:user/repo:nodeId       // Node summary
prefetch:user/repo               // Prefetch status
prefetch:inprogress:user/repo    // In-progress marker
```

### TTL Settings

- **Default TTL**: 30 minutes
- **Configurable per key**: `await redisCache.set(key, value, ttlSeconds)`

---

## 🔐 Production Configuration

### With Authentication

If Redis requires authentication:

```env
# .env
REDIS_URL=redis://username:password@hostname:6379/0
```

### Redis Cluster (High Availability)

```env
# For Redis Cluster
REDIS_URL=redis-cluster://host1:6379,host2:6379,host3:6379
```

### With TLS (Secure Connections)

```env
# For Redis with TLS
REDIS_URL=rediss://hostname:6380
```

---

## 🚨 Troubleshooting

### Error: "Cannot find module 'redis'"

```bash
# Install redis package
npm install redis
```

### Error: "connect ECONNREFUSED 127.0.0.1:6379"

```bash
# Redis not running. Start it:

# Windows (if installed via Chocolatey)
redis-server

# Windows (Docker)
docker run -d -p 6379:6379 redis:latest

# macOS
brew services start redis

# Linux
sudo service redis-server start
```

### Error: "WRONGPASS invalid username-password pair"

```bash
# Check Redis password in REDIS_URL
# Format: redis://username:password@host:port

# Or use redis-cli with password:
redis-cli -a YOUR_PASSWORD
```

### Redis CommandError: "unknown command"

Usually means Redis version mismatch. Update:

```bash
# Check Redis version
redis-cli INFO server | grep redis_version

# Reinstall latest
brew upgrade redis  # macOS
choco upgrade redis  # Windows
```

### Performance Slow?

Check Redis memory and eviction policy:

```bash
# In redis-cli:
INFO memory

# Check eviction policy
CONFIG GET maxmemory-policy

# Set eviction policy if needed:
CONFIG SET maxmemory-policy allkeys-lru
```

---

## 📊 Monitoring Redis

### Using Redis CLI

```bash
# Monitor all commands in real-time
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory

# Check connected clients
redis-cli INFO clients

# Check replication status
redis-cli INFO replication

# Clear all keys (DANGER!)
redis-cli FLUSHALL
```

### Using Redis Insights (GUI)

Download: https://redis.com/redis-enterprise/redis-insight/

Connect to your Redis instance and browse keys visually.

---

## 🎓 Redis Learning Resources

- **Official Docs**: https://redis.io/docs/
- **Node.js Client**: https://github.com/redis/node-redis
- **Redis Commands**: https://redis.io/commands/

---

## ✨ What's Integrated

### Server-Side (`server/src/services/redisService.js`)

✅ Async Redis connection management  
✅ Graceful fallback to in-memory cache  
✅ Automatic TTL/expiration handling  
✅ Cache statistics & monitoring  
✅ Standardized cache key builders  

### Server Initialization (`server/src/index.js`)

✅ Redis initialized on startup  
✅ Graceful shutdown (disconnect) on process exit  
✅ Error handling & fallback modes  

### Client-Side (`client/src/integrations/cbctAdapter.js`)

✅ Prefetch triggers Redis caching  
✅ Adapter calls CBCT API (which uses Redis)  
✅ No direct client-side Redis access (correct!)  

---

## 🚀 Next Steps

1. **Install Redis** using Option 1, 2, or 3 above
2. **Run**: `npm install` in server directory
3. **Start**: `npm run dev` in server directory
4. **Verify**: Check logs for `[Redis] Connected...`
5. **Test**: Load architecture and prefetch CBCT data
6. **Monitor**: Use redis-cli or Redis Insights

---

## 💡 Pro Tips

- **Development**: Use local Redis or Docker
- **Production**: Use Redis Cloud or managed service
- **Monitoring**: Check Redis stats regularly
- **Optimization**: Adjust TTL based on workload
- **Scaling**: Use Redis Sentinel for high availability

---

**Status**: Redis architecture is **READY TO DEPLOY** 🚀
