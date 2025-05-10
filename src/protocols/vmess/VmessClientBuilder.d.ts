import ClientBuilder from "../../core/ClientBuilder";

/**
 * Builder for Vmess client configurations
 */
export default class VmessClientBuilder extends ClientBuilder {
    /**
     * Generate connection link for this client
     * @param host Host address
     * @param port Optional port number, defaults to parent's port
     */
    getLink(host: string, port?: number): string;
}