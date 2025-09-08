const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 80;
const MOCKOON_DATA_DIR = '/mockoon-data';
const PID_FILE = '/var/run/mockoon.pid';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let mockoonProcess = null;

// Utility function to check if process is running
function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (e) {
        return false;
    }
}

// Get Mockoon status
function getMockoonStatus() {
    if (fs.existsSync(PID_FILE)) {
        const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
        if (isProcessRunning(pid)) {
            return 'running';
        }
    }
    return 'stopped';
}

// API endpoint to control Mockoon
app.get('/api/mockoon', (req, res) => {
    const { action, file } = req.query;

    switch (action) {
        case 'start':
            startMockoon(file, res);
            break;
        case 'stop':
            stopMockoon(res);
            break;
        case 'status':
            res.json({ status: getMockoonStatus() });
            break;
        case 'list':
            listFiles(res);
            break;
        default:
            res.json({ status: 'error', message: 'Invalid action' });
    }
});

// Start Mockoon
function startMockoon(file, res) {
    // Check if already running
    if (getMockoonStatus() === 'running') {
        return res.json({ 
            status: 'error', 
            message: 'Mockoon is already running' 
        });
    }

    const dataFile = file 
        ? path.join(MOCKOON_DATA_DIR, file)
        : path.join(MOCKOON_DATA_DIR, 'default-mock.json');

    if (!fs.existsSync(dataFile)) {
        return res.json({ 
            status: 'error', 
            message: `Data file not found: ${file}` 
        });
    }

    const mockoonPort = process.env.MOCKOON_PORT || '3000';
    
    // Start Mockoon CLI
    mockoonProcess = spawn('mockoon-cli', [
        'start',
        '--data', dataFile,
        '--port', mockoonPort,
        '--hostname', '0.0.0.0'
    ], {
        detached: true,
        stdio: 'ignore'
    });

    // Save PID
    fs.writeFileSync(PID_FILE, mockoonProcess.pid.toString());
    
    mockoonProcess.unref();

    res.json({ 
        status: 'success', 
        message: `Mockoon started with PID ${mockoonProcess.pid}` 
    });
}

// Stop Mockoon
function stopMockoon(res) {
    if (getMockoonStatus() === 'stopped') {
        return res.json({ 
            status: 'error', 
            message: 'Mockoon is not running' 
        });
    }

    try {
        const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(PID_FILE);
        
        res.json({ 
            status: 'success', 
            message: 'Mockoon stopped' 
        });
    } catch (error) {
        res.json({ 
            status: 'error', 
            message: `Failed to stop Mockoon: ${error.message}` 
        });
    }
}

// List available JSON files
function listFiles(res) {
    try {
        const files = fs.readdirSync(MOCKOON_DATA_DIR)
            .filter(file => file.endsWith('.json'));
        res.json({ files });
    } catch (error) {
        res.json({ 
            status: 'error', 
            message: `Failed to list files: ${error.message}`,
            files: [] 
        });
    }
}

// Proxy requests to FileBrowser
app.use('/files', (req, res) => {
    const proxyUrl = `http://localhost:8080${req.url}`;
    req.pipe(require('http').request(proxyUrl, {
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    }));
});

// Proxy requests to Mockoon
app.use('/mock', (req, res) => {
    const proxyUrl = `http://localhost:3000${req.url}`;
    req.pipe(require('http').request(proxyUrl, {
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    }));
});

// Start server
app.listen(PORT, () => {
    console.log(`Control API server running on port ${PORT}`);
    
    // Auto-start Mockoon with default file if it exists
    const defaultFile = path.join(MOCKOON_DATA_DIR, 'default-mock.json');
    if (fs.existsSync(defaultFile) && getMockoonStatus() === 'stopped') {
        console.log('Auto-starting Mockoon with default configuration...');
        startMockoon('default-mock.json', {
            json: (data) => console.log('Auto-start:', data)
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    if (getMockoonStatus() === 'running') {
        stopMockoon({ json: () => {} });
    }
    process.exit(0);
});