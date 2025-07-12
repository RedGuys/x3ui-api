const crypto = require("crypto");

module.exports = class ClientBuilder {
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

    build() {
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

module.exports.default = module.exports;
