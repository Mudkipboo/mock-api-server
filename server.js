const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuration state
let config = {
  statusCode: 200,
  delay: 0,
  networkError: 'none' // none, timeout, reset, refuse
};

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Main API endpoint - responds based on current configuration
app.all('/api', async (req, res) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || req.connection.remoteAddress;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📥 INCOMING API CALL - ${timestamp}`);
  console.log('='.repeat(60));
  console.log(`Method:      ${req.method}`);
  console.log(`Client IP:   ${clientIP}`);
  console.log(`User-Agent:  ${req.headers['user-agent'] || 'N/A'}`);
  console.log('\nCurrent Configuration:');
  console.log(`  Status Code:    ${config.statusCode}`);
  console.log(`  Network Error:  ${config.networkError}`);
  console.log(`  Delay:          ${config.delay}ms`);
  
  // Handle network error simulations
  if (config.networkError === 'timeout') {
    console.log('\n🕐 RESPONSE: Simulating TIMEOUT (no response will be sent)');
    console.log('='.repeat(60) + '\n');
    // Simulate timeout by never responding
    // Client will eventually timeout based on their settings
    return;
  }
  
  if (config.networkError === 'reset') {
    console.log('\n🔌 RESPONSE: Simulating CONNECTION RESET');
    console.log('='.repeat(60) + '\n');
    // Simulate connection reset by destroying the socket
    req.socket.destroy();
    return;
  }
  
  if (config.networkError === 'refuse') {
    console.log('\n🚫 RESPONSE: Simulating CONNECTION REFUSED');
    console.log('='.repeat(60) + '\n');
    // Simulate connection refused by immediately destroying
    req.socket.destroy();
    return;
  }
  
  // Apply delay if configured
  if (config.delay > 0) {
    console.log(`\n⏳ Applying delay of ${config.delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, config.delay));
  }
  
  // Send response with configured status code
  const responseBody = {
    status: config.statusCode >= 200 && config.statusCode < 300 ? 'success' : 'error',
    code: config.statusCode,
    delay: config.delay,
    networkError: config.networkError,
    message: `Response with status ${config.statusCode}${config.delay > 0 ? ` after ${config.delay}ms delay` : ''}`,
    timestamp: timestamp,
    method: req.method,
    path: req.path
  };
  
  console.log(`\n✅ RESPONSE: Sending ${config.statusCode} response`);
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));
  console.log('='.repeat(60) + '\n');
  
  res.status(config.statusCode).json(responseBody);
});

// Get current configuration
app.get('/config', (req, res) => {
  res.json(config);
});

// Update configuration
app.post('/config', (req, res) => {
  const { statusCode, delay, networkError } = req.body;
  const oldConfig = { ...config };
  
  if (statusCode !== undefined) {
    config.statusCode = parseInt(statusCode);
  }
  
  if (delay !== undefined) {
    config.delay = parseInt(delay);
  }
  
  if (networkError !== undefined) {
    config.networkError = networkError;
  }
  
  console.log('\n' + '⚙️ '.repeat(30));
  console.log('⚙️  CONFIGURATION UPDATED');
  console.log('⚙️ '.repeat(30));
  console.log('Old Config:', JSON.stringify(oldConfig, null, 2));
  console.log('New Config:', JSON.stringify(config, null, 2));
  console.log('⚙️ '.repeat(30) + '\n');
  
  res.json({
    message: 'Configuration updated',
    config: config
  });
});

// Serve control panel HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mock API Control Panel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .endpoint-display {
            background: #f7f9fc;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        
        .endpoint-display strong {
            color: #667eea;
            font-size: 18px;
        }
        
        .control-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }
        
        .button-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        }
        
        button {
            padding: 12px 20px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            font-size: 14px;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        button.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        button.status-200.active {
            background: #10b981;
            border-color: #10b981;
        }
        
        button.status-400.active {
            background: #f59e0b;
            border-color: #f59e0b;
        }
        
        button.status-500.active {
            background: #ef4444;
            border-color: #ef4444;
        }
        
        input[type="number"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
        }
        
        input[type="number"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .test-button {
            width: 100%;
            background: #667eea;
            color: white;
            border: none;
            padding: 15px;
            font-size: 16px;
            margin-top: 20px;
        }
        
        .test-button:hover {
            background: #5568d3;
        }
        
        .current-config {
            background: #f0fdf4;
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            border-left: 4px solid #10b981;
        }
        
        .current-config h3 {
            color: #10b981;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .config-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            color: #333;
            font-size: 14px;
        }
        
        .response-display {
            background: #1e293b;
            color: #e2e8f0;
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
        }
        
        .response-display.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Mock API Control Panel</h1>
        <p class="subtitle">Configure your API endpoint behavior</p>
        
        <div class="endpoint-display">
            <strong>API Endpoint:</strong><br>
            <code>http://localhost:${PORT}/api</code>
        </div>
        
        <div class="control-group">
            <label>Response Status Code</label>
            <div class="button-group">
                <button class="status-btn status-200 active" data-status="200">200 OK</button>
                <button class="status-btn status-400" data-status="400">400 Error</button>
                <button class="status-btn status-500" data-status="500">500 Error</button>
            </div>
        </div>
        
        <div class="control-group">
            <label>Network Behavior</label>
            <div class="button-group">
                <button class="network-btn active" data-network="none">Normal</button>
                <button class="network-btn" data-network="timeout">Timeout</button>
                <button class="network-btn" data-network="reset">Reset</button>
                <button class="network-btn" data-network="refuse">Refuse</button>
            </div>
            <small style="color: #666; font-size: 12px; display: block; margin-top: 8px;">
                Timeout: No response | Reset: Connection closed mid-request | Refuse: Connection refused
            </small>
        </div>
        
        <div class="control-group">
            <label>Response Delay (milliseconds)</label>
            <input type="number" id="delayInput" value="0" min="0" step="100" placeholder="Enter delay in ms">
        </div>
        
        <button class="test-button" onclick="testAPI()">Test API Endpoint</button>
        
        <div class="current-config">
            <h3>Current Configuration</h3>
            <div class="config-item">
                <span>Status Code:</span>
                <strong id="currentStatus">200</strong>
            </div>
            <div class="config-item">
                <span>Network:</span>
                <strong id="currentNetwork">Normal</strong>
            </div>
            <div class="config-item">
                <span>Delay:</span>
                <strong id="currentDelay">0ms</strong>
            </div>
        </div>
        
        <div class="response-display" id="responseDisplay"></div>
    </div>
    
    <script>
        let currentStatus = 200;
        let currentDelay = 0;
        let currentNetwork = 'none';
        
        // Status button handling
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentStatus = parseInt(btn.dataset.status);
                await updateConfig();
            });
        });
        
        // Network button handling
        document.querySelectorAll('.network-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                document.querySelectorAll('.network-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentNetwork = btn.dataset.network;
                await updateConfig();
            });
        });
        
        // Delay input handling
        document.getElementById('delayInput').addEventListener('change', async (e) => {
            currentDelay = parseInt(e.target.value) || 0;
            await updateConfig();
        });
        
        async function updateConfig() {
            try {
                const response = await fetch('/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        statusCode: currentStatus,
                        delay: currentDelay,
                        networkError: currentNetwork
                    })
                });
                
                const data = await response.json();
                document.getElementById('currentStatus').textContent = data.config.statusCode;
                document.getElementById('currentDelay').textContent = data.config.delay + 'ms';
                
                const networkLabels = {
                    'none': 'Normal',
                    'timeout': 'Timeout',
                    'reset': 'Connection Reset',
                    'refuse': 'Connection Refused'
                };
                document.getElementById('currentNetwork').textContent = networkLabels[data.config.networkError];
            } catch (error) {
                console.error('Error updating config:', error);
            }
        }
        
        async function testAPI() {
            const responseDisplay = document.getElementById('responseDisplay');
            responseDisplay.textContent = 'Sending request...';
            responseDisplay.classList.add('show');
            
            const startTime = Date.now();
            
            try {
                const response = await fetch('/api', {
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                const data = await response.json();
                const duration = Date.now() - startTime;
                
                responseDisplay.textContent = JSON.stringify({
                    status: response.status,
                    statusText: response.statusText,
                    duration: duration + 'ms',
                    body: data
                }, null, 2);
            } catch (error) {
                const duration = Date.now() - startTime;
                responseDisplay.textContent = JSON.stringify({
                    error: error.name,
                    message: error.message,
                    duration: duration + 'ms'
                }, null, 2);
            }
        }
        
        // Load initial config
        updateConfig();
    </script>
</body>
</html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log('\n' + '🚀 '.repeat(30));
  console.log('🚀  MOCK API SERVER STARTED');
  console.log('🚀 '.repeat(30));
  console.log(`\n📊 Control Panel: http://localhost:${PORT}`);
  console.log(`🔌 API Endpoint:  http://localhost:${PORT}/api`);
  console.log('\n📝 All API calls will be logged to this console.');
  console.log('   Watch for incoming requests below...\n');
  console.log('🚀 '.repeat(30) + '\n');
});
