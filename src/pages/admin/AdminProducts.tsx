import { useState } from 'react'
import { useDemoState } from '../../services/demoStore'
import { adminUpdateProduct, setShopInquiryStatus } from '../../services/actions'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { Callout } from '../../components/ui/Callout'
import { AdminButton, Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import { shopCategories } from '../../data/services'
import type { InquiryStatus, ShopProduct } from '../../types/domain'
import { formatDate } from '../../utils/time'

function ProductRow({ p }: { p: ShopProduct }) {
  const [d, setD] = useState({ name: p.name, price: p.price === null ? '' : String(p.price), stock: p.stock === null ? '' : String(p.stock), active: p.active })
  const [err, setErr] = useState<string | null>(null)
  function save() {
    const price = d.price.trim() === '' ? null : Number(d.price)
    const stock = d.stock.trim() === '' ? null : Number(d.stock)
    if ((price !== null && (!Number.isInteger(price) || price < 0)) || (stock !== null && (!Number.isInteger(stock) || stock < 0))) return setErr('Whole numbers only, or leave blank for TBD.')
    if (!d.name.trim()) return setErr('Name is required.')
    setErr(null)
    adminUpdateProduct({ ...p, name: d.name.trim(), price, stock, active: d.active })
  }
  return (
    <tr>
      <Td><input aria-label="Product name" className={`${adminInput} w-full min-w-56`} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />{p.isDemo && <span className="mt-1 block"><span className="demo-chip">Demo</span></span>}{p.brand && <span className="mt-1 block text-xs text-muted">{p.brand}</span>}</Td>
      <Td>{shopCategories.find((c) => c.id === p.category)?.label}</Td>
      <Td><input aria-label={`Price for ${p.name} in pesos`} inputMode="numeric" className={`${adminInput} w-24`} value={d.price} placeholder="TBD" onChange={(e) => setD({ ...d, price: e.target.value })} /></Td>
      <Td><input aria-label={`Stock for ${p.name}`} inputMode="numeric" className={`${adminInput} w-20`} value={d.stock} placeholder="TBD" onChange={(e) => setD({ ...d, stock: e.target.value })} /></Td>
      <Td><label className="flex items-center gap-1.5"><input type="checkbox" className="size-4 accent-[var(--color-rust)]" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} /> Listed</label></Td>
      <Td><AdminButton onClick={save}>Save</AdminButton>{err && <span role="alert" className="mt-1 block text-xs text-rust-light">{err}</span>}</Td>
    </tr>
  )
}

export function AdminProducts() {
  const s = useDemoState()
  const pname = (id: string) => s.products.find((p) => p.id === id)?.name ?? id
  return (
    <>
      <PortalHeader title="Shop products" description="Leave price or stock blank to show “TBD”." />
      <Callout tone="info" title="Catalog">Prices confirmed by the studio: Kuting-Kuting Music City Strings and drumsticks. Stock, gauges and stick brand/size still to be confirmed. Changes here are demo-only.</Callout>
      <div className="mt-4">
        <Table caption="Shop products" minWidth="56rem">
          <thead><tr><Th>Name</Th><Th>Category</Th><Th>Price (₱)</Th><Th>Stock</Th><Th>Visible</Th><Th>Save</Th></tr></thead>
          <tbody>{s.products.map((p) => <ProductRow key={p.id} p={p} />)}</tbody>
        </Table>
      </div>
      <h2 className="mt-10 text-lg font-semibold">Shop inquiries</h2>
      <div className="mt-3">
        <Table caption="Shop inquiries">
          <thead><tr><Th>Reference</Th><Th>Customer</Th><Th>Items</Th><Th>Message</Th><Th>Sent</Th><Th>Status</Th></tr></thead>
          <tbody>
            {s.shopInquiries.map((x) => (
              <tr key={x.id}>
                <Td className="font-mono font-bold">{x.reference}</Td>
                <Td>{x.customer.name}</Td>
                <Td>{x.items.map((i) => <span key={i.productId} className="block">{i.quantity} × {pname(i.productId)}</span>)}</Td>
                <Td className="text-muted">{x.message || '—'}</Td>
                <Td className="whitespace-nowrap">{formatDate(x.createdAt)}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusLabel status={x.status} variant="plain" />
                    <select aria-label={`Status for ${x.reference}`} className={adminInput} value={x.status} onChange={(e) => setShopInquiryStatus(x.id, e.target.value as InquiryStatus)}>
                      {(['pending', 'responded', 'closed'] as const).map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  )
}
