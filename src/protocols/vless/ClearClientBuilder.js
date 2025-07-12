const ClientBuilder = require('../../core/ClientBuilder');

module.exports = class ClearClientBuilder extends ClientBuilder {
    getLink(host, port) {
        const id = this.id || crypto.randomUUID();

        port = port || this.parent.port;
        let protocol = this.parent.protocol || 'vless';

        const params = new URLSearchParams({
            security: this.parent.streamSettings?.security || 'none',
            type: this.parent.streamSettings?.network || 'tcp',
            encryption: this.parent.settings?.decryption || 'none'
        });

        return `${protocol}://${id}@${host}:${port}?${params.toString()}#${encodeURIComponent(this.email || 'default')}`;
    }
}

module.exports.default = module.exports;
