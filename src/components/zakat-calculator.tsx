"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info } from "lucide-react";

const fields = [
  { key: "gold", label: "Gold Value (USD)" },
  { key: "silver", label: "Silver Value (USD)" },
  { key: "cash", label: "Cash & Savings (USD)" },
  { key: "business", label: "Business Assets (USD)" },
  { key: "receivables", label: "Receivables / Owed to You (USD)" },
];

export function ZakatCalculator() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | null>(null);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setResult(null);
  };

  const calculate = () => {
    const total = fields.reduce(
      (sum, f) => sum + (parseFloat(values[f.key] || "0") || 0),
      0
    );
    setResult(total * 0.025);
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
            <Calculator className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-charcoal">
              Zakat Calculator
            </h3>
            <p className="text-xs text-muted-foreground">
              Calculate your annual zakat obligation
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-charcoal mb-1.5">
                {f.label}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={values[f.key] || ""}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={calculate}
          className="bg-gold hover:bg-gold-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm"
        >
          <Calculator className="size-4 mr-2" />
          Calculate Zakat
        </Button>

        {result !== null && (
          <div className="mt-5 rounded-xl bg-sage/5 border border-sage/20 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Your Zakat Due (2.5%)
            </p>
            <p className="font-heading text-3xl font-bold text-sage">
              ${result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="size-3.5 mt-0.5 shrink-0 text-sage" />
          <p>
            <span className="font-medium text-charcoal">Nisab threshold:</span>{" "}
            Zakat is obligatory when your total eligible wealth exceeds the value
            of 87.48g of gold or 612.36g of silver. Consult a scholar for
            specific rulings on your situation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
