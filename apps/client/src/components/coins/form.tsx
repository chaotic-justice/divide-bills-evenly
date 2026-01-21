import React from 'react';
import { type UseFormReturn, type FieldPath } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { type BillCounterFormData } from '@/schemas/billCounter';
import { Button } from '../ui/button';
import { Minus, Plus } from 'lucide-react';

interface BillCounterFormProps {
  form: UseFormReturn<BillCounterFormData>;
}

const BILL_DENOMINATIONS = [
	{
		value: 100,
		label: "$100 Bills",
		field: "100" as const,
		color: "bg-success text-success-foreground",
	},
	{
		value: 50,
		label: "$50 Bills",
		field: "50" as const,
		color: "bg-warning text-warning-foreground",
	},
	{
		value: 20,
		label: "$20 Bills",
		field: "20" as const,
		color: "bg-accent text-accent-foreground",
	},
	{
		value: 10,
		label: "$10 Bills",
		field: "10" as const,
		color: "bg-chart-2 text-white",
	},
	{
		value: 5,
		label: "$5 Bills",
		field: "5" as const,
		color: "bg-chart-4 text-white",
	},
];

/**
 * Reusable component for a single denomination input with increment/decrement buttons
 */
interface DenominationInputProps {
  denom: typeof BILL_DENOMINATIONS[0];
  value: number;
  onChange: (value: number) => void;
}

const DenominationInput: React.FC<DenominationInputProps> = ({ denom, value, onChange }) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value > 0) onChange(value - 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value === 0}
        className="w-10 h-10 shrink-0"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <Input
        value={value.toString()}
        type="number"
        min="0"
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="font-mono text-lg text-center"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        className="w-10 h-10 shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <div className={`px-3 py-2 rounded-md text-sm font-medium min-w-20 text-center ${denom.color}`}>
        ${(denom.value * value).toLocaleString()}
      </div>
    </div>
  );
};

/**
 * Form component for bill counter with denomination selection and subtraction options
 */
const BillCounterForm: React.FC<BillCounterFormProps> = ({ form }) => {
  return (
    <>
      {BILL_DENOMINATIONS.map((denom) => (
        <FormField
          key={denom.value}
          control={form.control}
          name={denom.field}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">{denom.label}</FormLabel>
              <FormControl>
                <DenominationInput
                  denom={denom}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      {/* Imperfect options: target amount and allowed denominations */}
      <FormItem>
        <FormLabel className="text-base">Target amount to subtract</FormLabel>
        <FormField
          control={form.control}
          name={"targetAmount" as const}
          render={({ field }) => (
            <>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  value={field.value?.toString() || 0}
                  min={0}
                  onFocus={(e) => {
                    if (!field.value) {
                      e.currentTarget.select();
                    }
                  }}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </>
          )}
        />
      </FormItem>

      <FormItem>
        <FormLabel className="text-base">Allowed denominations for subtraction</FormLabel>
        <div className="grid gap-2">
          {BILL_DENOMINATIONS.map((denom) => (
            <FormField
              key={denom.field}
              control={form.control}
              name={("allowedDenominations." + denom.field) as FieldPath<BillCounterFormData>}
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <label className="inline-flex items-center gap-2">
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{denom.label}</span>
                    </label>
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>
        <FormMessage />
      </FormItem>
    </>
  );
};

export default BillCounterForm;