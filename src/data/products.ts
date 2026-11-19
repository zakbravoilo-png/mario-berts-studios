import type { ShopProduct } from '../types/domain'

/**
 * Shop catalog — provided by the user (2026-11-16): strings (brand + prices) and
 * drumsticks (₱300; brand and size not given). Stock, gauges/sizes and
 * pickup/delivery are NOT confirmed (stock null = "TBD").
 * The shop stays inquiry-first: no online checkout or payment.
 */
const BRAND = 'Kuting-Kuting Music City Strings'

export const seedProducts: ShopProduct[] = [
  { id: 'str-acoustic', name: 'Acoustic guitar strings', brand: BRAND, category: 'acoustic-strings', description: 'Gauge to be confirmed by the studio.', price: 200, stock: null, isDemo: false, active: true, outOfStock: false },
  { id: 'str-electric', name: 'Electric guitar strings', brand: BRAND, category: 'electric-strings', description: 'Gauge to be confirmed by the studio.', price: 200, stock: null, isDemo: false, active: true, outOfStock: false },
  { id: 'str-bass', name: 'Bass guitar strings', brand: BRAND, category: 'bass-strings', description: 'Gauge to be confirmed by the studio.', price: 600, stock: null, isDemo: false, active: true, outOfStock: false },
  { id: 'drumsticks', name: 'Drumsticks', brand: null, category: 'drumsticks', description: 'Brand and size to be confirmed by the studio.', price: 300, stock: null, isDemo: false, active: true, outOfStock: false },
]
