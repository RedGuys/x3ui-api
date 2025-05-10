const axios = require("axios");

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
            inbound.settings = inbound.settings && inbound.settings.length > 0 ? JSON.parse(inbound.settings) : {};
            inbound.streamSettings = inbound.streamSettings && inbound.streamSettings.length > 0 ? JSON.parse(inbound.streamSettings) : {};
            inbound.sniffing = inbound.sniffing && inbound.sniffing.length > 0 ? JSON.parse(inbound.sniffing) : {};
            inbound.allocate = inbound.allocate && inbound.allocate.length > 0 ? JSON.parse(inbound.allocate) : {};
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
}