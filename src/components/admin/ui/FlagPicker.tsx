import React, { useState, useRef, useEffect } from 'react';

const COUNTRIES = [
  { flag: '🇦🇷', name: 'Argentina', code: 'AR' },
  { flag: '🇧🇴', name: 'Bolivia', code: 'BO' },
  { flag: '🇧🇷', name: 'Brasil', code: 'BR' },
  { flag: '🇨🇱', name: 'Chile', code: 'CL' },
  { flag: '🇨🇴', name: 'Colombia', code: 'CO' },
  { flag: '🇨🇷', name: 'Costa Rica', code: 'CR' },
  { flag: '🇨🇺', name: 'Cuba', code: 'CU' },
  { flag: '🇩🇴', name: 'República Dominicana', code: 'DO' },
  { flag: '🇪🇨', name: 'Ecuador', code: 'EC' },
  { flag: '🇸🇻', name: 'El Salvador', code: 'SV' },
  { flag: '🇬🇹', name: 'Guatemala', code: 'GT' },
  { flag: '🇭🇳', name: 'Honduras', code: 'HN' },
  { flag: '🇲🇽', name: 'México', code: 'MX' },
  { flag: '🇳🇮', name: 'Nicaragua', code: 'NI' },
  { flag: '🇵🇦', name: 'Panamá', code: 'PA' },
  { flag: '🇵🇾', name: 'Paraguay', code: 'PY' },
  { flag: '🇵🇪', name: 'Perú', code: 'PE' },
  { flag: '🇵🇷', name: 'Puerto Rico', code: 'PR' },
  { flag: '🇺🇾', name: 'Uruguay', code: 'UY' },
  { flag: '🇻🇪', name: 'Venezuela', code: 'VE' },
  { flag: '🇺🇸', name: 'Estados Unidos', code: 'US' },
  { flag: '🇨🇦', name: 'Canadá', code: 'CA' },
  { flag: '🇯🇲', name: 'Jamaica', code: 'JM' },
  { flag: '🇭🇹', name: 'Haití', code: 'HT' },
  { flag: '🇹🇹', name: 'Trinidad y Tobago', code: 'TT' },
  { flag: '🇧🇧', name: 'Barbados', code: 'BB' },
  { flag: '🇧🇸', name: 'Bahamas', code: 'BS' },
  { flag: '🇧🇿', name: 'Belice', code: 'BZ' },
  { flag: '🇬🇾', name: 'Guyana', code: 'GY' },
  { flag: '🇸🇷', name: 'Surinam', code: 'SR' },
  { flag: '🇦🇼', name: 'Aruba', code: 'AW' },
  { flag: '🇨🇼', name: 'Curazao', code: 'CW' },
  { flag: '🇪🇸', name: 'España', code: 'ES' },
  { flag: '🇫🇷', name: 'Francia', code: 'FR' },
  { flag: '🇮🇹', name: 'Italia', code: 'IT' },
  { flag: '🇵🇹', name: 'Portugal', code: 'PT' },
  { flag: '🇩🇪', name: 'Alemania', code: 'DE' },
  { flag: '🇬🇧', name: 'Reino Unido', code: 'GB' },
  { flag: '🇳🇱', name: 'Países Bajos', code: 'NL' },
  { flag: '🇧🇪', name: 'Bélgica', code: 'BE' },
  { flag: '🇨🇭', name: 'Suiza', code: 'CH' },
  { flag: '🇦🇹', name: 'Austria', code: 'AT' },
  { flag: '🇸🇪', name: 'Suecia', code: 'SE' },
  { flag: '🇳🇴', name: 'Noruega', code: 'NO' },
  { flag: '🇩🇰', name: 'Dinamarca', code: 'DK' },
  { flag: '🇫🇮', name: 'Finlandia', code: 'FI' },
  { flag: '🇬🇷', name: 'Grecia', code: 'GR' },
  { flag: '🇵🇱', name: 'Polonia', code: 'PL' },
  { flag: '🇷🇴', name: 'Rumanía', code: 'RO' },
  { flag: '🇨🇿', name: 'Chequia', code: 'CZ' },
  { flag: '🇭🇺', name: 'Hungría', code: 'HU' },
  { flag: '🇮🇪', name: 'Irlanda', code: 'IE' },
  { flag: '🇯🇵', name: 'Japón', code: 'JP' },
  { flag: '🇨🇳', name: 'China', code: 'CN' },
  { flag: '🇰🇷', name: 'Corea del Sur', code: 'KR' },
  { flag: '🇮🇳', name: 'India', code: 'IN' },
  { flag: '🇦🇺', name: 'Australia', code: 'AU' },
  { flag: '🇿🇦', name: 'Sudáfrica', code: 'ZA' },
  { flag: '🇳🇬', name: 'Nigeria', code: 'NG' },
  { flag: '🇪🇬', name: 'Egipto', code: 'EG' },
  { flag: '🇲🇦', name: 'Marruecos', code: 'MA' },
  { flag: '🇮🇱', name: 'Israel', code: 'IL' },
  { flag: '🇹🇷', name: 'Turquía', code: 'TR' },
  { flag: '🇷🇺', name: 'Rusia', code: 'RU' },
  { flag: '🇺🇦', name: 'Ucrania', code: 'UA' },
  { flag: '🇵🇭', name: 'Filipinas', code: 'PH' },
  { flag: '🇹🇭', name: 'Tailandia', code: 'TH' },
  { flag: '🇻🇳', name: 'Vietnam', code: 'VN' },
  { flag: '🇮🇩', name: 'Indonesia', code: 'ID' },
  { flag: '🇲🇾', name: 'Malasia', code: 'MY' },
  { flag: '🇸🇬', name: 'Singapur', code: 'SG' },
  { flag: '🇳🇿', name: 'Nueva Zelanda', code: 'NZ' },
  { flag: '🇸🇦', name: 'Arabia Saudita', code: 'SA' },
  { flag: '🇦🇪', name: 'Emiratos Árabes', code: 'AE' },
  { flag: '🇬🇩', name: 'Granada', code: 'GD' },
  { flag: '🇦🇬', name: 'Antigua y Barbuda', code: 'AG' },
  { flag: '🇰🇳', name: 'San Cristóbal y Nieves', code: 'KN' },
  { flag: '🇱🇨', name: 'Santa Lucía', code: 'LC' },
  { flag: '🇻🇨', name: 'San Vicente', code: 'VC' },
  { flag: '🇩🇲', name: 'Dominica', code: 'DM' },
  { flag: '🇬🇵', name: 'Guadalupe', code: 'GP' },
  { flag: '🇲🇶', name: 'Martinica', code: 'MQ' },
  { flag: '🇻🇬', name: 'Islas Vírgenes Británicas', code: 'VG' },
  { flag: '🇻🇮', name: 'Islas Vírgenes', code: 'VI' },
  { flag: '🇰🇾', name: 'Islas Caimán', code: 'KY' },
];

interface FlagPickerProps {
  label: string;
  value: string;
  onChange: (flag: string) => void;
}

export default function FlagPicker({ label, value, onChange }: FlagPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COUNTRIES.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative' }} ref={ref}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
          fontSize: '0.875rem', outline: 'none', background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between',
        }}
      >
        <span>{value ? `${value} ${COUNTRIES.find(c => c.flag === value)?.name || ''}` : 'Seleccionar bandera...'}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', color: '#94a3b8' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)', maxHeight: '300px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar país..."
              autoFocus
              style={{
                width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px',
                border: '1.5px solid #e2e8f0', fontSize: '0.82rem', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '240px', padding: '0.25rem' }}>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.6rem', border: 'none', background: '#fef2f2',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem', color: '#dc2626',
                  marginBottom: '0.25rem',
                }}
              >
                <i className="fas fa-times" /> Quitar bandera
              </button>
            )}
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.flag); setOpen(false); setSearch(''); }}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.6rem', border: 'none',
                  background: value === c.flag ? '#eff6ff' : 'transparent',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseOut={e => (e.currentTarget.style.background = value === c.flag ? '#eff6ff' : 'transparent')}
              >
                <span style={{ fontSize: '1.3rem' }}>{c.flag}</span>
                <span style={{ color: '#334155' }}>{c.name}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: 'auto' }}>{c.code}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No se encontraron países
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
