import X3UIClient, {ClientSettings, InboundConfig, DeepPartial} from "../../index";
import RealityClientBuilder from "./RealityClientBuilder";

export default class ClearBuilder {

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
    addClient(options?: DeepPartial<ClientSettings>): RealityClientBuilder;

    /**
     * Get connection link for a client
     * @param clientIndex Index of the client (defaults to 0)
     * @param host Optional host address (defaults to listenIP or 'localhost')
     */
    getClientLinkByIndex(clientIndex?: number, host?: string): string;

    /**
     * Get connection link for a client
     * @param email Email of the client
     * @param host Optional host address (defaults to listenIP or 'localhost')
     */
    getClientLinkByEmail(email: string, host?: string): string;

    /**
     * Build the final inbound config
     */
    build(): Promise<InboundConfig>;
}