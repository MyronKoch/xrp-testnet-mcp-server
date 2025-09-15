/**
 * XRP Ledger Client Wrapper
 * MBSS v3.0 Compliant Client Abstraction
 */

import { Client, Wallet } from 'xrpl';

export class XRPClient {
  private client: Client;
  private network: 'mainnet' | 'testnet' | 'devnet';
  private url: string;
  private connected: boolean = false;

  constructor(network: 'mainnet' | 'testnet' | 'devnet' = 'testnet') {
    this.network = network;
    this.url = this.getNetworkUrl(network);
    this.client = new Client(this.url);
  }

  private getNetworkUrl(network: 'mainnet' | 'testnet' | 'devnet'): string {
    switch (network) {
      case 'mainnet':
        return process.env.XRP_MAINNET_URL || 'wss://s1.ripple.com';
      case 'testnet':
        return process.env.XRP_TESTNET_URL || 'wss://s.altnet.rippletest.net:51233';
      case 'devnet':
        return process.env.XRP_DEVNET_URL || 'wss://s.devnet.rippletest.net:51233';
      default:
        return 'wss://s.altnet.rippletest.net:51233';
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      await this.client.connect();
      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect to XRP Ledger: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    await this.client.disconnect();
    this.connected = false;
  }

  async ensureConnection(): Promise<void> {
    if (!this.connected || !this.client.isConnected()) {
      await this.connect();
    }
  }

  getClient(): Client {
    return this.client;
  }

  getNetwork(): string {
    return this.network;
  }

  getUrl(): string {
    return this.url;
  }

  isConnected(): boolean {
    return this.connected && this.client.isConnected();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.ensureConnection();
      const response = await this.client.request({
        command: 'server_info'
      });
      return response.result.info.server_state === 'full' || 
             response.result.info.server_state === 'validating' ||
             response.result.info.server_state === 'proposing';
    } catch {
      return false;
    }
  }

  async switchNetwork(network: 'mainnet' | 'testnet' | 'devnet'): Promise<void> {
    await this.disconnect();
    this.network = network;
    this.url = this.getNetworkUrl(network);
    this.client = new Client(this.url);
    await this.connect();
  }

  async getNetworkInfo(): Promise<any> {
    await this.ensureConnection();
    const [serverInfo, serverState, fee] = await Promise.all([
      this.client.request({ command: 'server_info' }),
      this.client.request({ command: 'server_state' }),
      this.client.request({ command: 'fee' })
    ]);

    return {
      network: this.network,
      url: this.url,
      connected: this.connected,
      serverInfo: serverInfo.result.info,
      serverState: serverState.result.state,
      fees: fee.result
    };
  }
}

// Singleton instance
let clientInstance: XRPClient | null = null;

export function getXRPClient(): XRPClient {
  if (!clientInstance) {
    const network = (process.env.XRP_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet';
    clientInstance = new XRPClient(network);
  }
  return clientInstance;
}
