import { Receipt } from '../../components/grunge'
import { BALANCE_COLLECTION_SHORT } from '../../data/settings'
import { formatPHP } from '../../utils/money'
import type { RehearsalPrice } from './pricing'

/** Receipt for any rehearsal price breakdown. */
export function PriceReceipt({ price, title = 'Booking summary', barcodeValue, roomLabel = 'Room' }: { price: RehearsalPrice; title?: string; barcodeValue?: string; roomLabel?: string }) {
  return (
    <Receipt
      title={title}
      lines={[
        { label: `${roomLabel} · ${price.hours} hr${price.hours === 1 ? '' : 's'} × ${formatPHP(price.roomRate)}`, amount: price.roomSubtotal },
        ...price.equipmentLines.map((l) => ({ label: `${l.label} × ${l.quantity}`, detail: 'once per booking', amount: l.lineTotal })),
      ]}
      total={price.total}
      after={[
        { label: 'Downpayment (50%) · GCash', amount: price.downpayment, emphasis: true },
        { label: `Balance · ${BALANCE_COLLECTION_SHORT}`, amount: price.balance },
      ]}
      footer={<>Cancel before the booking day for a downpayment refund. No cancellations on the day.</>}
      barcodeValue={barcodeValue}
    />
  )
}
