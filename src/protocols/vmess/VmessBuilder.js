const VmessClientBuilder = require('./VmessClientBuilder');

module.exports = class VmessBuilder {
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

        // Initialize from StreamSettings
        const streamSettings = typeof options.streamSettings === 'string'
            ? JSON.parse(options.streamSettings)
            : options.streamSettings || {};

        this.network = streamSettings.network || 'httpupgrade';
        this.security = streamSettings.security || 'none';

        // Initialize httpupgrade settings
        this.httpupgradeSettings = streamSettings.httpupgradeSettings || {
            acceptProxyProtocol: false,
            path: '/',
            host: '',
            headers: {}
        };

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
        const settings = typeof options.settings === 'string'
            ? JSON.parse(options.settings)
            : options.settings;

        if (settings?.clients) {
            settings.clients.forEach(client => {
                this.addClient(client);
            });
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

    setNetwork(network) {
        this.network = network;
        return this;
    }

    setSecurity(security) {
        this.security = security;
        return this;
    }

    setHttpUpgradePath(path) {
        this.httpupgradeSettings.path = path;
        return this;
    }

    setHttpUpgradeHost(host) {
        this.httpupgradeSettings.host = host;
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
        const builder = new VmessClientBuilder(this);
        if (options.id) builder.setId(options.id);
        if (options.email) builder.setEmail(options.email);
        if (options.totalGB) builder.setTotalGB(options.totalGB);
        if (options.expiryTime) builder.setExpiryTime(options.expiryTime);
        if (options.tgId) builder.setTgId(options.tgId);
        if (options.security) builder.setSecurity(options.security);
        if (options.limitIp) builder.setLimitIp(options.limitIp);

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
            up: this.up,
            down: this.down,
            total: this.total,
            remark: this.remark,
            enable: this.enable,
            expiryTime: this.expiryTime,
            listen: this.listenIP,
            port: this.port,
            protocol: 'vmess',
            settings: {
                clients: clientConfigs
            },
            streamSettings: {
                network: this.network,
                security: this.security,
                externalProxy: [],
                httpupgradeSettings: this.httpupgradeSettings
            },
            tag,
            sniffing: this.sniffing,
            allocate: this.allocate
        };
    }
}