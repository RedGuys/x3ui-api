import WireguardClientBuilder from './WireguardClientBuilder';
import { ClientSettings, DeepPartial } from "../../index";

/**
 * WireguardBuilder class for creating and managing Wireguard server configurations.
 * This builder provides a fluent interface for setting up Wireguard servers and managing clients.
 */
export default class WireguardBuilder {
    /**
     * Creates a new WireguardBuilder instance.
     * @param client - The client connection or context to use for building the configuration
     * @param options - Optional configuration parameters for the Wireguard server
     */
    constructor(client: any, options?: any);

    /**
     * Sets the port for the Wireguard server.
     * @param port - The port number to listen on
     * @returns The current builder instance for method chaining
     */
    setPort(port: number): this;
    
    /**
     * Sets a descriptive remark for the Wireguard server.
     * @param remark - The remark or name for this server
     * @returns The current builder instance for method chaining
     */
    setRemark(remark: string): this;
    
    /**
     * Sets the Maximum Transmission Unit (MTU) size.
     * @param mtu - The MTU value in bytes
     * @returns The current builder instance for method chaining
     */
    setMtu(mtu: number): this;
    
    /**
     * Sets the server's private key.
     * @param secretKey - The Wireguard private key in base64 format
     * @returns The current builder instance for method chaining
     */
    setSecretKey(secretKey: string): this;
    
    /**
     * Configures whether to use kernel TUN interface or userspace implementation.
     * @param noKernelTun - If true, uses userspace implementation instead of kernel TUN
     * @returns The current builder instance for method chaining
     */
    setNoKernelTun(noKernelTun: boolean): this;
    
    /**
     * Configures traffic sniffing options.
     * @param enabled - Whether sniffing is enabled
     * @param destOverride - Array of protocols to override destination with sniffed value
     * @param metadataOnly - If true, only sniffs metadata
     * @param routeOnly - If true, only uses sniffed information for routing
     * @returns The current builder instance for method chaining
     */
    setSniffing(enabled: boolean, destOverride?: string[], metadataOnly?: boolean, routeOnly?: boolean): this;
    
    /**
     * Sets the IP address the server listens on.
     * @param ip - The IP address to bind to
     * @returns The current builder instance for method chaining
     */
    setListenIP(ip: string): this;
    
    /**
     * Sets the expiration time for the server configuration.
     * @param timestamp - Unix timestamp when the configuration expires
     * @returns The current builder instance for method chaining
     */
    setExpiryTime(timestamp: number): this;
    
    /**
     * Creates and adds a new client to this Wireguard server.
     * @param options - Optional client settings
     * @returns A new WireguardClientBuilder instance for configuring the client
     */
    addClient(options?: DeepPartial<ClientSettings>): WireguardClientBuilder;
    
    /**
     * Generates a connection link for a client.
     * @param clientIndex - Index of the client (default: 0)
     * @param host - Host address to use in the link (defaults to server address)
     * @param port - Port to use in the link (defaults to server port)
     * @returns A formatted connection link string
     */
    getClientLink(clientIndex?: number, host?: string, port?: number): string;
    
    /**
     * Generates a configuration file for a client.
     * @param clientIndex - Index of the client (default: 0)
     * @param host - Host address to use in the config (defaults to server address)
     * @param port - Port to use in the config (defaults to server port)
     * @returns A formatted configuration file content as string
     */
    getClientConfig(clientIndex?: number, host?: string, port?: number): string;
    
    /**
     * Generates a random port number for the Wireguard server.
     * @returns A random port number
     */
    generateRandomPort(): number;
    
    /**
     * Derives the public key from a given private key.
     * @param secretKey - The Wireguard private key in base64 format
     * @returns The corresponding public key in base64 format
     */
    derivePublicKey(secretKey: string): string;
    
    /**
     * Builds and finalizes the Wireguard server configuration.
     * @returns A Promise that resolves to the built configuration
     */
    build(): Promise<any>;
}
