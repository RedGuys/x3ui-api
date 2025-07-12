const ClearClientBuilder = require("./ClearClientBuilder");

module.exports = class ClearBuilder {
    constructor(client, options = {}) {
        this.client = client;
        // Initialize from InboundConfig
        this.id = options.id || undefined;
        this.port = options.port || 0;
        this.remark = options.remark || '';
        this.listenIP = options.listen || '';
        this.expiryTime = options.expiryTime || 0;
        this.enable = true;

        // Initialize from StreamSettings and RealitySettings
        const streamSettings = typeof options.streamSettings === 'string'
            ? JSON.parse(options.streamSettings)
            : options.streamSettings || {};

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

    setListenIP(ip) {
        this.listenIP = ip;
        return this;
    }

    setExpiryTime(timestamp) {
        this.expiryTime = timestamp;
        return this;
    }

    addClient(options = {}) {
        const builder = new ClearClientBuilder(this);
        if (options.id) builder.setId(options.id);
        if (options.email) builder.setEmail(options.email);
        if (options.totalGB) builder.setTotalGB(options.totalGB);
        if (options.expiryTime) builder.setExpiryTime(options.expiryTime);
        if (options.tgId) builder.setTgId(options.tgId);
        this.clients.push(builder);
        return builder;
    }

    getClientLinkByIndex(clientIndex = 0, host) {
        if (clientIndex < 0 || clientIndex >= this.clients.length) {
            throw new Error('Invalid client index');
        }
        const client = this.clients[clientIndex];
        return client.getLink(host || this.listenIP || 'localhost', this.port);
    }

    getClientLinkByEmail(email, host) {
        const client = this.clients.find(client => client.email === email);
        if (!client) {
            throw new Error('Client not found');
        }
        return client.getLink(host || this.listenIP || 'localhost', this.port);
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

        return {
            id: this.id,
            up: 0,
            down: 0,
            total: 0,
            remark: this.remark,
            enable: true,
            expiryTime: this.expiryTime,
            listen: this.listenIP,
            port: this.port,
            protocol: 'vless',
            settings: {
                clients: clientConfigs,
                decryption: 'none',
                fallbacks: []
            },
            streamSettings: {
                network: 'tcp',
                security: 'none',
                externalProxy: [],
                tcpSettings: {
                    acceptProxyProtocol: false,
                    header: {
                        type: 'none'
                    }
                }
            },
            tag: `inbound-${this.port}`,
            sniffing: {
                enabled: false,
                destOverride: ['http', 'tls', 'quic', 'fakedns'],
                metadataOnly: false,
                routeOnly: false
            },
            allocate: {
                strategy: 'always',
                refresh: 5,
                concurrency: 3
            }
        };
    }
}

module.exports.default = module.exports;
