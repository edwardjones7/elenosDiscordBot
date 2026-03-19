import axios from 'axios';
import { logger } from '../utils/logger';

const log = logger.child({ service: 'MarketService' });

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap?: number;
}

export interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  exchange: string;
}

export async function getCryptoPrice(symbol: string): Promise<CryptoPrice | null> {
  try {
    // Search for the coin by symbol to get its CoinGecko ID
    const searchRes = await axios.get<{ coins: Array<{ id: string; name: string; symbol: string }> }>(
      'https://api.coingecko.com/api/v3/search',
      { params: { query: symbol }, timeout: 8_000 },
    );

    const match = searchRes.data.coins.find(
      (c) => c.symbol.toLowerCase() === symbol.toLowerCase(),
    );
    if (!match) return null;

    const priceRes = await axios.get<Record<string, { usd: number; usd_24h_change: number; usd_market_cap?: number }>>(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: match.id,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
        },
        timeout: 8_000,
      },
    );

    const data = priceRes.data[match.id];
    if (!data) return null;

    return {
      symbol: symbol.toUpperCase(),
      name: match.name,
      price: data.usd,
      change24h: data.usd_24h_change,
      marketCap: data.usd_market_cap,
    };
  } catch (err) {
    log.warn({ err, symbol }, 'Failed to fetch crypto price');
    return null;
  }
}

export async function getStockPrice(symbol: string): Promise<StockPrice | null> {
  try {
    const res = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`,
      {
        params: { interval: '1d', range: '1d' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 8_000,
      },
    );

    const result = res.data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price: number = meta.regularMarketPrice;
    const prevClose: number = meta.chartPreviousClose ?? meta.previousClose;
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: meta.longName ?? meta.shortName ?? symbol.toUpperCase(),
      price,
      change,
      changePercent,
      exchange: meta.exchangeName ?? meta.fullExchangeName ?? '',
    };
  } catch (err) {
    log.warn({ err, symbol }, 'Failed to fetch stock price');
    return null;
  }
}
