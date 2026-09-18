import { API_BASE_URL } from "./config";

let productsCache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export async function getProducts({ category = "", force = false } = {}) {
  // Use in-memory cache if requesting all products and cache is still fresh
  if (!category && !force && productsCache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return productsCache;
  }

  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${API_BASE_URL}/api/products${query}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();

  if (!category) {
    productsCache = data;
    cacheTime = Date.now();
  }
  return data;
}

export async function getProductById(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

export function invalidateProductCache() {
  productsCache = null;
  cacheTime = 0;
}
