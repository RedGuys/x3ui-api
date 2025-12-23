import X3UIClient from "./core/X3UIClient";

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export default X3UIClient;

export interface X3UIConfig {
    baseURL: string;
    token?: string;
    username?: string;
    password?: string;
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
    settings: InboundSettings;
    streamSettings: StreamSettings;
    tag: string;
    sniffing: SniffingSettings;
    allocate: AllocateSettings;
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
    realitySettings?: RealitySettings;
    tcpSettings?: TCPSettings;
    httpupgradeSettings?: HttpUpgradeSettings;
}

export interface HttpUpgradeSettings {
    acceptProxyProtocol: boolean;
    path: string;
    host: string;
    headers: Record<string, string>;
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
    flow?: string;
    security?: string;
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

export interface ClientOptions {
    id?: string;
    email?: string;
    totalGB?: number;
    expiryTime?: number;
    tgId?: string;
}
