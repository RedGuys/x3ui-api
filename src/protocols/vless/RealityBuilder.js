const crypto = require("crypto");
const RealityClientBuilder = require("./RealityClientBuilder");

module.exports = class RealityBuilder {
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

        const realitySettings = streamSettings?.realitySettings || {};

        this.dest = realitySettings.dest || 'yahoo.com:443';
        this.serverNames = realitySettings.serverNames || ['yahoo.com', 'www.yahoo.com'];
        this.privateKey = realitySettings.privateKey || '';
        this.publicKey = realitySettings.settings?.publicKey || '';
        this.shortIds = realitySettings.shortIds;
        this.fingerprint = realitySettings.settings?.fingerprint || 'chrome';

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

    setDest(dest) {
        this.dest = dest;
        return this;
    }

    setServerNames(names) {
        this.serverNames = names;
        return this;
    }

    setKeyPair(privateKey, publicKey) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        return this;
    }

    setShortIds(ids) {
        this.shortIds = ids;
        return this;
    }

    setFingerprint(fingerprint) {
        this.fingerprint = fingerprint;
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
        const builder = new RealityClientBuilder(this);
        if (options.id) builder.setId(options.id);
        if (options.email) builder.setEmail(options.email);
        if (options.totalGB) builder.setTotalGB(options.totalGB);
        if (options.expiryTime) builder.setExpiryTime(options.expiryTime);
        if (options.tgId) builder.setTgId(options.tgId);
        builder.parent.streamSettings = {
            realitySettings: {
                serverNames: this.serverNames,
                settings: {
                    fingerprint: this.fingerprint,
                    publicKey: this.publicKey,
                    spiderX: '/'
                },
                shortIds: this.shortIds
            }
        };
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

    generateShortId() {
        const length = Math.floor(Math.random() * 7) * 2 + 2; // Random length between 2 and 16
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
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

        // If no keypair provided, generate one
        if (!this.privateKey || !this.publicKey) {
            const cert = await this.client.getNewX25519Cert();
            this.privateKey = cert.privateKey;
            this.publicKey = cert.publicKey;
        }

        // If no shortIds provided, generate random ones
        if (!this.shortIds) {
            this.shortIds = Array.from({ length: 8 }, () => this.generateShortId());
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
                security: 'reality',
                externalProxy: [],
                realitySettings: {
                    show: false,
                    xver: 0,
                    dest: this.dest,
                    serverNames: this.serverNames,
                    privateKey: this.privateKey,
                    minClient: '',
                    maxClient: '',
                    maxTimediff: 0,
                    shortIds: this.shortIds,
                    settings: {
                        publicKey: this.publicKey,
                        fingerprint: this.fingerprint,
                        serverName: '',
                        spiderX: '/'
                    }
                },
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
