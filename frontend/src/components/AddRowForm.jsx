import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { THETA_DATE_FIELDS, THETA_NUMERIC_FIELDS } from '../utils/thetaValidation';

// Increments the trailing numeric suffix of the last row's Activity ID
// (e.g. "ENG-08" -> "ENG-09", preserving zero-padding width), falling back
// to a plain row-count placeholder when no existing ID fits that shape.
function computeNextActivityId(headers, rows) {
  const idIdx = headers.indexOf('Activity ID');
  if (idIdx === -1) return '';
  const lastId = rows.length ? String(rows[rows.length - 1][idIdx] ?? '').trim() : '';
  const m = lastId.match(/^(.*?)(\d+)$/);
  if (m) {
    const nextNum = parseInt(m[2], 10) + 1;
    return `${m[1]}${String(nextNum).padStart(m[2].length, '0')}`;
  }
  return `ROW-${rows.length + 1}`;
}

// Mirrors theta_sheet_db.py's _row_productivity_index exactly: (Actual
// Output/Actual Hours) / (Planned Output/Planned Hours), only when all four
// inputs are present and valid -- so this preview never shows a value the
// backend wouldn't also compute once the row is saved.
function computeProductivityPreview(headers, values) {
  const get = (name) => {
    const idx = headers.indexOf(name);
    if (idx === -1) return null;
    const v = parseFloat(values[name]);
    return Number.isFinite(v) ? v : null;
  };
  const plannedHours = get('Planned Hours');
  const actualHours = get('Actual Hours');
  const plannedOutput = get('Planned Output');
  const actualOutput = get('Actual Output');
  if (plannedHours == null || actualHours == null || plannedOutput == null || actualOutput == null) return null;
  if (actualHours <= 0 || plannedOutput <= 0 || plannedHours <= 0) return null;
  const plannedRate = plannedOutput / plannedHours;
  if (!plannedRate) return null;
  return (actualOutput / actualHours) / plannedRate;
}

/**
 * Add-a-row form for the Theta Sheets grid, used instead of typing straight
 * into the spreadsheet. Renders one input per header on the CURRENT sheet
 * (not a hardcoded schema list), so it stays correct for any tab, including
 * non-standard ones. Activity ID and Productivity Index are always disabled
 * -- the only two fields with real auto-derivation logic anywhere in the app.
 */
export default function AddRowForm({ headers, rows, onSubmit, onClose }) {
  const hasActivityId = headers.includes('Activity ID');
  const hasProductivityIndex = headers.includes('Productivity Index');

  const [values, setValues] = useState(() => {
    const initial = {};
    headers.forEach(h => { initial[h] = ''; });
    if (hasActivityId) initial['Activity ID'] = computeNextActivityId(headers, rows);
    return initial;
  });

  const productivityPreview = useMemo(
    () => (hasProductivityIndex ? computeProductivityPreview(headers, values) : null),
    [headers, values, hasProductivityIndex]
  );

  const setField = (h, v) => setValues(prev => ({ ...prev, [h]: v }));

  const handleSubmit = () => {
    const row = headers.map(h => {
      if (h === 'Productivity Index' && hasProductivityIndex) {
        return productivityPreview != null ? productivityPreview : '';
      }
      return values[h] ?? '';
    });
    onSubmit(row);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, width: 640, maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Add Row</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', alignContent: 'start' }}>
          {headers.map((h, i) => {
            if (!h) return null;
            const isActivityId = h === 'Activity ID';
            const isProductivityIndex = h === 'Productivity Index';
            const disabled = isActivityId || isProductivityIndex;
            const isDate = THETA_DATE_FIELDS.includes(h);
            const isNumeric = !isProductivityIndex && THETA_NUMERIC_FIELDS.includes(h);
            const type = isDate ? 'date' : isNumeric ? 'number' : 'text';
            const displayValue = isProductivityIndex
              ? (productivityPreview != null ? productivityPreview.toFixed(2) : '')
              : values[h];

            return (
              <label key={`${h}-${i}`} style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: '#475569', fontWeight: 600 }}>
                {h}
                {isActivityId && <span style={{ fontWeight: 400, fontSize: 10.5, color: '#94a3b8' }}>auto-generated</span>}
                {isProductivityIndex && <span style={{ fontWeight: 400, fontSize: 10.5, color: '#94a3b8' }}>auto-calculated from Hours/Output</span>}
                <input
                  type={type}
                  value={displayValue}
                  disabled={disabled}
                  onChange={e => setField(h, e.target.value)}
                  style={{
                    padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13,
                    color: disabled ? '#94a3b8' : '#0f172a', background: disabled ? '#f8fafc' : '#fff',
                  }}
                />
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: '8px 18px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
}
