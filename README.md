# x3ui-api

A Node.js client for interacting with the x3ui panel API. This library provides a simple interface to manage X-UI inbounds, clients, and system statistics.

## Installation

```bash
npm install x3ui-api
```

## Features

- Authentication with x3ui panel
- Get system statistics (CPU, memory, network, etc.)
- Manage inbounds (list, add, update, delete)
- Convenient Reality inbound builder
- Client management with fluent API
- TypeScript support

## Usage

### Basic Usage

```javascript
const X3UIClient = require('x3ui-api');

// Initialize client
const client = new X3UIClient({
  baseURL: 'http://your-x3ui-panel.com:54321',
  parseJSONSettings: true // Default: true - automatically parse JSON settings
});

// Login to panel
async function main() {
  try {
    const loginResult = await client.login('admin', 'password');
    console.log('Login successful:', loginResult.success);
    
    // Get system stats
    const stats = await client.getSystemStats();
    console.log('CPU Usage:', stats.cpu + '%');
    console.log('Memory:', Math.round(stats.mem.current / stats.mem.total * 100) + '%');
    
    // List all inbounds
    const inbounds = await client.getInbounds();
    console.log('Inbounds:', inbounds.length);
    
    // First inbound details
    if (inbounds.length > 0) {
      console.log('First inbound:', inbounds[0].remark);
      console.log('Protocol:', inbounds[0].protocol);
      console.log('Port:', inbounds[0].port);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

### Creating a Reality Inbound

The library provides a convenient builder pattern for creating Reality inbounds:

```javascript
async function createRealityInbound() {
  try {
    // Create a Reality inbound builder
    const builder = client.createRealityBuilder({
      remark: 'My Reality Inbound',
      port: 8443 // Optional, will auto-generate if not provided
    });
    
    // Configure Reality settings
    builder
      .setDest('yahoo.com:443')
      .setServerNames(['yahoo.com', 'www.yahoo.com'])
      .setFingerprint('chrome');
    
    // Add a client
    const clientBuilder = builder.addClient()
      .setEmail('user@example.com')
      .setTotalGB(100) // 100 GB traffic limit
      .setExpiryTime(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Build and add the inbound
    const inbound = await builder.build();
    const result = await client.addInbound(inbound);
    
    console.log('Inbound created:', result);
    
    // Get connection link for the client
    const link = builder.getClientLink(0, 'your-server-ip.com');
    console.log('Client connection link:', link);
  } catch (error) {
    console.error('Error creating inbound:', error.message);
  }
}
```

### Managing Existing Inbounds

```javascript
async function manageInbounds() {
  // Get all inbounds
  const inbounds = await client.getInbounds();
  
  if (inbounds.length > 0) {
    const inboundId = inbounds[0].id;
    
    // Update an inbound
    await client.updateInbound(inboundId, {
      remark: 'Updated Inbound Name',
      enable: true
    });
    
    // Delete an inbound
    await client.deleteInbound(inboundId);
  }
}
```

## API Reference

### X3UIClient

#### Constructor

```javascript
new X3UIClient({
  baseURL: string,       // Required: URL to your x3ui panel
  token?: string,        // Optional: Authentication token (if already logged in)
  parseJSONSettings?: boolean // Optional: Auto-parse JSON settings (default: true)
})
```

#### Methods

- `login(username: string, password: string)` - Authenticate with the panel
- `getSystemStats()` - Get system statistics
- `getInbounds()` - Get all configured inbounds
- `addInbound(config)` - Add a new inbound
- `updateInbound(id, config)` - Update an existing inbound
- `deleteInbound(id)` - Delete an inbound
- `getNewX25519Cert()` - Generate a new X25519 certificate
- `createRealityBuilder(options)` - Create a Reality inbound builder

### RealityBuilder

Builder class for creating Reality inbounds with a fluent API.

#### Methods

- `setPort(port)` - Set the port for the inbound
- `setRemark(remark)` - Set the name/remark for the inbound
- `setDest(dest)` - Set the destination address (e.g., "yahoo.com:443")
- `setServerNames(names)` - Set server names for SNI
- `setKeyPair(privateKey, publicKey)` - Set Reality keypair
- `setShortIds(ids)` - Set short IDs for Reality
- `setFingerprint(fingerprint)` - Set browser fingerprint
- `setListenIP(ip)` - Set listen IP address
- `setExpiryTime(timestamp)` - Set inbound expiry time
- `addClient(options)` - Add a new client to the inbound
- `getClientLink(clientIndex, host)` - Get connection link for a client
- `build()` - Build the final inbound config

## License

MIT
