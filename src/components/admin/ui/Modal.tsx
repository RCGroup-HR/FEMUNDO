import React, { type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({ open, onClose, title, children, width = '600px' }: ModalProps) {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button onClick={onClose} style={styles.close}>×</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9000, padding: '1rem',
  },
  modal: {
    background: 'white', borderRadius: '12px', width: '100%',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
  },
  title: { fontSize: '1.15rem', fontWeight: 600, color: '#1e293b', margin: 0 },
  close: {
    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
    color: '#94a3b8', padding: '0.25rem 0.5rem', lineHeight: 1,
  },
  body: { padding: '1.5rem', overflowY: 'auto' as const },
};
