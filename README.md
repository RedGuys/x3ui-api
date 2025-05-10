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
- Protocol-specific builders with fluent API:
  - VLESS with Reality support
  - VMess with HTTP Upgrade support
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

### Creating a VMess Inbound

The library provides a convenient builder pattern for creating VMess inbounds with HTTP Upgrade:

```javascript
const X3UIClient = require('x3ui-api');
const vmess = require('x3ui-api/src/protocols/vmess');

const client = new X3UIClient({
  baseURL: 'http://your-x3ui-panel.com:54321'
});

async function createVmessInbound() {
  try {
    await client.login('admin', 'password');
    
    // Create a VMess inbound builder
    let builder = new vmess.VmessBuilder(client)
      .setRemark('My VMess Inbound')
      .setPort(8443) // Optional, will auto-generate if not provided
      .setHttpUpgradeHost('your-domain.com');
    
    // Add a client
    builder.addClient()
      .setEmail('user@example.com')
      .setTotalGB(100) // 100 GB traffic limit
      .setExpiryTime(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Build and add the inbound
    const inbound = await builder.build();
    const createdInbound = await client.addInbound(inbound);
    
    // Update the builder with the server-returned inbound to get all metrics and IDs
    builder = new vmess.VmessBuilder(client, createdInbound);
    
    console.log('Inbound created:', createdInbound);
    
    // Get connection link for the client (now with accurate server-assigned values)
    const link = builder.getClientLink(0, 'your-server-ip.com');
    console.log('Client connection link:', link);
  } catch (error) {
    console.error('Error creating inbound:', error.message);
  }
}

createVmessInbound();
```

### Creating a VLESS Reality Inbound

The library provides a convenient builder pattern for creating Reality inbounds:

```javascript
const X3UIClient = require('x3ui-api');
const vless = require('x3ui-api/src/protocols/vless');

const client = new X3UIClient({
  baseURL: 'http://your-x3ui-panel.com:54321'
});

async function createRealityInbound() {
  try {
    await client.login('admin', 'password');
    
    // Create a Reality inbound builder
    let builder = new vless.RealityBuilder(client, {
      remark: 'My Reality Inbound',
      port: 8443 // Optional, will auto-generate if not provided
    });
    
    // Configure Reality settings
    builder
      .setDest('yahoo.com:443')
      .setServerNames(['yahoo.com', 'www.yahoo.com'])
      .setFingerprint('chrome');
    
    // Add a client
    builder.addClient()
      .setEmail('user@example.com')
      .setTotalGB(100) // 100 GB traffic limit
      .setExpiryTime(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Build and add the inbound
    const inbound = await builder.build();
    const createdInbound = await client.addInbound(inbound);
    
    // Update the builder with the server-returned inbound to get all metrics and IDs
    builder = new vless.RealityBuilder(client, createdInbound);
    
    console.log('Inbound created:', createdInbound);
    
    // Get connection link for the client (now with accurate server-assigned values)
    const link = builder.getClientLink(0, 'your-server-ip.com');
    console.log('Client connection link:', link);
  } catch (error) {
    console.error('Error creating inbound:', error.message);
  }
}
```

### Real-World Example

Here's a complete example showing how to create a VMess inbound and get the client link:

```javascript
const X3UIClient = require('x3ui-api');
const vmess = require('x3ui-api/src/protocols/vmess');

const client = new X3UIClient({
    baseURL: 'https://your-panel-url.com/path/',
});

(async () => {
    await client.login('username', 'password');

    // Create VMess builder with HTTP Upgrade
    let vmessBuilder = new vmess.VmessBuilder(client)
        .setRemark("My VMess Inbound")
        .setHttpUpgradeHost("your-domain.com");

    // Add the inbound to the server
    const vmessInbound = await client.addInbound(await vmessBuilder.build());
    
    // Create a new builder with the server-returned inbound to get accurate client links
    vmessBuilder = new vmess.VmessBuilder(client, vmessInbound);
    
    // Generate and output the client connection link
    console.log(vmessBuilder.getClientLink(0, "your-domain.com"));
})();
```

### Managing Existing Inbounds

```javascript
async function manageInbounds() {
  try {
    // Get all inbounds
    const inbounds = await client.getInbounds();
    
    if (inbounds.length > 0) {
      // Get the first inbound
      const inbound = inbounds[0];
      const inboundId = inbound.id;
      
      // IMPORTANT: When updating an inbound, always start with the complete inbound object
      // to avoid losing data, then modify only what you need to change
      
      // Example 1: Update the remark and enable status
      inbound.remark = 'Updated Inbound Name';
      inbound.enable = true;
      
      // Send the complete updated inbound back to the server
      await client.updateInbound(inboundId, inbound);
      
      // Example 2: Add a new client to an existing inbound
      if (inbound.protocol === 'vmess') {
        // Create a builder with the existing inbound
        const builder = new vmess.VmessBuilder(client, inbound);
        
        // Add a new client
        builder.addClient()
          .setEmail('newuser@example.com')
          .setTotalGB(50);
        
        // Build the updated inbound and send it to the server
        const updatedInbound = await builder.build();
        await client.updateInbound(inboundId, updatedInbound);
        
        // Get the link for the new client
        const link = builder.getClientLink(builder.clients.length - 1, 'your-server-ip.com');
        console.log('New client link:', link);
      }
      
      // Example 3: Delete an inbound
      await client.deleteInbound(inboundId);
    }
  } catch (error) {
    console.error('Error managing inbounds:', error.message);
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
- `addInbound(config)` - Add a new inbound and returns the created inbound with server-assigned values
- `updateInbound(id, config)` - Update an existing inbound with the complete inbound configuration
- `deleteInbound(id)` - Delete an inbound
- `getNewX25519Cert()` - Generate a new X25519 certificate

### Protocol Builders

The library provides protocol-specific builders for creating different types of inbounds:

#### VMess Builder

```javascript
const vmess = require('x3ui-api/src/protocols/vmess');
const builder = new vmess.VmessBuilder(client, options);
```

Methods:
- `setPort(port)` - Set the port for the inbound
- `setRemark(remark)` - Set the name/remark for the inbound
- `setNetwork(network)` - Set the network type (default: 'httpupgrade')
- `setSecurity(security)` - Set the security type (default: 'none')
- `setHttpUpgradePath(path)` - Set the HTTP upgrade path
- `setHttpUpgradeHost(host)` - Set the HTTP upgrade host
- `setSniffing(enabled, destOverride, metadataOnly, routeOnly)` - Configure sniffing
- `setListenIP(ip)` - Set listen IP address
- `setExpiryTime(timestamp)` - Set inbound expiry time
- `addClient(options)` - Add a new client to the inbound
- `getClientLink(clientIndex, host, port)` - Get connection link for a client
- `build()` - Build the final inbound config

#### VLESS Reality Builder

```javascript
const vless = require('x3ui-api/src/protocols/vless');
const builder = new vless.RealityBuilder(client, options);
```

Methods:
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
