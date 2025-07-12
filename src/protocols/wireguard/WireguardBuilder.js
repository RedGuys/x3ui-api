const keyUtils = require('./keyUtils');
const WireguardClientBuilder = require('./WireguardClientBuilder');

module.exports = class WireguardBuilder {
    constructor(client, options = {}) {
        this.client = client;
        // Initialize from InboundConfig
        this.id = options.id || undefined;
        this.port = options.port || 0;
        this.remark = options.remark || '';
        this.listenIP = options.listen || '';
        this.expiryTime = options.expiryTime || 0;
        this.enable = true;
        this.up = options.up || 0;
        this.down = options.down || 0;
        this.total = options.total || 0;

        // Initialize WireGuard specific settings
        const settings = typeof options.settings === 'string'
            ? JSON.parse(options.settings)
            : options.settings || {};

        this.mtu = settings.mtu || 1420;
        this.secretKey = settings.secretKey || '';
        this.publicKey = ''; // Will be derived from secretKey
        this.noKernelTun = settings.noKernelTun || false;

        // Initialize sniffing
        this.sniffing = options.sniffing || {
            enabled: false,
            destOverride: ['http', 'tls', 'quic', 'fakedns'],
            metadataOnly: false,
            routeOnly: false
        };

        // Initialize allocate
        this.allocate = options.allocate || {
            strategy: 'always',
            refresh: 5,
            concurrency: 3
        };

        // Initialize clients
        this.clients = [];
        
        if (settings?.peers) {
            settings.peers.forEach(peer => {
                this.addClient(peer);
            });
        }

        // If secretKey is provided, derive publicKey
        if (this.secretKey) {
            this.publicKey = keyUtils.derivePublicKey(this.secretKey);
        }

        // If no secretKey provided, generate one
        if (!this.secretKey) {
            let pair = keyUtils.generateKeyPair();
            this.secretKey = pair.privateKey;
            this.publicKey = pair.publicKey;
        }
    }

    setPort(port) {
        this.port = port;
        return this;
    }

    setRemark(remark) {
        this.remark = remark;
        return this;
    }

    setMtu(mtu) {
        this.mtu = mtu;
        return this;
    }

    setSecretKey(secretKey) {
        this.secretKey = secretKey;
        this.publicKey = keyUtils.derivePublicKey(secretKey);
        return this;
    }

    setNoKernelTun(noKernelTun) {
        this.noKernelTun = noKernelTun;
        return this;
    }

    setSniffing(enabled, destOverride = ['http', 'tls', 'quic', 'fakedns'], metadataOnly = false, routeOnly = false) {
        this.sniffing = {
            enabled,
            destOverride,
            metadataOnly,
            routeOnly
        };
        return this;
    }

    setListenIP(ip) {
        this.listenIP = ip;
        return this;
    }

    setExpiryTime(timestamp) {
        this.expiryTime = timestamp;
        return this;
    }

    addClient(options = {}) {
        const builder = new WireguardClientBuilder(this);
        if (options.privateKey) builder.setPrivateKey(options.privateKey);
        if (options.publicKey) builder.setPublicKey(options.publicKey);
        if (options.preSharedKey) builder.setPreSharedKey(options.preSharedKey);
        if (options.allowedIPs) builder.setAllowedIPs(options.allowedIPs);
        if (options.keepAlive !== undefined) builder.setKeepAlive(options.keepAlive);
        if (options.email) builder.setEmail(options.email);
        if (options.totalGB) builder.setTotalGB(options.totalGB);
        if (options.expiryTime) builder.setExpiryTime(options.expiryTime);
        if (options.tgId) builder.setTgId(options.tgId);
        
        this.clients.push(builder);
        return builder;
    }

    getClientLink(clientIndex = 0, host, port) {
        if (clientIndex < 0 || clientIndex >= this.clients.length) {
            throw new Error('Invalid client index');
        }
        const client = this.clients[clientIndex];
        return client.getLink(host || this.listenIP || 'localhost', port || this.port);
    }

    getClientConfig(clientIndex = 0, host, port) {
        if (clientIndex < 0 || clientIndex >= this.clients.length) {
            throw new Error('Invalid client index');
        }
        const client = this.clients[clientIndex];
        return client.getConfigFile(host || this.listenIP || 'localhost', port || this.port);
    }

    generateRandomPort() {
        return Math.floor(Math.random() * (65535 - 1024) + 1024);
    }

    async build() {
        if (!this.remark) {
            throw new Error('Remark is required');
        }

        // If no port specified, find unused one
        if (!this.port) {
            const inbounds = await this.client.getInbounds();
            const usedPorts = new Set(inbounds.map(i => i.port));
            let port;
            do {
                port = this.generateRandomPort();
            } while (usedPorts.has(port));
            this.port = port;
        }

        // If no secretKey provided, generate one
        if (!this.secretKey) {
            this.secretKey = keyUtils.generatePrivateKey();
            this.publicKey = keyUtils.derivePublicKey(this.secretKey);
        }

        // If no clients added, create one default client
        if (this.clients.length === 0) {
            this.addClient();
        }

        // Build all clients
        const clientConfigs = await Promise.all(this.clients.map(builder => builder.build()));

        // Create tag for inbound
        const tag = `inbound-${this.port}`;

        // Build the complete inbound configuration
        return {
            id: this.id,
            up: this.up,
            down: this.down,
            total: this.total,
            remark: this.remark,
            enable: this.enable,
            expiryTime: this.expiryTime,
            listen: this.listenIP,
            port: this.port,
            protocol: 'wireguard',
            settings: {
                mtu: this.mtu,
                secretKey: this.secretKey,
                peers: clientConfigs,
                noKernelTun: this.noKernelTun
            },
            streamSettings: {},
            tag,
            sniffing: this.sniffing,
            allocate: this.allocate
        };
    }
}

module.exports.default = module.exports;
