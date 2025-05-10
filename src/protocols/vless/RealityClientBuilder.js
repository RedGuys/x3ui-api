const ClientBuilder = require('../../core/ClientBuilder');

module.exports = class RealityClientBuilder extends ClientBuilder {
    getLink(host, port) {
        const id = this.id || crypto.randomUUID();
        const settings = this.parent.streamSettings?.realitySettings;
        if (!settings) throw new Error('Reality settings not found');

        port = port || this.parent.port;
        let protocol = this.parent.protocol || 'vless';

        const params = new URLSearchParams({
            security: this.parent.streamSettings?.security || 'reality',
            sni: settings.serverNames[0],
            fp: settings.settings.fingerprint,
            pbk: settings.settings.publicKey,
            sid: settings.shortIds[0],
            spx: settings.settings.spiderX || '/',
            type: this.parent.streamSettings?.network || 'tcp',
            encryption: this.parent.settings?.decryption || 'none'
        });

        return `${protocol}://${id}@${host}:${port}?${params.toString()}#${encodeURIComponent(this.email || 'default')}`;
    }
}