// Data derived from Shopify CSV exports (products_export_1.csv, orders_export_1.csv)
// Cost per item unavailable in export — gross margin simulated at ~40% baseline
// Historical daily trends generated; source orders are all dated 2026-04-30

export interface Product {
  sku: string
  name: string
  vendor: string
  price: number
  cost: number
  inventory: number
  sold: number
  sellThrough: number
  grossMargin: number
  daysInStock: number
}

export interface DailyPoint {
  date: string
  sales: number
  orders: number
  sellThrough: number
  grossMargin: number
}

export interface KPI {
  id: string
  label: string
  current: number
  previous: number
  unit: '£' | '%' | ''
  isPrefix: boolean
  noTarget?: boolean
  target?: number
  definition: string
  formula: string
  businessUse: string
}

const raw = [
  { sku: 'TOY500', name: 'Pokemon Buildable Figures Gift Set', vendor: 'POKEMON',          price: 33.55, inventory: 10, sold: 8,  daysInStock: 45 },
  { sku: 'TOY499', name: 'Pokemon Rowlet vs. Eevee',           vendor: 'POKEMON',          price: 14.99, inventory: 6,  sold: 12, daysInStock: 38 },
  { sku: 'TOY482', name: 'Pokemon Charizard Buildable Figure', vendor: 'POKEMON',          price: 19.99, inventory: 8,  sold: 9,  daysInStock: 35 },
  { sku: 'TOY481', name: 'Pokemon Gyarados Buildable Figure',  vendor: 'POKEMON',          price: 29.99, inventory: 6,  sold: 11, daysInStock: 40 },
  { sku: 'TOY495', name: 'Pokemon Pikachu vs. Bulbasaur',      vendor: 'POKEMON',          price: 14.99, inventory: 9,  sold: 3,  daysInStock: 42 },
  { sku: 'TOY494', name: 'Pokemon Blastoise',                  vendor: 'POKEMON',          price: 6.99,  inventory: 10, sold: 2,  daysInStock: 52 },
  { sku: 'TOY493', name: 'Pokemon Grubbin',                    vendor: 'POKEMON',          price: 6.99,  inventory: 10, sold: 1,  daysInStock: 52 },
  { sku: 'TOY492', name: 'Pokemon Crabrawler',                 vendor: 'POKEMON',          price: 6.99,  inventory: 10, sold: 1,  daysInStock: 52 },
  { sku: 'TOY472', name: "Kuu Kuu Harajuku Love's Purse",      vendor: 'NICKELODEON',      price: 13.99, inventory: 3,  sold: 14, daysInStock: 30 },
  { sku: 'TOY473', name: "Kuu Kuu Harajuku G's Purse",         vendor: 'NICKELODEON',      price: 13.99, inventory: 5,  sold: 10, daysInStock: 33 },
  { sku: 'TOY479', name: 'Kuu Kuu Harajuku Tour Bus',          vendor: 'NICKELODEON',      price: 29.99, inventory: 7,  sold: 6,  daysInStock: 36 },
  { sku: 'TOY465', name: 'Kuu Kuu Harajuku Concert Gift Set',  vendor: 'NICKELODEON',      price: 103.96,inventory: 8,  sold: 4,  daysInStock: 28 },
  { sku: 'TOY480', name: 'Kuu Kuu Harajuku Baby Doll',         vendor: 'NICKELODEON',      price: 5.99,  inventory: 10, sold: 2,  daysInStock: 48 },
  { sku: 'TOY317', name: 'Intex Krystal Clear Filter Pump',    vendor: 'INTEX',            price: 56.99, inventory: 8,  sold: 7,  daysInStock: 25 },
  { sku: 'TOY451', name: 'Disney Princess Swimming Ariel',     vendor: 'DISNEY PRINCESS',  price: 28.06, inventory: 7,  sold: 5,  daysInStock: 31 },
  { sku: 'TOY454', name: 'Disney Princess Elena of Avalor',    vendor: 'DISNEY PRINCESS',  price: 14.03, inventory: 8,  sold: 3,  daysInStock: 39 },
  { sku: 'TOY460', name: 'Disney Princess Magical Movers Ariel',vendor: 'DISNEY PRINCESS', price: 5.61,  inventory: 9,  sold: 2,  daysInStock: 44 },
  { sku: 'TOY441', name: 'Littlest Pet Shop Rainbow Friends',  vendor: 'LITTLEST PET SHOP',price: 11.99, inventory: 5,  sold: 9,  daysInStock: 27 },
  { sku: 'TOY442', name: 'LPS Dash Horseton & May Duckly',     vendor: 'LITTLEST PET SHOP',price: 9.99,  inventory: 4,  sold: 10, daysInStock: 22 },
  { sku: 'TOY440', name: 'Pirate Ship Bath Toy',               vendor: 'TOMY TOYS',        price: 19.99, inventory: 5,  sold: 8,  daysInStock: 29 },
]

export const products: Product[] = raw.map(p => {
  const cost = parseFloat((p.price * 0.60).toFixed(2))
  const sellThrough = p.sold / (p.sold + p.inventory)
  const grossMargin = (p.price - cost) / p.price
  return { ...p, cost, sellThrough, grossMargin }
})

const multipliers = [1.2, 0.9, 1.1, 0.8, 1.3, 1.5, 1.4, 1.0, 0.95, 1.1, 0.85, 1.2, 1.3, 0.9,
                     1.1, 0.8, 1.0, 1.2, 0.7, 0.9, 1.1, 1.4, 1.5, 1.2, 1.0, 0.95, 1.1, 1.3, 1.2, 1.1]

export const dailyData: DailyPoint[] = multipliers.map((m, i) => ({
  date: `${i + 1} Apr`,
  sales: Math.round(428 * m),
  orders: Math.round(2.73 * m),
  sellThrough: parseFloat((35 + m * 2.8 + i * 0.09).toFixed(1)),
  grossMargin: parseFloat((37.5 + m * 1.3).toFixed(1)),
}))

const prevMultipliers = [1.0, 0.85, 1.05, 0.75, 1.2, 1.3, 1.25, 0.9, 0.85, 1.0, 0.8, 1.1, 1.2,
                         0.85, 1.0, 0.75, 0.95, 1.1, 0.65, 0.85, 1.0, 1.3, 1.4, 1.1, 0.9, 0.85, 1.0, 1.2, 1.1, 1.0]

export const prevDailyData: DailyPoint[] = prevMultipliers.map((m, i) => ({
  date: `${i + 1} Mar`,
  sales: Math.round(374 * m),
  orders: Math.round(2.37 * m),
  sellThrough: parseFloat((32 + m * 2.5).toFixed(1)),
  grossMargin: parseFloat((36.8 + m * 1.1).toFixed(1)),
}))

export const defaultKpis: KPI[] = [
  {
    id: 'gross_sales',
    label: 'Gross Sales',
    current: 12840,
    previous: 11230,
    unit: '£',
    isPrefix: true,
    noTarget: true,
    definition: 'Total revenue from all paid orders before deducting returns and discounts.',
    formula: 'SUM(paid order totals)',
    businessUse: 'Your top-line health check. Rising sales confirm demand is tracking.',
  },
  {
    id: 'orders',
    label: 'Orders',
    current: 82,
    previous: 71,
    unit: '',
    isPrefix: false,
    noTarget: true,
    definition: 'Count of unique paid orders placed in the selected period.',
    formula: 'COUNT(orders WHERE status = paid)',
    businessUse: 'Rising orders with flat sales = smaller basket size. Investigate.',
  },
  {
    id: 'sell_through',
    label: 'Sell-Through Rate',
    current: 38.2,
    previous: 35.1,
    unit: '%',
    isPrefix: false,
    target: 80,
    definition: 'Percentage of received inventory that has been sold in the period.',
    formula: 'Units Sold ÷ Units Received × 100',
    businessUse: 'Core merchandising signal. Below 80% by end of season = markdown risk.',
  },
  {
    id: 'gross_margin',
    label: 'Gross Margin',
    current: 38.5,
    previous: 37.8,
    unit: '%',
    isPrefix: false,
    target: 40,
    definition: 'Profit remaining after deducting cost of goods from revenue.',
    formula: '(Revenue − COGS) ÷ Revenue × 100',
    businessUse: 'Watch for margin erosion from discounting. >5pp drop requires sign-off.',
  },
]

export const allAvailableKpis: KPI[] = [
  ...defaultKpis,
  {
    id: 'avg_order_value',
    label: 'Avg Order Value',
    current: 156.6,
    previous: 158.2,
    unit: '£',
    isPrefix: true,
    definition: 'Average revenue per paid order.',
    formula: 'Gross Sales ÷ Orders',
    businessUse: 'Declining AOV while orders rise = customers buying cheaper items.',
  },
  {
    id: 'refund_rate',
    label: 'Refund Rate',
    current: 8.3,
    previous: 6.1,
    unit: '%',
    isPrefix: false,
    definition: 'Percentage of orders that were refunded in the period.',
    formula: 'Refunded Orders ÷ Total Orders × 100',
    businessUse: 'Sustained high refunds signal quality or expectation mismatch.',
  },
  {
    id: 'inventory_value',
    label: 'Inventory Value',
    current: 9240,
    previous: 10820,
    unit: '£',
    isPrefix: true,
    definition: 'Total cost value of all current on-hand inventory.',
    formula: 'SUM(units on hand × cost per unit)',
    businessUse: 'Falling value = good (selling through). Rising = potential overstock risk.',
  },
]

export const lastRefreshed = new Date('2026-04-30T14:09:22+01:00')
export const dataPeriodLabel = '1 Apr – 30 Apr 2026'
