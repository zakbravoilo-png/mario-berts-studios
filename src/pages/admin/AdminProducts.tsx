import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { adminAddProduct, adminRemoveProduct, adminUpdateProduct, setShopInquiryStatus } from '../../services/actions'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { Callout } from '../../components/ui/Callout'
import { AdminButton, Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import { shopCategories } from '../../data/services'
import type { InquiryStatus, ShopProduct } from '../../types/domain'
import { formatDate } from '../../utils/time'

/** One editable shop item: name, brand, price, stock, out-of-stock, shown, remove. */
function ProductRow({ p }: { p: ShopProduct }) {
  const [d, setD] = useState({ name: p.name, brand: p.brand ?? '', price: p.price === null ? '' : String(p.price), stock: p.stock === null ? '' : String(p.stock), active: p.active })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  function save() {
    const price = d.price.trim() === '' ? null : Number(d.price)
    const stock = d.stock.trim() === '' ? null : Number(d.stock)
    if ((price !== null && (!Number.isInteger(price) || price < 0)) || (stock !== null && (!Number.isInteger(stock) || stock < 0))) {
      return setMsg({ ok: false, text: 'Whole numbers only, or leave blank for TBD.' })
    }
    if (!d.name.trim()) return setMsg({ ok: false, text: 'Name is required.' })
    // A stock of 0 marks the item out of stock automatically.
    adminUpdateProduct({ ...p, name: d.name.trim(), brand: d.brand.trim() || null, price, stock, active: d.active, outOfStock: stock === 0 ? true : p.outOfStock })
    setMsg({ ok: true, text: 'Saved.' })
  }

  function remove() {
    const r = adminRemoveProduct(p.id)
    if (r === 'hidden') {
      setConfirmRemove(false)
      setMsg({ ok: true, text: 'Hidden from the shop (kept because inquiries mention it).' })
    }
  }

  const change = (patch: Partial<typeof d>) => {
    setD({ ...d, ...patch })
    setMsg(null)
  }

  return (
    <tr className={p.outOfStock ? 'bg-charcoal' : undefined}>
      <Td>
        <input aria-label={`Name of ${p.name}`} className={`${adminInput} w-full min-w-52`} value={d.name} onChange={(e) => change({ name: e.target.value })} />
        <input aria-label={`Brand for ${p.name}`} className={`${adminInput} mt-1 w-full text-xs`} value={d.brand} placeholder="Brand (optional)" onChange={(e) => change({ brand: e.target.value })} />
        {p.isDemo && <span className="mt-1 block"><span className="demo-chip">Demo</span></span>}
      </Td>
      <Td>{shopCategories.find((c) => c.id === p.category)?.label}</Td>
      <Td>
        <label className="flex items-center gap-1">
          <span aria-hidden="true">₱</span>
          <input aria-label={`Price for ${p.name} in pesos`} inputMode="numeric" className={`${adminInput} w-20`} value={d.price} placeholder="TBD" onChange={(e) => change({ price: e.target.value })} />
        </label>
      </Td>
      <Td>
        <input aria-label={`Stock for ${p.name}`} inputMode="numeric" className={`${adminInput} w-16`} value={d.stock} placeholder="TBD" onChange={(e) => change({ stock: e.target.value })} />
      </Td>
      <Td>
        <label className="flex items-center gap-1.5 whitespace-nowrap">
          <input type="checkbox" className="size-4 accent-[var(--color-rust)]" checked={p.outOfStock} onChange={(e) => adminUpdateProduct({ ...p, outOfStock: e.target.checked })} aria-label={`${p.name} out of stock`} />
          Out of stock
        </label>
        <label className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
          <input type="checkbox" className="size-4 accent-[var(--color-rust)]" checked={d.active} onChange={(e) => change({ active: e.target.checked })} aria-label={`${p.name} shown in shop`} />
          Shown in shop
        </label>
      </Td>
      <Td>
        <div className="flex flex-wrap items-center gap-1.5">
          <AdminButton onClick={save}>Save</AdminButton>
          {!confirmRemove ? (
            <AdminButton aria-label={`Remove ${p.name}`} onClick={() => setConfirmRemove(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
            </AdminButton>
          ) : (
            <>
              <AdminButton tone="primary" onClick={remove}>Remove</AdminButton>
              <AdminButton onClick={() => setConfirmRemove(false)}>Keep</AdminButton>
            </>
          )}
        </div>
        {msg && <span role={msg.ok ? 'status' : 'alert'} className={`mt-1 block text-xs ${msg.ok ? 'text-muted' : 'text-rust-light'}`}>{msg.text}</span>}
      </Td>
    </tr>
  )
}

function AddProductForm() {
  const [d, setD] = useState({ name: '', brand: '', category: shopCategories[0]!.id as ShopProduct['category'], price: '', stock: '', description: '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const r = adminAddProduct({
      name: d.name,
      brand: d.brand,
      category: d.category,
      price: d.price.trim() === '' ? null : Number(d.price),
      stock: d.stock.trim() === '' ? null : Number(d.stock),
      description: d.description,
    })
    if (!r.ok) return setMsg({ ok: false, text: r.errors.join(' ') })
    setMsg({ ok: true, text: `Added “${d.name.trim()}” to the shop.` })
    setD({ ...d, name: '', price: '', stock: '', description: '' })
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby="add-product-title" className="mt-6 border border-slate p-4">
      <h2 id="add-product-title" className="font-semibold">Add a shop item</h2>
      <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
        <label className="min-w-48 flex-1">
          <span className="mb-1 block text-muted">Name</span>
          <input className={`${adminInput} w-full`} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="e.g. Drumsticks 5A" />
        </label>
        <label>
          <span className="mb-1 block text-muted">Brand (optional)</span>
          <input className={`${adminInput} w-44`} value={d.brand} onChange={(e) => setD({ ...d, brand: e.target.value })} />
        </label>
        <label>
          <span className="mb-1 block text-muted">Category</span>
          <select className={adminInput} value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as ShopProduct['category'] })}>
            {shopCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-muted">Price (₱)</span>
          <input inputMode="numeric" className={`${adminInput} w-24`} value={d.price} placeholder="TBD" onChange={(e) => setD({ ...d, price: e.target.value })} />
        </label>
        <label>
          <span className="mb-1 block text-muted">Stock</span>
          <input inputMode="numeric" className={`${adminInput} w-20`} value={d.stock} placeholder="TBD" onChange={(e) => setD({ ...d, stock: e.target.value })} />
        </label>
        <label className="w-full">
          <span className="mb-1 block text-muted">Description (optional)</span>
          <input className={`${adminInput} w-full`} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="e.g. Gauge 10–46" />
        </label>
        <AdminButton type="submit" tone="primary"><Plus aria-hidden="true" className="size-4" /> Add item</AdminButton>
      </div>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-2 text-sm ${msg.ok ? 'text-paper' : 'text-rust-light'}`}>{msg.text}</p>}
    </form>
  )
}

export function AdminProducts() {
  const s = useDemoState()
  const pname = (id: string) => s.products.find((p) => p.id === id)?.name ?? id
  return (
    <>
      <PortalHeader title="Shop products" description="Strings and drumsticks. Leave price or stock blank to show “TBD”. A stock of 0 marks the item out of stock." />
      <Callout tone="demo" title="Demo data">Changes save in this browser only. Shop orders are inquiry-only — no checkout.</Callout>
      <div className="mt-4">
        <Table caption="Shop products" minWidth="60rem">
          <thead><tr><Th>Item</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {s.products.map((p) => (
              <ProductRow key={`${p.id}-${p.price}-${p.stock}-${p.name}-${p.active}-${p.brand}`} p={p} />
            ))}
            {s.products.length === 0 && <tr><Td colSpan={6} className="py-6 text-center text-muted">No products. Add one below.</Td></tr>}
          </tbody>
        </Table>
      </div>
      <AddProductForm />

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
