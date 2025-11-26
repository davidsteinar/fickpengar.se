import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import SwishQrIcon from '../assets/swish_qr_icon.svg';

const SwishLogo = ({ size }: { size: number }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 0 2px #fff',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 2,
    }}
  >
    <img
      src={SwishQrIcon}
      alt="Swish logo"
      style={{ width: '80%', height: '80%', objectFit: 'contain', display: 'block' }}
    />
  </div>
);
import { calculateEmployee, calculateEntrepreneur } from '../lib/calculations';

const buildSwishUrl = (phone: string, amount: number, taskName?: string) => {
  let msg = 'Fickpengar efter skatt';
  if (taskName) {
    msg += `: ${taskName}`;
  }
  const encodedMsg = encodeURIComponent(msg);
  return `https://app.swish.nu/1/p/sw/?sw=${phone}&amt=${amount.toFixed(2)}&msg=${encodedMsg}`;
};

interface SwishQrGeneratorProps {
  formState: {
    rate: number;
    hours: number;
    [key: string]: any;
  };
}


const SwishQrGenerator: React.FC<SwishQrGeneratorProps> = ({ formState }) => {
  const [phone, setPhone] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Calculate the correct amount
  let amount = 0;
  const { taskName, rate, hours, perJob } = formState;
  const taskDetails = { taskName, rate, hours, perJob };

  if (formState.mode === 'employee') {
    const ratios = {
      taxPct: formState.empTax,
      housingPct: formState.empHousing,
      foodPct: formState.empFood,
      transportPct: formState.empTransport,
      essentialsPct: formState.empEssentials,
    };
    amount = calculateEmployee(taskDetails, ratios).finalNet;
  } else if (formState.mode === 'entrepreneur') {
    const defaults = {
      vatPct: formState.entVat,
      socialFeePct: formState.entSocial,
      municipalTaxPct: formState.entTax,
      overheadMonthly: formState.entOverheadMonthly,
      billableHoursPerMonth: formState.entBillable,
    };
    amount = calculateEntrepreneur(taskDetails, defaults).finalNet;
  }

  const handleGenerate = () => {
    setQrValue('');
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError('Ange ett Swish-nummer.');
      return;
    }
    if (!(amount > 0)) {
      setError('Beloppet är 0 kr. Kontrollera dina inställningar.');
      return;
    }
    setError(null);
    const url = buildSwishUrl(trimmedPhone, amount, taskName);
    console.log('Generating Swish QR:', url);
    setQrValue(url);
  };

  return (
    <div style={{ maxWidth: 380, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Betala med Swish</h2>

      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
          borderRadius: 18,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          padding: '28px 20px 24px 20px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <input
          type="tel"
          placeholder="Ange Swish-nummer"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{
            padding: '10px 14px',
            width: '100%',
            maxWidth: 220,
            marginBottom: 14,
            fontSize: 16,
            border: '1px solid #d1d5db',
            borderRadius: 8,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleGenerate}
          style={{
            padding: '10px 24px',
            fontSize: 16,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #C6D300 0%, #0EA239 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 8,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
            transition: 'background 0.2s',
          }}
        >
          Generera QR kod
        </button>
        {error && <div style={{ color: 'red', marginTop: 6, marginBottom: 2 }}>{error}</div>}

        <div ref={qrRef} style={{ marginTop: 18, marginBottom: 8 }}>
          {qrValue && (
            <>
              <div
                style={{
                  width: 256,
                  height: 256,
                  position: 'relative',
                  display: 'inline-block',
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
                  padding: 8,
                }}
              >
                <QRCodeSVG
                  value={qrValue}
                  size={240}
                  bgColor="#fff"
                  fgColor="#000"
                  level="H"
                  includeMargin={false}
                  style={{ width: '100%', height: '100%' }}
                />
                {/* Swish icon = 25% of QR width (240px) = 60px */}
                <SwishLogo size={60} />
              </div>
              <div style={{ marginTop: 10, fontSize: 13, wordBreak: 'break-all', color: '#888' }}>
              </div>
            </>
          )}
        </div>
        {amount > 0 && (
          <div style={{ marginTop: 10, fontSize: 15, color: '#333' }}>
            Belopp: <b>{amount.toFixed(2)} kr</b>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwishQrGenerator;
