import React, { useState } from 'react';
import { X } from 'lucide-react';

export const COLUMN_TYPES = [
  { key: 'general', label: 'General', hint: 'Leave values as-is' },
  { key: 'number', label: 'Number', hint: 'Strip formatting, keep a plain number' },
  { key: 'currency', label: 'Currency (AED)', hint: 'e.g. AED 12,500.00' },
  { key: 'percentage', label: 'Percentage', hint: 'e.g. 45.00%' },
  { key: 'date', label: 'Date', hint: 'Converts Excel date serials to readable dates' },
  { key: 'text', label: 'Text', hint: 'Plain text, no reformatting' },
];

// Mirrors ThetaReportView.jsx's parseSheetDate -- Excel serial (days since
// 1899-12-30) or a plain date string, depending on how the source cell was
// typed/exported.
function parseSheetDateSerial(v) {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    if (n > 0 && n < 100000) return new Date(Math.round((n - 25569) * 86400 * 1000));
  }
  const cleaned = s.replace(/\s*[A*]$/i, '').trim();
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

// Actually rewrites a cell's value into the target type's representation
// (not a visual-only format -- the underlying stored value changes), per
// the user's chosen approach: no format-metadata layer, works with the
// existing raw-value grid/save pipeline as-is.
export function convertCellValue(value, type) {
  if (value === undefined || value === null || String(value).trim() === '') return value ?? '';
  switch (type) {
    case 'number': {
      const n = parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(n) ? n : value;
    }
    case 'currency': {
      const n = parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
      if (!Number.isFinite(n)) return value;
      return `AED ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    case 'percentage': {
      const n = parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
      if (!Number.isFinite(n)) return value;
      const pct = n <= 1 ? n * 100 : n;
      return `${pct.toFixed(2)}%`;
    }
    case 'date': {
      const d = parseSheetDateSerial(value);
      if (!d) return value;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    case 'text':
      return String(value);
    case 'general':
    default:
      return value;
  }
}

/**
 * "Set column type" tool -- our Excel-Format-Cells equivalent. Picks one
 * column on the current sheet and one target type, then rewrites every
 * row's value in that column via convertCellValue. Not a visual-only
 * format layer (the grid has no format-metadata field to carry one) -- the
 * stored value itself changes, which the user explicitly chose over adding
 * a format-metadata layer across the frontend grid model and backend.
 */
export default function ColumnTypeForm({ headers, onApply, onClose }) {
  const [column, setColumn] = useState(headers[0] || '');
  const [type, setType] = useState('general');

  const selectedType = COLUMN_TYPES.find(t => t.key === type);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, width: 420, maxWidth: '95vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Set Column Type</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: '#475569', fontWeight: 600 }}>
            Column
            <select
              value={column}
              onChange={e => setColumn(e.target.value)}
              style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, color: '#0f172a', background: '#fff' }}
            >
              {headers.map((h, i) => <option key={`${h}-${i}`} value={h}>{h}</option>)}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: '#475569', fontWeight: 600 }}>
            Data type
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, color: '#0f172a', background: '#fff' }}
            >
              {COLUMN_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </label>

          {selectedType && (
            <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>{selectedType.hint}</div>
          )}

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: 11.5, color: '#92400e', lineHeight: 1.5 }}>
            This rewrites every value already in this column to match the chosen type -- it isn't a visual-only format, so re-running with a different type won't recover the original values.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => onApply(column, type)}
            disabled={!column}
            style={{ padding: '8px 18px', background: column ? '#0f766e' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: column ? 'pointer' : 'not-allowed' }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
