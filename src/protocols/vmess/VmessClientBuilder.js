const crypto = require("crypto");
module.exports = class VmessClientBuilder {
    constructor(parent) {
        this.parent = parent;
        this.id = '';
        this.email = '';
        this.limitIp = 0;
        this.totalGB = 0;
        this.expiryTime = 0;
        this.enable = true;
        this.tgId = '';
        this.subId = '';
        this.reset = 0;
        this.security = 'auto';
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

    setSecurity(security) {
        this.security = security;
        return this;
    }

    setLimitIp(limit) {
        this.limitIp = limit;
        return this;
    }

    build() {
        return {
            id: this.id || crypto.randomUUID(),
            email: this.email || Math.random().toString(36).substring(2, 10),
            enable: this.enable,
            expiryTime: this.expiryTime,
            limitIp: this.limitIp,
            reset: this.reset,
            security: this.security,
            subId: this.subId || Math.random().toString(36).substring(2, 18),
            tgId: this.tgId,
            totalGB: this.totalGB
        };
    }

    getLink(host, port) {
        const id = this.id || crypto.randomUUID();
        const email = this.email || Math.random().toString(36).substring(2, 10);

        // Create vmess config object
        const vmessConfig = {
            v: '2',
            ps: email,
            add: host,
            port: port,
            id: id,
            aid: 0,
            net: this.parent.network,
            type: 'none',
            host: this.parent.httpupgradeSettings.host,
            path: this.parent.httpupgradeSettings.path,
            tls: this.parent.security === 'tls' ? 'tls' : 'none',
            sni: this.parent.httpupgradeSettings.host,
            alpn: ''
        };

        // Convert to base64
        const vmessLink = 'vmess://' + Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
        return vmessLink;
    }
}