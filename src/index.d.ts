import {AxiosInstance} from 'axios';

export interface X3UIConfig {
    baseURL: string;
    token?: string;
    parseJSONSettings?: boolean;
}

export interface LoginResponse {
    success: boolean;
    msg: string;
    obj: any;
}

export interface InboundConfig {
    id?: number;
    up: number;
    down: number;
    total: number;
    remark: string;
    enable: boolean;
    expiryTime: number | null;
    clientStats: ClientStats[];
    listen: string;
    port: number;
    protocol: string;
    settings: string | InboundSettings;
    streamSettings: string | StreamSettings;
    tag: string;
    sniffing: string | SniffingSettings;
    allocate: string | AllocateSettings;
}

export interface AllocateSettings {
    strategy: string;
    refresh: number;
    concurrency: number;
}

export interface SniffingSettings {
    enabled: boolean;
    destOverride: string[];
    metadataOnly: boolean;
    routeOnly: boolean;
}

export interface StreamSettings {
    network: string;
    security: string;
    externalProxy: any[];
    realitySettings: RealitySettings;
    tcpSettings?: TCPSettings;
}

export interface TCPSettings {
    acceptProxyProtocol: boolean;
    header: {
        type: string;
    }
}

export interface RealitySettings {
    show: boolean;
    xver: number;
    dest: string;
    serverNames: string[];
    privateKey: string;
    minClient: string;
    maxClient: string;
    maxTimediff: number;
    shortIds: string[];
    settings: {
        publicKey: string;
        fingerprint: string;
        serverName: string;
        spiderX: string;
    }
}

export interface InboundSettings {
    clients: ClientSettings[];
    decryption: string;
    fallbacks: any[];
}

export interface ClientSettings {
    id: string;
    flow: string;
    email: string;
    limitIp: number;
    totalGB: number;
    expiryTime: number | null;
    enable: boolean;
    tgId: string;
    subId: string;
    reset: number;
}

export interface ClientStats {
    id: number;
    inboundId: number;
    enable: boolean;
    email: string;
    up: number;
    down: number;
    expiryTime: number | null;
    total: number;
    reset: number;
}

export interface SystemStats {
    cpu: number;
    cpuCores: number;
    logicalPro: number;
    cpuSpeedMhz: number;
    mem: {
        current: number;
        total: number;
    };
    swap: {
        current: number;
        total: number;
    }
    disk: {
        current: number;
        total: number;
    };
    xray: {
        state: boolean;
        errorMsg: string;
        version: string;
    };
    uptime: number;
    loads: number[];
    tcpCount: number;
    udpCount: number;
    netIO: {
        up: number;
        down: number;
    };
    netTraffic: {
        up: number;
        down: number;
    };
    publicIP: {
        ipv4: string;
        ipv6: string;
    }
    appStats: {
        threads: number;
        mem: number;
        uptime: number;
    }
}

export interface RealityInboundOptions {
    remark: string;
    port?: number;
    dest?: string;
    serverNames?: string[];
    privateKey?: string;
    publicKey?: string;
    shortIds?: string[];
    fingerprint?: string;
    listenIP?: string;
    expiryTime?: number;
}

export interface ClientOptions {
    id?: string;
    email?: string;
    totalGB?: number;
    expiryTime?: number;
    tgId?: string;
}

export interface ClientBuilder {
    /**
     * Set client UUID. If not provided, will be auto-generated
     */
    setId(id: string): this;

    /**
     * Set client email
     */
    setEmail(email: string): this;

    /**
     * Set total traffic limit in GB
     */
    setTotalGB(gb: number): this;

    /**
     * Set expiry time in unix timestamp
     */
    setExpiryTime(timestamp: number): this;

    /**
     * Set Telegram ID
     */
    setTgId(id: string): this;

    /**
     * Build the client configuration
     */
    build(): ClientSettings;

    /**
     * Generate connection link for this client
     * @param host Host address
     * @param port Optional port number, defaults to parent's port
     * @param protocol Optional protocol, defaults to parent's protocol or 'vless'
     */
    getLink(host: string, port?: number, protocol?: string): string;
}

export interface RealityBuilder {
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

export default class X3UIClient {
    private client: AxiosInstance;

    constructor(config: X3UIConfig);

    login(username: string, password: string): Promise<LoginResponse>;

    getSystemStats(): Promise<SystemStats>;

    getInbounds(): Promise<InboundConfig[]>;

    addInbound(config: Omit<InboundConfig, 'id'>): Promise<InboundConfig>;

    updateInbound(id: number, config: Partial<InboundConfig>): Promise<void>;

    deleteInbound(id: number): Promise<void>;

    getInboundTraffic(id: number): Promise<{ up: number; down: number }>;

    resetInboundTraffic(id: number): Promise<void>;

    getNewX25519Cert(): Promise<{ privateKey: string; publicKey: string }>;

    /**
     * Create a new Reality inbound builder
     */
    createRealityBuilder(options?: Partial<InboundConfig>): RealityBuilder;
}
