/**
 * Type definitions for WireguardClientBuilder
 * Provides functionality for building WireGuard client configurations
 */
import ClientBuilder from '../../core/ClientBuilder';

/**
 * WireguardClientBuilder class for creating and managing WireGuard client configurations
 * Extends the base ClientBuilder to provide WireGuard-specific functionality
 */
export default class WireguardClientBuilder extends ClientBuilder {
    /**
     * Creates a new WireguardClientBuilder instance
     * @param parent - The parent object that owns this builder
     * @param options - Optional client settings
     */
    constructor(parent: any, options?: any);

    /**
     * Sets the client's private key
     * @param privateKey - The WireGuard private key in base64 format
     * @returns The builder instance for method chaining
     */
    setPrivateKey(privateKey: string): this;
    
    /**
     * Sets the server's public key
     * @param publicKey - The WireGuard public key in base64 format
     * @returns The builder instance for method chaining
     */
    setPublicKey(publicKey: string): this;
    
    /**
     * Sets the pre-shared key for additional security
     * @param preSharedKey - The pre-shared key in base64 format
     * @returns The builder instance for method chaining
     */
    setPreSharedKey(preSharedKey: string): this;
    
    /**
     * Sets the allowed IP addresses/ranges for routing through the tunnel
     * @param allowedIPs - Array of IP addresses/ranges in CIDR notation
     * @returns The builder instance for method chaining
     */
    setAllowedIPs(allowedIPs: string[]): this;
    
    /**
     * Sets the persistent keepalive interval
     * @param keepAlive - Interval in seconds between keepalive packets
     * @returns The builder instance for method chaining
     */
    setKeepAlive(keepAlive: number): this;

    /**
     * Generates a random pre-shared key
     * @returns The builder instance for method chaining
     */
    generatePresharedKey(): this;

    /**
     * Generates a new public/private key pair
     * @returns The builder instance for method chaining
     */
    generateKeyPair(): this;

    /**
     * Builds and returns the complete WireGuard client configuration
     * @returns The WireGuard client configuration object
     */
    build(): any;
    
    /**
     * Generates a WireGuard connection URI/link for easy client configuration
     * @param host - The server hostname or IP address
     * @param port - The server port number
     * @returns A WireGuard connection URI string
     */
    getLink(host: string, port: number): string;
}
