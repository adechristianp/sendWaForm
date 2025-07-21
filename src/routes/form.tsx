/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
// src/routes/form.tsx
import { useEffect, useState } from 'react';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { decodeForm } from '../lib/formUtils';
import { useTheme } from '@/context/ThemeContext';

export const Route = createFileRoute('/form')({
  component: FormPage,
});

type Values = {
  [key: string]: any;
};

function FormPage() {
  const { data, darkMode: darkQuery } = useSearch({} as any);

  const form = decodeForm(data);
  const [values, setValues] = useState<Values>({});
  const { darkMode, setDarkMode } = useTheme();

  useEffect(() => {
    if (typeof darkQuery === 'boolean') {
      setDarkMode(darkQuery);
    } else if (darkQuery === 'true') {
      setDarkMode(true);
    } else if (darkQuery === 'false') {
      setDarkMode(false);
    }
  }, [darkQuery]);

  if (!form) return <div className="p-4">Invalid form data.</div>;

  const handleOptionMultipleChange = (label: string, option: string, checked: boolean) => {
    const current = values[label] || [];
    const updated = checked
      ? [...current, { name: option, count: '' }]
      : current.filter((item: any) => item.name !== option);

    setValues({ ...values, [label]: updated });
  };

  const handleOptionCountChange = (label: string, option: string, count: string) => {
    const current = values[label] || [];
    const updated = current.map((item: any) =>
      item.name === option ? { ...item, count } : item
    );
    setValues({ ...values, [label]: updated });
  };

  const handleChange = (label: string, value: string) => {
    // Ubah nomor HP dari 08... jadi 628...
    if (label.toLowerCase().includes('no') && value.startsWith('08')) {
      value = '628' + value.slice(2);
    }
    setValues({ ...values, [label]: value });
  };

  const message = `*${form.title}*\n\n` + form.fields
    .map((f: any) => {
      const val = values[f.label];
      if (f.multiple && Array.isArray(val)) {
        return val.length
          ? `• ${f.label}:\n${val.map((v: any) => `  - ${v.name} (${v.count || 0})`).join('\n')}`
          : `• ${f.label}: (kosong)`;
      }
      return `• ${f.label}: ${val || ''}`;
    })
    .join('\n');

  const waNumber = form.waNumber?.replace(/\D/g, '');
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen p-4`}>
      <div className={`${darkMode ? 'bg-gray-950' : 'bg-gray-100'} max-w-xl mx-auto rounded p-4 space-y-4`}>
        <h1 className="text-xl font-bold">{form.title}</h1>

        <form className="space-y-4">
          {form.fields.map((f: any, idx: number) => (
            <div key={idx}>
              <label className="block mb-1 font-medium">{f.label}</label>

              {f.type === 'option' && f.multiple ? (
                // MULTIPLE CHECKBOX WITH COUNT
                <div className="space-y-2">
                  {(f.options || '').split(',').map((opt: string, i: number) => {
                    const isChecked = (values[f.label] || []).some((v: any) => v.name === opt.trim());
                    const currentItem = (values[f.label] || []).find((v: any) => v.name === opt.trim());
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleOptionMultipleChange(f.label, opt.trim(), e.target.checked)}
                        />
                        <span className="w-32">{opt.trim()}</span>
                        {isChecked && (
                          <input
                            type="number"
                            placeholder="Jumlah"
                            className="w-24 p-1 border rounded bg-inherit"
                            value={currentItem?.count || ''}
                            onChange={(e) => handleOptionCountChange(f.label, opt.trim(), e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : f.type === 'option' ? (
                // SINGLE SELECT OPTION
                <select
                  className="w-full p-2 border rounded bg-inherit"
                  onChange={(e) => handleChange(f.label, e.target.value)}
                >
                  <option value="">-- Pilih salah satu --</option>
                  {(f.options || '').split(',').map((opt: string, i: number) => (
                    <option key={i} value={opt.trim()}>{opt.trim()}</option>
                  ))}
                </select>
              ) : (
                // TEXT INPUT
                <input
                  className="w-full p-2 border rounded bg-inherit"
                  placeholder={`Tulis jawaban untuk ${f.label}`}
                  onChange={(e) => handleChange(f.label, e.target.value)}
                />
              )}
            </div>
          ))}
        </form>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-green-600 text-white px-4 py-2 rounded"
        >
          Kirim ke WhatsApp
        </a>
      </div>
    </div>
  );
}
