const crypto = require("crypto");
const keyUtils = require('./keyUtils');
const ClientBuilder = require('./../../core/ClientBuilder');

module.exports = class WireguardClientBuilder extends ClientBuilder {
    constructor(parent, options) {
        super(parent);
        this.privateKey = options.privateKey || '';
        this.publicKey = options.publicKey || '';
        this.preSharedKey = options.preSharedKey || '';
        this.allowedIPs = options.allowedIPs || ['10.0.0.2/32'];
        this.keepAlive = options.keepAlive || 0;
    }

    setPrivateKey(privateKey) {
        this.privateKey = privateKey;
        return this;
    }

    setPublicKey(publicKey) {
        this.publicKey = publicKey;
        return this;
    }

    setPreSharedKey(preSharedKey) {
        this.preSharedKey = preSharedKey;
        return this;
    }

    setAllowedIPs(allowedIPs) {
        this.allowedIPs = allowedIPs;
        return this;
    }

    setKeepAlive(keepAlive) {
        this.keepAlive = keepAlive;
        return this;
    }

    generatePresharedKey() {
        this.preSharedKey = keyUtils.generatePresharedKey();
        return this;
    }

    generateKeyPair() {
        const keyPair = keyUtils.generateKeyPair();
        this.privateKey = keyPair.privateKey;
        this.publicKey = keyPair.publicKey;
        return this;
    }

    build() {
        const baseConfig = super.build();
        return {
            ...baseConfig,
            privateKey: this.privateKey || '',
            publicKey: this.publicKey || '',
            preSharedKey: this.preSharedKey || '',
            allowedIPs: this.allowedIPs,
            keepAlive: this.keepAlive
        };
    }

    getLink(host, port) {
        // Generate WireGuard client configuration
        const serverPublicKey = this.parent.secretKey ? 
            this.parent.publicKey : 
            'MISSING_SERVER_PUBLIC_KEY';

        const config = [
            '[Interface]',
            `PrivateKey = ${this.privateKey}`,
            `Address = ${this.allowedIPs[0]}`,
            'DNS = 1.1.1.1, 1.0.0.1',
            `MTU = ${this.parent.mtu || 1420}`,
            '',
            `# ${this.parent.remark || 'WireGuard'}-${this.email || 'default'}`,
            '[Peer]',
            `PublicKey = ${serverPublicKey}`,
            'AllowedIPs = 0.0.0.0/0, ::/0',
            `Endpoint = ${host}:${port}`,
            this.preSharedKey ? `PresharedKey = ${this.preSharedKey}` : '',
        ].filter(Boolean).join('\n');

        // Return the configuration as a data URI
        return config;
    }
}

module.exports.default = module.exports;
