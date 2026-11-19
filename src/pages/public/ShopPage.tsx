import { Link } from 'react-router'
import { ArrowRight, Package, PackageX } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { shopCategories } from '../../data/services'
import { useDemoState } from '../../services/demoStore'
import { formatPHP } from '../../utils/money'

export function ShopPage() {
  useTitle('Shop')
  const { products } = useDemoState()
  return (
    <>
      <PageHeader eyebrow="Shop" title="Strings & sticks." photo="gearGuitars">
        Kuting-Kuting Music City Strings for acoustic, electric and bass, plus drumsticks. Ask first — the studio confirms availability.
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Callout tone="info" title="Inquiry first">
          Send an inquiry to check availability. Stock, gauges and pickup or delivery are to be confirmed by the studio. There is
          no online checkout or payment.
        </Callout>
        {shopCategories.map((cat) => {
          const items = products.filter((p) => p.active && p.category === cat.id)
          return (
            <section key={cat.id} aria-labelledby={`${cat.id}-title`} className="mt-14">
              <h2 id={`${cat.id}-title`} className="display text-display-3">{cat.label}</h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <li key={p.id} className="card flex flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Package aria-hidden="true" className="size-6 text-rust-light" />
                      <span className="flex gap-1.5">
                        {p.isDemo && <span className="demo-chip">Demo</span>}
                        {p.outOfStock && <span className="tape-label"><PackageX aria-hidden="true" className="size-3.5" />Out of stock</span>}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{p.name}</h3>
                    {p.brand && <p className="text-sm text-paper/90">{p.brand}</p>}
                    <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-muted">Price</dt>
                        <dd className="m-0 font-mono font-bold">{p.price === null ? 'TBD' : formatPHP(p.price)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Stock</dt>
                        <dd className="m-0 font-mono font-bold">{p.outOfStock ? 'Out of stock' : p.stock === null ? 'TBD' : p.stock}</dd>
                      </div>
                    </dl>
                    <Link to={`/book/shop?product=${p.id}`} className="link mt-5 inline-flex items-center gap-2 font-semibold">
                      {p.outOfStock ? 'Ask when it’s back' : 'Ask about this'} <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
