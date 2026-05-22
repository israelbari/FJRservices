import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { SectionTypeField } from '../types';

interface DynamicSectionFormProps {
  configSchema: string;
  value: string; // JSON string
  onChange: (value: string) => void;
}

export function DynamicSectionForm({ configSchema, value, onChange }: DynamicSectionFormProps) {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [fields, setFields] = useState<SectionTypeField[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(configSchema || '[]');
      setFields(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFields([]);
    }
  }, [configSchema]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '{}');
      setData(typeof parsed === 'object' && parsed !== null ? parsed : {});
    } catch {
      setData({});
    }
  }, [value]);

  const updateField = (name: string, fieldValue: unknown) => {
    const next = { ...data, [name]: fieldValue };
    setData(next);
    onChange(JSON.stringify(next, null, 2));
  };

  const renderField = (field: SectionTypeField, prefix = '') => {
    const fieldName = prefix ? `${prefix}.${field.name}` : field.name;
    const val = prefix
      ? ((data[prefix.split('.')[0]] as Record<string, unknown> | undefined)?.[field.name])
      : data[field.name];

    switch (field.type) {
      case 'text':
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#374151]">{field.label}</Label>
            <Input
              value={typeof val === 'string' ? val : field.default?.toString() || ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={field.label}
              className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#374151]">{field.label}</Label>
            <Textarea
              value={typeof val === 'string' ? val : field.default?.toString() || ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={field.label}
              rows={3}
              className="border-[#D1D5DB] rounded-lg focus-visible:ring-[#4A90D9] focus-visible:ring-[3px] resize-none"
            />
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#374151]">{field.label}</Label>
            <Input
              type="number"
              value={typeof val === 'number' ? val : typeof val === 'string' ? val : field.default?.toString() || ''}
              onChange={(e) => updateField(field.name, e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={field.label}
              className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
            />
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#374151]">{field.label}</Label>
            <Select
              value={typeof val === 'string' ? val : field.default?.toString() || ''}
              onValueChange={(v) => updateField(field.name, v)}
            >
              <SelectTrigger className="w-full border-[#D1D5DB] rounded-lg h-[42px] focus:ring-[#4A90D9] focus:ring-[3px]">
                <SelectValue placeholder={`Selecciona ${field.label}`} />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-[#E2E8F0]">
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'boolean':
        return (
          <div key={fieldName} className="flex items-center justify-between py-2">
            <Label className="text-[13px] font-medium text-[#374151]">{field.label}</Label>
            <Switch
              checked={typeof val === 'boolean' ? val : !!field.default}
              onCheckedChange={(v) => updateField(field.name, v)}
              className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#D1D5DB]"
            />
          </div>
        );

      case 'array-text':
        return (
          <ArrayTextField
            key={fieldName}
            label={field.label}
            value={Array.isArray(val) ? val : []}
            onChange={(v) => updateField(field.name, v)}
          />
        );

      case 'array-object':
        return (
          <ArrayObjectField
            key={fieldName}
            label={field.label}
            fields={field.fields || []}
            value={Array.isArray(val) ? val : []}
            onChange={(v) => updateField(field.name, v)}
          />
        );

      default:
        return null;
    }
  };

  if (fields.length === 0) {
    return (
      <div>
        <Label className="text-[13px] font-medium text-[#374151] mb-1.5 block">Contenido (JSON)</Label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="border-[#D1D5DB] rounded-lg focus-visible:ring-[#4A90D9] focus-visible:ring-[3px] resize-none font-mono text-xs"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => renderField(field))}
    </div>
  );
}

function ArrayTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(value);

  useEffect(() => {
    setItems(value);
  }, [value]);

  const updateItems = (next: string[]) => {
    setItems(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-medium text-[#374151]">{label}</Label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                updateItems(next);
              }}
              className="border-[#D1D5DB] rounded-lg h-[42px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateItems(items.filter((_, i) => i !== idx))}
              className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEE2E2] h-[42px] w-[42px] p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateItems([...items, ''])}
        className="h-8 px-3 text-[12px] border-[#4A90D9] text-[#4A90D9] hover:bg-[#EFF6FF]"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Agregar
      </Button>
    </div>
  );
}

function ArrayObjectField({
  label,
  fields,
  value,
  onChange,
}: {
  label: string;
  fields: SectionTypeField[];
  value: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const [items, setItems] = useState<Record<string, unknown>[]>(value);

  useEffect(() => {
    setItems(value);
  }, [value]);

  const updateItems = (next: Record<string, unknown>[]) => {
    setItems(next);
    onChange(next);
  };

  const updateItem = (idx: number, fieldName: string, fieldValue: unknown) => {
    const next = [...items];
    next[idx] = { ...next[idx], [fieldName]: fieldValue };
    updateItems(next);
  };

  const addItem = () => {
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.default !== undefined) defaults[f.name] = f.default;
      else if (f.type === 'array-text' || f.type === 'array-object') defaults[f.name] = [];
      else if (f.type === 'boolean') defaults[f.name] = false;
      else if (f.type === 'number') defaults[f.name] = 0;
      else defaults[f.name] = '';
    });
    updateItems([...items, defaults]);
  };

  return (
    <div className="space-y-3">
      <Label className="text-[13px] font-medium text-[#374151]">{label}</Label>
      {items.map((item, idx) => (
        <div key={idx} className="border border-[#E2E8F0] rounded-lg p-3 space-y-3 bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Item {idx + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateItems(items.filter((_, i) => i !== idx))}
              className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEE2E2] h-7 w-7 p-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          {fields.map((field) => {
            const fieldVal = item[field.name];
            switch (field.type) {
              case 'text':
                return (
                  <div key={field.name} className="space-y-1">
                    <Label className="text-[11px] font-medium text-[#374151]">{field.label}</Label>
                    <Input
                      value={typeof fieldVal === 'string' ? fieldVal : ''}
                      onChange={(e) => updateItem(idx, field.name, e.target.value)}
                      className="border-[#D1D5DB] rounded-lg h-9 text-[13px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                    />
                  </div>
                );
              case 'textarea':
                return (
                  <div key={field.name} className="space-y-1">
                    <Label className="text-[11px] font-medium text-[#374151]">{field.label}</Label>
                    <Textarea
                      value={typeof fieldVal === 'string' ? fieldVal : ''}
                      onChange={(e) => updateItem(idx, field.name, e.target.value)}
                      rows={2}
                      className="border-[#D1D5DB] rounded-lg text-[13px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px] resize-none"
                    />
                  </div>
                );
              case 'number':
                return (
                  <div key={field.name} className="space-y-1">
                    <Label className="text-[11px] font-medium text-[#374151]">{field.label}</Label>
                    <Input
                      type="number"
                      value={typeof fieldVal === 'number' ? fieldVal : typeof fieldVal === 'string' ? fieldVal : ''}
                      onChange={(e) => updateItem(idx, field.name, e.target.value === '' ? '' : Number(e.target.value))}
                      className="border-[#D1D5DB] rounded-lg h-9 text-[13px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
                    />
                  </div>
                );
              case 'select':
                return (
                  <div key={field.name} className="space-y-1">
                    <Label className="text-[11px] font-medium text-[#374151]">{field.label}</Label>
                    <Select
                      value={typeof fieldVal === 'string' ? fieldVal : ''}
                      onValueChange={(v) => updateItem(idx, field.name, v)}
                    >
                      <SelectTrigger className="w-full border-[#D1D5DB] rounded-lg h-9 text-[13px] focus:ring-[#4A90D9] focus:ring-[3px]">
                        <SelectValue placeholder={field.label} />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-[#E2E8F0]">
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              case 'array-text':
                return (
                  <div key={field.name} className="space-y-1">
                    <Label className="text-[11px] font-medium text-[#374151]">{field.label}</Label>
                    <ArrayTextFieldMini
                      value={Array.isArray(fieldVal) ? fieldVal : []}
                      onChange={(v) => updateItem(idx, field.name, v)}
                    />
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="h-8 px-3 text-[12px] border-[#4A90D9] text-[#4A90D9] hover:bg-[#EFF6FF]"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Agregar item
      </Button>
    </div>
  );
}

function ArrayTextFieldMini({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(value);

  useEffect(() => {
    setItems(value);
  }, [value]);

  const updateItems = (next: string[]) => {
    setItems(next);
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-1.5">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[idx] = e.target.value;
              updateItems(next);
            }}
            className="border-[#D1D5DB] rounded-lg h-8 text-[12px] focus-visible:ring-[#4A90D9] focus-visible:ring-[3px]"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateItems(items.filter((_, i) => i !== idx))}
            className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEE2E2] h-8 w-8 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => updateItems([...items, ''])}
        className="h-7 px-2 text-[11px] text-[#4A90D9] hover:bg-[#EFF6FF]"
      >
        <Plus className="w-3 h-3 mr-1" />
        Agregar
      </Button>
    </div>
  );
}
