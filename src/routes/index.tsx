/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { encodeForm } from '../lib/formUtils';
import { useTheme } from '@/context/ThemeContext';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [title, setTitle] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [fields, setFields] = useState([{ label: '', type: 'manual', options: '', multiple: false }]);
  const [copied, setCopied] = useState(false);
  const [shortLink, setShortLink] = useState('-');
  const [loadingShortLink, setLoadingShortLink] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  const selectRefs = useRef<Array<HTMLSelectElement | null>>([]);

  const addField = () => {
    setFields([...fields, { label: '', type: 'manual', options: '', multiple: false }]);
    setTimeout(() => {
      if (selectRefs.current[fields.length]) {
        selectRefs.current[fields.length]?.focus();
      }
    }, 0);
  };

  const updateField = (i: number, key: string, value: string | boolean) => {
    const newFields = [...fields];
    // @ts-ignore
    newFields[i][key] = value;
    setFields(newFields);
  };

  const isPhoneValid = /^\d{6,}$/.test(waNumber.trim());

  const isValid =
    title.trim() !== '' &&
    isPhoneValid &&
    fields.length > 0 &&
    fields.every(f => f.label.trim() !== '' && (f.type !== 'option' || f.options.trim() !== ''));

  console.log('waNumber', waNumber);
  const encoded = encodeForm({ title, fields, waNumber: `62${waNumber}`, darkMode });

  const shareLink = `${window.location.origin}/form?data=${encoded}`;

  const fetchShortLink = async () => {
    if (!isValid) return;
    setLoadingShortLink(true);
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(shareLink)}`);
      const short = await res.text();
      setShortLink(short);
    } catch (err) {
      console.error('TinyURL gagal:', err);
      setShortLink(shareLink);
    } finally {
      setLoadingShortLink(false);
    }
  };

  useEffect(() => {
    if (isValid) {
      fetchShortLink();
    } else {
      setShortLink('-');
    }
  }, [shareLink, isValid]);

  const copyToClipboard = async () => {
    if (!isValid) return;
    try {
      await navigator.clipboard.writeText(shortLink !== '-' ? shortLink : shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal copy!', err);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen p-4`}>
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-md max-w-xl mx-auto space-y-4`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">📄 Bikin Form Baru</h1>
        </div>

        <label className="block font-medium">📝 Judul Form <span className="text-red-500">*</span></label>
        <input
          className="w-full p-2 border rounded bg-inherit"
          placeholder="Contoh: Form Pemesanan Kaos Komunitas"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className="block font-medium">📱 Nomor WhatsApp <span className="text-red-500">*</span></label>
        <div className='flex'>
          <div className='self-center mr-1 '>+62</div>
          <input
            className="w-full p-2 border rounded bg-inherit"
            placeholder="Masukkan no WA yang nerima hasil form"
            value={waNumber}
            // onChange={(e) => setWaNumber(e.target.value)}
            onChange={(e) => {
              const input = e.target.value;
              if (!input.startsWith('8')) {
                setWaNumber('8' + input);
              } else {
                setWaNumber(input);
              }
            }}

            required
          />
        </div>
        {!isPhoneValid && waNumber && (
          <p className="text-red-600 text-sm">⚠️ Masukkan nomor yang bener ya (minimal 9 digit)</p>
        )}

        <div className="space-y-2">
          <p className="font-medium">❓ Pertanyaan <span className="text-red-500">*</span></p>
          {fields.map((field, i) => (
            <div key={i} className="space-y-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="flex-1 p-2 border rounded bg-inherit"
                  placeholder="Contoh: Nama lengkap, Ukuran kaos, Alamat pengiriman"
                  value={field.label}
                  onChange={(e) => updateField(i, 'label', e.target.value)}
                  required
                />
                <select
                  ref={(el) => (selectRefs.current[i] = el)}
                  className="p-2 border rounded bg-inherit sm:w-48"
                  value={field.type}
                  onChange={(e) => updateField(i, 'type', e.target.value)}
                >
                  <option value="manual">Isian Bebas</option>
                  <option value="option">Pilihan Jawaban</option>
                </select>
              </div>

              {field.type === 'option' && (
                <>
                  <input
                    className="w-full p-2 border rounded bg-inherit"
                    placeholder="Contoh: S, M, L, XL (pisahkan dengan koma)"
                    value={field.options || ''}
                    onChange={(e) => updateField(i, 'options', e.target.value)}
                    required
                  />
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.multiple || false}
                      onChange={(e) => updateField(i, 'multiple', e.target.checked)}
                    />
                    Boleh pilih lebih dari satu
                  </label>
                </>
              )}
            </div>
          ))}
        </div>

        <button onClick={addField} className="bg-blue-500 text-white px-4 py-2 rounded">
          ➕ Tambah Pertanyaan
        </button>

        <div className="pt-4">
          <p className="mb-2 font-medium">🔗 Bagikan link ini:</p>
          <div className="flex gap-2 items-center">
            <input className="w-full p-2 border rounded bg-inherit" readOnly value={shortLink} />
            <button
              onClick={copyToClipboard}
              disabled={!isValid || loadingShortLink}
              className={`flex items-center gap-1 px-4 py-2 rounded text-white ${isValid && !loadingShortLink ? 'bg-gray-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {loadingShortLink ? '⏳' : '📋'}
            </button>
          </div>
          {copied && (
            <div className="text-green-600 text-sm pt-1">✅ Link disalin ke clipboard!</div>
          )}
        </div>
      </div>
    </div>
  );
}
