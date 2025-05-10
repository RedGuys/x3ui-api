import {ClientSettings, InboundConfig} from "../index";
import InboundBuilder from "./IndoundBuilder";

export default class ClientBuilder {
    
    constructor(parent: InboundBuilder | InboundConfig);
    
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
}