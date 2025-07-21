/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
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
  const [formTouched, setFormTouched] = useState(false);

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
      ? [...current, { name: option, count: '1' }]
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
    if (label.toLowerCase().includes('no') && value.startsWith('08')) {
      value = '628' + value.slice(2);
    }
    setValues({ ...values, [label]: value });
  };

  const getFieldError = (field: any, val: any): string | null => {
    if (field.type === 'option' && field.multiple) {
      if (!val || val.length === 0) return 'Wajib pilih minimal satu';
      if (val.some((v: any) => !v.count || Number(v.count) < 1)) {
        return 'Jumlah harus minimal 1';
      }
    } else {
      if (!val || val === '') return 'Wajib diisi';
    }
    return null;
  };

  const isFormValid = () => {
    return form.fields.every((f: any) => !getFieldError(f, values[f.label]));
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
    <div className={`${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-black'} p-4`}>
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'} max-w-xl mx-auto rounded p-4 space-y-4`}>
        <h1 className="text-xl font-bold">{form.title}</h1>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {form.fields.map((f: any, idx: number) => {
            const val = values[f.label];
            const error = getFieldError(f, val);

            return (
              <div key={idx}>
                <label className="block mb-1 font-medium">{f.label}</label>

                {f.type === 'option' && f.multiple ? (
                  <div className="space-y-2">
                    {(f.options || '').split(',').map((opt: string, i: number) => {
                      const isChecked = (val || []).some((v: any) => v.name === opt.trim());
                      const currentItem = (val || []).find((v: any) => v.name === opt.trim());
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              handleOptionMultipleChange(f.label, opt.trim(), e.target.checked)
                            }
                          />
                          <span className="w-32">{opt.trim()}</span>
                          {isChecked && (
                            <input
                              type="number"
                              min={1}
                              placeholder="Jumlah"
                              className="w-24 p-1 border rounded bg-inherit"
                              value={currentItem?.count || ''}
                              onChange={(e) =>
                                handleOptionCountChange(f.label, opt.trim(), e.target.value)
                              }
                              onBlur={() => setFormTouched(true)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : f.type === 'option' ? (
                  <select
                    className="w-full p-2 border rounded bg-inherit"
                    value={val || ''}
                    onChange={(e) => handleChange(f.label, e.target.value)}
                    onBlur={() => setFormTouched(true)}
                  >
                    <option value="">-- Pilih salah satu --</option>
                    {(f.options || '').split(',').map((opt: string, i: number) => (
                      <option key={i} value={opt.trim()}>{opt.trim()}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="w-full p-2 border rounded bg-inherit"
                    placeholder={`Tulis jawaban untuk ${f.label}`}
                    value={val || ''}
                    onChange={(e) => handleChange(f.label, e.target.value)}
                    onBlur={() => setFormTouched(true)}
                  />
                )}

                {formTouched && error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            );
          })}
        </form>

        <button
          type="button"
          onClick={() => {
            setFormTouched(true);
            if (isFormValid()) {
              window.open(waLink, '_blank');
            }
          }}
          className={`block text-center w-full ${
            isFormValid()
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white px-4 py-2 rounded`}
        >
          Kirim ke WhatsApp
        </button>

        {formTouched && isFormValid() && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center mt-2 text-blue-500 underline"
          >
            Klik di sini jika tidak redirect otomatis
          </a>
        )}
      </div>
    </div>
  );
}
