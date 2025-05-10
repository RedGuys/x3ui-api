import {AxiosInstance} from "axios";
import {
    InboundConfig,
    LoginResponse,
    SystemStats,
    X3UIConfig
} from "../index";

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
}