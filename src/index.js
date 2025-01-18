const axios = require('axios');
const crypto = require('crypto');

module.exports = class X3UIClient {
    constructor(config) {
        this.parseJSONSettings = config.parseJSONSettings || true;
        this.client = axios.create({
            baseURL: config.baseURL,
            headers: config.token ? {
                'Cookie': `lang=en-US; 3x-ui=${config.token}`,
            } : {
                'Cookie': 'lang=en-US'
            }
        });
    }

    /**
     * Login to the x3ui panel
     * @param {string} username Panel username
     * @param {string} password Panel password
     * @returns {Promise<{success: boolean, msg: string, obj: any}>} Login response with success status and token
     */
    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await this.client.post('/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.success) {
            this.client.defaults.headers.Cookie = `lang=en-US; ${response.headers.get("set-cookie")[0].split(";")[0]}`;
        }

        return response.data;
    }

    async getSystemStats() {
        const response = await this.client.post('/server/status');
        return response.data.obj;
    }

    /**
     * Get all inbounds
     * @returns {Promise<Array<{
     *   id?: number,
     *   up: number,
     *   down: number,
     *   total: number,
     *   remark: string,
     *   enable: boolean,
     *   expiryTime: number | null,
     *   listen: string,
     *   port: number,
     *   protocol: string,
     *   settings: any,
     *   streamSettings: any,
     *   sniffing: any
     * }>>}
     */
    async getInbounds() {
        const response = await this.client.get('/panel/api/inbounds/list');
        let inbounds = response.data.obj;
        if (this.parseJSONSettings) {
            inbounds = inbounds.map(inbound => this.parseInbound(inbound));
        }
        return inbounds;
    }

    parseInbound(inbound) {
        if (this.parseJSONSettings) {
            inbound.settings = JSON.parse(inbound.settings);
            inbound.streamSettings = JSON.parse(inbound.streamSettings);
            inbound.sniffing = JSON.parse(inbound.sniffing);
            inbound.allocate = JSON.parse(inbound.allocate);
        }
        return inbound;
    }

    stringifyInbound(inbound) {
        inbound.settings = JSON.stringify(inbound.settings);
        inbound.streamSettings = JSON.stringify(inbound.streamSettings);
        inbound.sniffing = JSON.stringify(inbound.sniffing);
        inbound.allocate = JSON.stringify(inbound.allocate);
        return inbound;
    }

    /**
     * Add new inbound
     * @param {Object} config Inbound configuration
     * @param {number} config.up Upload traffic in bytes
     * @param {number} config.down Download traffic in bytes
     * @param {number} config.total Total traffic limit in bytes
     * @param {string} config.remark Inbound remark/name
     * @param {boolean} config.enable Enable status
     * @param {number|null} config.expiryTime Expiry timestamp
     * @param {string} config.listen Listen address
     * @param {number} config.port Port number
     * @param {string} config.protocol Protocol type
     * @param {Object} config.settings Protocol settings
     * @param {Object} config.streamSettings Stream settings
     * @param {Object} config.sniffing Sniffing settings
     * @param {Object} config.allocate Allocation settings
     * @returns {Promise<void>}
     */
    async addInbound(config) {
        config = this.stringifyInbound(config);
        const response = await this.client.post('/panel/api/inbounds/add', config);
        if(!response.data.success)
            throw new Error(response.data.msg);
        return this.parseInbound(response.data.obj);
    }

    /**
     * Update existing inbound
     * @param {number} id Inbound ID
     * @param {Object} config Partial inbound configuration
     * @returns {Promise<void>}
     */
    async updateInbound(id, config) {
        config = this.stringifyInbound(config);
        const response = await this.client.post(`/panel/api/inbounds/update/${id}`, config);
        if(!response.data.success)
            throw new Error(response.data.msg);
        return this.parseInbound(response.data.obj);
    }

    /**
     * Delete inbound
     * @param {number} id Inbound ID
     * @returns {Promise<void>}
     */
    async deleteInbound(id) {
        await this.client.post(`/panel/api/inbounds/del/${id}`);
    }

    /**
     * Get new X25519 certificate
     * @returns {Promise<{privateKey: string, publicKey: string}>} New X25519 key pair
     */
    async getNewX25519Cert() {
        const response = await this.client.post('/server/getNewX25519Cert');
        return response.data.obj;
    }

    /**
     * Create a new Reality inbound builder
     * @param {Partial<import('./index').RealityInboundOptions>} options Initial options
     * @returns {import('./index').RealityBuilder} Reality builder instance
     */
    createRealityBuilder(options = {}) {
        return new RealityBuilder(this, options);
    }
}

class ClientBuilder {
    constructor(parent) {
        this.parent = parent;
        this.id = '';
        this.flow = '';
        this.email = '';
        this.limitIp = 0;
        this.totalGB = 0;
        this.expiryTime = 0;
        this.enable = true;
        this.tgId = '';
        this.subId = '';
        this.reset = 0;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    setEmail(email) {
        this.email = email;
        return this;
    }

    setTotalGB(gb) {
        this.totalGB = gb;
        return this;
    }

    setExpiryTime(timestamp) {
        this.expiryTime = timestamp;
        return this;
    }

    setTgId(id) {
        this.tgId = id;
        return this;
    }

    async build() {
        return {
            id: this.id || crypto.randomUUID(),
            flow: this.flow,
            email: this.email || Math.random().toString(36).substring(2, 10),
            limitIp: this.limitIp,
            totalGB: this.totalGB,
            expiryTime: this.expiryTime,
            enable: this.enable,
            tgId: this.tgId,
            subId: this.subId || Math.random().toString(36).substring(2, 18),
            reset: this.reset
        };
    }
}

class RealityBuilder {
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
        const builder = new ClientBuilder(this);
        if (options.id) builder.setId(options.id);
        if (options.email) builder.setEmail(options.email);
        if (options.totalGB) builder.setTotalGB(options.totalGB);
        if (options.expiryTime) builder.setExpiryTime(options.expiryTime);
        if (options.tgId) builder.setTgId(options.tgId);
        this.clients.push(builder);
        return builder;
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
