import { createPortal } from 'react-dom';
import { RECEIPT_THEMES } from '../receiptThemes.js';

const SHOP = {
  name: 'Cheesy Crust',
  nameUr: 'چیزی کرسٹ',
  address: 'Gulberg III, Lahore',
  phone: '0300 123 4567',
};

const LABELS = {
  en: {
    receipt: 'RECEIPT', orderNo: 'Order #', date: 'Date', time: 'Time',
    customer: 'Customer', phone: 'Phone', address: 'Delivery Address',
    item: 'Item', qty: 'Qty', price: 'Price', lineTotal: 'Total',
    subtotal: 'Subtotal', deliveryFee: 'Delivery Fee', grandTotal: 'Grand Total',
    payment: 'Payment', notes: 'Notes', status: 'Status',
    cod: 'Cash on Delivery', easypaisa: 'EasyPaisa', jazzcash: 'JazzCash',
    thankyou: 'Thank you for your order!',
  },
  ur: {
    receipt: 'رسید', orderNo: 'آرڈر نمبر', date: 'تاریخ', time: 'وقت',
    customer: 'گاہک', phone: 'فون', address: 'ڈیلیوری ایڈریس',
    item: 'آئٹم', qty: 'مقدار', price: 'قیمت', lineTotal: 'رقم',
    subtotal: 'ذیلی کل', deliveryFee: 'ڈیلیوری فیس', grandTotal: 'کل رقم',
    payment: 'ادائیگی', notes: 'نوٹس', status: 'حیثیت',
    cod: 'ڈیلیوری پر نقد', easypaisa: 'ایزی پیسہ', jazzcash: 'جاز کیش',
    thankyou: 'آپ کے آرڈر کا شکریہ!',
  },
};

const STATUS_LABEL = {
  en: { pending: 'Received', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' },
  ur: { pending: 'موصول ہوا', confirmed: 'تصدیق شدہ', preparing: 'تیار ہو رہا ہے', out_for_delivery: 'ڈیلیوری کے لیے روانہ', delivered: 'ڈیلیور ہو گیا', cancelled: 'منسوخ' },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' });
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Karachi' });
}

function buildPrintCss(theme) {
  return `
  @page { size: ${theme.isSlip ? '80mm auto' : 'A5 portrait'}; margin: ${theme.isSlip ? '3mm' : '10mm'}; }
  #receipt-print-portal { display: none; }
  #receipt-print, #receipt-print-onscreen {
    font-family: 'Noto Nastaliq Urdu', Inter, Arial, sans-serif;
    color: #1a1a2e;
  }
  #receipt-print table.items-table, #receipt-print-onscreen table.items-table {
    table-layout: fixed; width: 100%; border-collapse: collapse;
  }
  #receipt-print table.items-table th, #receipt-print table.items-table td,
  #receipt-print-onscreen table.items-table th, #receipt-print-onscreen table.items-table td {
    padding: 6px; overflow-wrap: break-word;
  }
  @media print {
    .no-print { display: none !important; }
    #root { display: none !important; }
    #receipt-print-portal { display: block !important; }
    html, body { background: #fff !important; margin: 0; padding: 0; height: auto !important; overflow: visible !important; }
  }
`;
}

function ReceiptBody({ order, theme, lang }) {
  const t = LABELS[lang];
  const rtl = lang === 'ur';
  const isSlip = theme.isSlip;

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: theme.radius,
        padding: isSlip ? '14px 12px' : '28px 26px', maxWidth: isSlip ? 320 : 480, margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: isSlip ? 18 : 22, color: theme.primary }}>
          {rtl ? SHOP.nameUr : SHOP.name}
        </div>
        <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>{SHOP.address}</div>
        <div style={{ fontSize: 11.5, color: '#666' }}>{SHOP.phone}</div>
      </div>

      <div style={{ borderTop: `1px ${isSlip ? 'dashed' : 'solid'} ${theme.border}`, borderBottom: `1px ${isSlip ? 'dashed' : 'solid'} ${theme.border}`, padding: '8px 0', marginBottom: 12, fontSize: 12.5 }}>
        <Row label={t.orderNo} value={order.order_number} />
        <Row label={t.date} value={formatDate(order.createdAt || order.created_at)} />
        <Row label={t.time} value={formatTime(order.createdAt || order.created_at)} />
        <Row label={t.status} value={STATUS_LABEL[lang][order.status]} />
      </div>

      <div style={{ marginBottom: 12, fontSize: 12.5 }}>
        <Row label={t.customer} value={order.customer_name} />
        <Row label={t.phone} value={order.customer_phone} />
        <Row label={t.address} value={order.delivery_address} />
      </div>

      <table className="items-table" style={{ marginBottom: 12, fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme.border}`, textAlign: rtl ? 'right' : 'left' }}>
            <th style={{ textAlign: rtl ? 'right' : 'left' }}>{t.item}</th>
            <th style={{ textAlign: 'center', width: 40 }}>{t.qty}</th>
            <th style={{ textAlign: rtl ? 'left' : 'right', width: 70 }}>{t.lineTotal}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={i} style={{ borderBottom: `1px dashed ${theme.border}` }}>
              <td>{it.name} <span style={{ color: '#888', fontSize: 10.5 }}>({it.variant_label})</span></td>
              <td style={{ textAlign: 'center' }}>{it.quantity}</td>
              <td style={{ textAlign: rtl ? 'left' : 'right' }}>{it.line_total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 12.5, marginBottom: 12 }}>
        <Row label={t.subtotal} value={`Rs ${order.subtotal}`} />
        {order.delivery_fee > 0 && <Row label={t.deliveryFee} value={`Rs ${order.delivery_fee}`} />}
        <Row label={t.payment} value={t[order.payment_type] || order.payment_type} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, color: theme.primary, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${theme.border}` }}>
          <span>{t.grandTotal}</span><span>Rs {order.total_amount}</span>
        </div>
      </div>

      {order.notes && (
        <div style={{ fontSize: 11.5, color: '#555', marginBottom: 10 }}>
          <strong>{t.notes}:</strong> {order.notes}
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: 12, color: theme.primary, fontWeight: 600, marginTop: 10 }}>
        {t.thankyou}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '1.5px 0' }}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// order: the order object; themeKey/lang: current selection; onClose optional
export default function ReceiptPrint({ order, themeKey, lang }) {
  const theme = RECEIPT_THEMES[themeKey] || RECEIPT_THEMES.slip;

  return (
    <>
      <style>{buildPrintCss(theme)}</style>
      {/* on-screen preview */}
      <div id="receipt-print-onscreen">
        <ReceiptBody order={order} theme={theme} lang={lang} />
      </div>
      {/* print-only portal, rendered directly on <body>, outside #root */}
      {createPortal(
        <div id="receipt-print-portal">
          <div id="receipt-print">
            <ReceiptBody order={order} theme={theme} lang={lang} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
