import X3UIClient, {ClientSettings, InboundConfig} from "../../index";
import ClientBuilder from "../../core/ClientBuilder";

export default class RealityBuilder {

    constructor(client: X3UIClient, inbound?: Partial<InboundConfig>);

    /**
     * Set the port for the inbound. If not provided, will auto-generate unused port
     */
    setPort(port: number): this;

    /**
     * Set the remark/name for the inbound
     */
    setRemark(remark: string): this;

    /**
     * Set the destination address (e.g. "yahoo.com:443")
     */
    setDest(dest: string): this;

    /**
     * Set server names for SNI
     */
    setServerNames(names: string[]): this;

    /**
     * Set Reality keypair. If not provided, will be auto-generated
     */
    setKeyPair(privateKey: string, publicKey: string): this;

    /**
     * Set short IDs for Reality. If not provided, random ones will be generated
     */
    setShortIds(ids: string[]): this;

    /**
     * Set browser fingerprint. Defaults to "chrome"
     */
    setFingerprint(fingerprint: string): this;

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
    addClient(options?: Partial<ClientSettings>): ClientBuilder;

    /**
     * Get connection link for a client
     * @param clientIndex Index of the client (defaults to 0)
     * @param host Optional host address (defaults to listenIP or 'localhost')
     */
    getClientLink(clientIndex?: number, host?: string): string;

    /**
     * Build the final inbound config
     */
    build(): Promise<InboundConfig>;
}