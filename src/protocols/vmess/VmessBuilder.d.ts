import X3UIClient, { ClientSettings, DeepPartial, InboundConfig } from "../../index";
import VmessClientBuilder from "./VmessClientBuilder";

/**
 * Builder for Vmess inbound configurations
 */
export default class VmessBuilder {

    constructor(client: X3UIClient, inbound?: DeepPartial<InboundConfig>);

    /**
     * Set the port for the inbound. If not provided, will auto-generate unused port
     */
    setPort(port: number): this;

    /**
     * Set the remark/name for the inbound
     */
    setRemark(remark: string): this;

    /**
     * Set the network type (e.g. "httpupgrade", "tcp", "ws")
     */
    setNetwork(network: string): this;

    /**
     * Set security type (e.g. "none", "tls")
     */
    setSecurity(security: string): this;

    /**
     * Set HTTP upgrade path
     */
    setHttpUpgradePath(path: string): this;

    /**
     * Set HTTP upgrade host
     */
    setHttpUpgradeHost(host: string): this;

    /**
     * Configure sniffing settings
     */
    setSniffing(enabled: boolean, destOverride?: string[], metadataOnly?: boolean, routeOnly?: boolean): this;

    /**
     * Set listen IP address. Defaults to empty string
     */
    setListenIP(ip: string): this;

    /**
     * Set inbound expiry time. Defaults to 0 (no expiry)
     */
    setExpiryTime(timestamp: number): this;

    /**
     * Add a new client to the inbound
     */
    addClient(options?: DeepPartial<ClientSettings>): VmessClientBuilder;

    /**
     * Get connection link for a client
     * @param clientIndex Index of the client (defaults to 0)
     * @param host Optional host address (defaults to listenIP or 'localhost')
     */
    getClientLink(clientIndex?: number, host?: string): string;

    /**
     * Generate a random port number
     */
    generateRandomPort(): number;

    /**
     * Build the final inbound config
     */
    build(): Promise<InboundConfig>;
}