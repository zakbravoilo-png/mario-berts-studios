import { Receipt } from '../../components/grunge'
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
        { label: 'Remaining balance', amount: price.balance },
      ]}
      footer={<>Downpayment is non-refundable. Cancel only before the booking day.</>}
      barcodeValue={barcodeValue}
    />
  )
}
