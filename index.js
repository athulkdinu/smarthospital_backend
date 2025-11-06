const JSONServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = JSONServer.create();
const middleware = JSONServer.defaults();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'db.json');
const routesPath = path.join(__dirname, 'routes.json');

// Track current routers and rewrites for cleanup
let router = null;
let rewriter = null;

// Function to setup router and rewriter
function setupRouter() {
  // Clear require cache to force fresh load
  delete require.cache[require.resolve(dbPath)];
  delete require.cache[require.resolve(routesPath)];
  
  // Clear require cache for any json-server internals and lowdb
  Object.keys(require.cache).forEach(key => {
    if (key.includes('json-server') || key.includes('lowdb') || key.includes('Adapter')) {
      delete require.cache[key];
    }
  });
  
  // Force garbage collection hint (if available)
  if (global.gc) {
    global.gc();
  }
  
  // Create fresh router and rewriter
  try {
    // Force reload routes.json
    delete require.cache[require.resolve(routesPath)];
    rewriter = JSONServer.rewriter(require(routesPath));
    
    // Create a completely new router instance
    // This should force lowdb to read from file again
    router = JSONServer.router(dbPath);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating router:', error.message);
    return false;
  }
}

// Function to reload router when db.json changes
function reloadRouter() {
  try {
    // Read and validate JSON file to ensure it's valid
    const data = fs.readFileSync(dbPath, 'utf8');
    const dbData = JSON.parse(data);
    console.log(`📋 Reloading database with ${Object.keys(dbData).length} collections...`);
    
    // Setup new router with fresh data
    if (setupRouter()) {
      // Get current middleware stack
      const stack = server._router.stack;
      if (!stack || stack.length === 0) {
        console.error('❌ Server router stack is empty');
        return false;
      }
      
      // Store old router/rewriter references for comparison
      const oldRouter = router;
      const oldRewriter = rewriter;
      
      // Find and remove router and rewriter layers
      const indicesToRemove = [];
      for (let i = stack.length - 1; i >= 0; i--) {
        const layer = stack[i];
        // Check if this is a router layer (json-server uses router middleware)
        if (layer && (layer.name === 'router' || 
            layer.name === 'bound dispatch' || 
            (layer.handle && (layer.handle === oldRouter || layer.handle === oldRewriter)))) {
          indicesToRemove.push(i);
        }
      }
      
      // Remove in reverse order
      indicesToRemove.forEach(idx => {
        stack.splice(idx, 1);
      });
      
      // Re-add new rewriter and router (in correct order)
      server.use(rewriter);
      server.use(router);
      
      // Log success with timestamp
      const timestamp = new Date().toLocaleTimeString();
      console.log(`✅ Database reloaded successfully at ${timestamp}`);
      console.log(`   → Router and rewriter replaced with fresh instances`);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error reloading database:', error.message);
    console.error('   Stack:', error.stack);
    console.log('Database will continue using previous data.');
    return false;
  }
}

// Debounce function to prevent multiple rapid reloads
let reloadTimeout = null;
let lastModified = {
  db: null,
  routes: null
};

function debouncedReload(fileName) {
  clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    try {
      // Determine which file to check based on fileName
      const filePath = fileName === 'routes.json' ? routesPath : dbPath;
      const key = fileName === 'routes.json' ? 'routes' : 'db';
      
      // Check file modification time to avoid false triggers
      const stats = fs.statSync(filePath);
      const currentModified = stats.mtime.getTime();
      
      // Only reload if file was actually modified (not just watched)
      if (lastModified[key] === null || currentModified !== lastModified[key]) {
        lastModified[key] = currentModified;
        console.log(`📝 Detected change in ${fileName}, reloading database...`);
        // Add delay for Windows file system to ensure write is complete
        setTimeout(() => {
          reloadRouter();
        }, 300); // 300ms delay for Windows
      }
    } catch (error) {
      console.error('❌ Error checking file stats:', error.message);
    }
  }, 300); // 300ms debounce
}

// Initialize lastModified time for both files
try {
  const dbStats = fs.statSync(dbPath);
  lastModified.db = dbStats.mtime.getTime();
  const routesStats = fs.statSync(routesPath);
  lastModified.routes = routesStats.mtime.getTime();
} catch (error) {
  console.warn('⚠️ Could not get initial file modification time');
}

// Setup initial router
if (!setupRouter()) {
  console.error('❌ Failed to initialize router on startup');
  process.exit(1);
}

// Setup server middleware
server.use(middleware);
server.use(rewriter);
server.use(router);

// Watch db.json for changes using fs.watchFile (more reliable on Windows)
// fs.watchFile is more reliable than fs.watch for manual file edits
fs.watchFile(dbPath, { interval: 500, persistent: true }, (curr, prev) => {
  if (curr.mtime.getTime() !== prev.mtime.getTime()) {
    console.log(`👀 File change detected: ${dbPath}`);
    debouncedReload('db.json');
  }
});

// Watch routes.json for changes
fs.watchFile(routesPath, { interval: 500, persistent: true }, (curr, prev) => {
  if (curr.mtime.getTime() !== prev.mtime.getTime()) {
    console.log(`👀 File change detected: ${routesPath}`);
    debouncedReload('routes.json');
  }
});

// Note: fs.watchFile doesn't return a watcher object that needs cleanup like fs.watch
// But we'll use unwatchFile in cleanup

server.listen(PORT, () => {
  console.log(`🚀 Patient Dashboard backend running on PORT ${PORT}`);
  console.log(`👀 Watching db.json for changes (real-time file watching enabled)...`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`💡 Tip: Changes to db.json will automatically reload without restarting!`);
  console.log(`⚡ Updates will reflect immediately in the frontend!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  // Stop watching files
  fs.unwatchFile(dbPath);
  fs.unwatchFile(routesPath);
  process.exit(0);
});



