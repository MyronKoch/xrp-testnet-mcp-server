/**
 * Type Definitions for XRP MCP Server
 * MBSS v3.0 Compliant Type System
 */

import { Client, Wallet, Transaction, LedgerEntry } from 'xrpl';
import { z } from 'zod';

// Network Types
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export interface NetworkConfig {
  name: string;
  url: string;
  explorer: string;
  faucet: string | null;
}

// Tool Response Types
export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Common Input Schemas
export const AddressSchema = z.string().regex(
  /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  'Invalid XRP address format'
);

export const AmountSchema = z.union([
  z.string().regex(/^\d+(\.\d{1,6})?$/),
  z.number().positive()
]);

export const CurrencySchema = z.union([
  z.literal('XRP'),
  z.string().regex(/^[A-Z]{3}$/),
  z.string().regex(/^[A-F0-9]{40}$/)
]);

export const HashSchema = z.string().regex(
  /^[A-F0-9]{64}$/,
  'Invalid transaction hash'
);

export const NetworkSchema = z.enum(['mainnet', 'testnet', 'devnet']);

// Tool Input Types
export interface GetBalanceInput {
  address: string;
  currency?: string;
  issuer?: string;
}

export interface GetTransactionInput {
  hash: string;
  includeMeta?: boolean;
}

export interface GetBlockInput {
  ledgerIndex?: number;
  ledgerHash?: string;
  includeTransactions?: boolean;
}

export interface SendTransactionInput {
  from?: string;
  to: string;
  amount: string;
  currency?: string;
  issuer?: string;
  memo?: string;
  destinationTag?: number;
  secret?: string;
}

export interface CreateWalletInput {
  algorithm?: 'ed25519' | 'secp256k1';
}

export interface ImportWalletInput {
  seed?: string;
  secret?: string;
  mnemonic?: string;
}

export interface CreateTrustlineInput {
  account?: string;
  currency: string;
  issuer: string;
  limit: string;
  secret?: string;
}

export interface NFTInput {
  account?: string;
  uri?: string;
  flags?: number;
  transferFee?: number;
  taxon?: number;
  secret?: string;
}

// Response Types
export interface AccountInfo {
  address: string;
  balance: string;
  sequence: number;
  flags: number;
  ownerCount: number;
  previousTxnID?: string;
  previousTxnLgrSeq?: number;
}

export interface TransactionInfo {
  hash: string;
  type: string;
  account: string;
  destination?: string;
  amount?: any;
  fee: string;
  sequence: number;
  flags?: number;
  memos?: any[];
  validated: boolean;
  meta?: any;
  result?: string;
}

export interface BlockInfo {
  ledgerHash: string;
  ledgerIndex: number;
  closeTime: number;
  closeTimeHuman: string;
  parentHash: string;
  totalDrops: string;
  transactionCount: number;
  transactions?: TransactionInfo[];
}

export interface TokenBalance {
  currency: string;
  issuer: string;
  balance: string;
  limit?: string;
  noRipple?: boolean;
  frozen?: boolean;
}

export interface NFTInfo {
  nftID: string;
  owner: string;
  uri?: string;
  flags: number;
  transferFee?: number;
  taxon: number;
  sequence: number;
}

export interface ServerInfo {
  buildVersion: string;
  completeLedgers: string;
  hostID: string;
  ioLatencyMs: number;
  lastClose: {
    convergeTimeS: number;
    proposers: number;
  };
  loadFactor: number;
  peers: number;
  pubkeyNode: string;
  serverState: string;
  validatedLedger: {
    age: number;
    baseFeeXRP: string;
    hash: string;
    reserveBaseXRP: string;
    reserveIncrementXRP: string;
    ledgerIndex: number;
  };
  validationQuorum: number;
}

// Error Types
export interface XRPError extends Error {
  code: string;
  details?: any;
}

// Tool Registry Types
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  category?: string;
  aliases?: string[];
}

export interface ToolHandler {
  (args: any): Promise<ToolResponse>;
}

// Client Types
export interface XRPClientInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  ensureConnection(): Promise<void>;
  getClient(): Client;
  getNetwork(): string;
  getUrl(): string;
  isConnected(): boolean;
  isHealthy(): Promise<boolean>;
  switchNetwork(network: NetworkType): Promise<void>;
  getNetworkInfo(): Promise<any>;
}

// Validation Helpers
export function validateAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
}

export function validateHash(hash: string): boolean {
  return /^[A-F0-9]{64}$/.test(hash);
}

export function validateCurrency(currency: string): boolean {
  return currency === 'XRP' || 
         /^[A-Z]{3}$/.test(currency) || 
         /^[A-F0-9]{40}$/.test(currency);
}

export function dropsToXRP(drops: string | bigint): string {
  const dropsBigInt = typeof drops === 'string' ? BigInt(drops) : drops;
  return (Number(dropsBigInt) / 1_000_000).toFixed(6).replace(/\.?0+$/, '');
}

export function xrpToDrops(xrp: string | number): string {
  const xrpNumber = typeof xrp === 'string' ? parseFloat(xrp) : xrp;
  return Math.floor(xrpNumber * 1_000_000).toString();
}
