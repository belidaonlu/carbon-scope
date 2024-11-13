import React, { useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Emisyon faktörleri (örnek değerler - gerçek değerlerle değiştirilmeli)
const EMISSION_FACTORS = {
  scope1: {
    stationaryCombustion: {
      "Doğal Gaz": { factor: 2.1, unit: "kg CO2e/m³" },
      "Fuel Oil": { factor: 3.2, unit: "kg CO2e/lt" },
      LPG: { factor: 2.9, unit: "kg CO2e/kg" },
      Kömür: { factor: 2.7, unit: "kg CO2e/kg" },
    },
    mobileCombustion: {
      Benzin: { factor: 2.3, unit: "kg CO2e/lt" },
      Dizel: { factor: 2.7, unit: "kg CO2e/lt" },
      LPG: { factor: 1.6, unit: "kg CO2e/lt" },
    },
    fugitiveEmissions: {
      "R-410A": { factor: 2088, unit: "kg CO2e/kg" },
      "R-407C": { factor: 1774, unit: "kg CO2e/kg" },
      "R-134a": { factor: 1430, unit: "kg CO2e/kg" },
      "R-404A": { factor: 3922, unit: "kg CO2e/kg" },
    },
  },
  scope2: {
    electricity: {
      default: { factor: 0.47, unit: "kg CO2e/kWh" },
    },
    heating: {
      default: { factor: 0.27, unit: "kg CO2e/kWh" },
    },
  },
  scope3: {
    businessTravel: {
      Uçak: { factor: 0.18, unit: "kg CO2e/km" },
      Otobüs: { factor: 0.03, unit: "kg CO2e/km" },
      Tren: { factor: 0.01, unit: "kg CO2e/km" },
      Taksi: { factor: 0.14, unit: "kg CO2e/km" },
    },
    employeeCommuting: {
      default: { factor: 0.14, unit: "kg CO2e/km" },
    },
    wasteDisposal: {
      "Düzenli Depolama": { factor: 0.59, unit: "kg CO2e/kg" },
      Yakma: { factor: 0.99, unit: "kg CO2e/kg" },
      "Geri Dönüşüm": { factor: 0.02, unit: "kg CO2e/kg" },
      Kompost: { factor: 0.1, unit: "kg CO2e/kg" },
    },
    upstreamTransportation: {
      "Kara Nakliyesi": { factor: 0.062, unit: "kg CO2e/ton-km" },
      "Deniz Nakliyesi": { factor: 0.008, unit: "kg CO2e/ton-km" },
      "Hava Nakliyesi": { factor: 0.602, unit: "kg CO2e/ton-km" },
      Demiryolu: { factor: 0.028, unit: "kg CO2e/ton-km" },
    },
  },
};

const EmissionSummary = ({ entries }) => {
  const calculations = useMemo(() => {
    console.log("Gelen entries:", entries); // Debug için

    const results = {
      byScope: {
        scope1: {
          total: 0,
          entries: [],
          details: {
            kazanlar: 0,
            fırinlar: 0,
            turbinler: 0,
            ismakineleri: 0,
          },
        },
        scope2: { total: 0, entries: [] },
        scope3: { total: 0, entries: [] },
      },
      totalEmissions: 0,
    };

    entries.forEach((entry) => {
      console.log("İşlenen entry:", entry); // Debug için

      let emission = 0;
      const { scopeKey, subKey, source, consumption, amount, distance } = entry;

      // Emisyon hesaplama mantığı
      if (scopeKey === "scope1") {
        switch (subKey) {
          case "stationaryCombustion":
            emission = consumption ? consumption * 2.1 : 0; // Örnek çarpan
            results.byScope.scope1.details[source.toLowerCase()] = emission;
            break;
          case "mobileCombustion":
            emission = consumption ? consumption * 2.3 : 0;
            break;
          case "fugitiveEmissions":
            emission = amount ? amount * 1430 : 0;
            break;
        }
      } else if (scopeKey === "scope2") {
        emission = consumption ? consumption * 0.47 : 0;
      } else if (scopeKey === "scope3") {
        emission = distance ? distance * 0.14 : 0;
      }

      // Sonuçları kaydet
      results.byScope[scopeKey].total += emission;
      results.byScope[scopeKey].entries.push({
        source,
        emission,
        description: `${source}: ${emission.toFixed(2)} kg CO2e`,
      });
    });

    // Toplam emisyonu hesapla
    results.totalEmissions = Object.values(results.byScope).reduce(
      (sum, scope) => sum + scope.total,
      0
    );

    console.log("Hesaplanan sonuçlar:", results); // Debug için
    return results;
  }, [entries]);

  const chartData = [
    { name: "Kapsam 1", Emisyon: calculations.byScope.scope1.total / 1000 },
    { name: "Kapsam 2", Emisyon: calculations.byScope.scope2.total / 1000 },
    { name: "Kapsam 3", Emisyon: calculations.byScope.scope3.total / 1000 },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">Karbon Emisyonu Özeti</h3>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-4">Toplam Emisyonlar</h3>
            <div className="space-y-4">
              {/* Kapsam 1 Detayları */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Kapsam 1</h4>
                <p className="text-2xl font-bold mb-2">
                  {(calculations.byScope.scope1.total / 1000).toFixed(2)} ton
                  CO2e
                </p>
                <div className="text-sm text-muted-foreground">
                  {Object.entries(calculations.byScope.scope1.details).map(
                    ([key, value]) =>
                      value > 0 && (
                        <p key={key}>
                          {key}: {(value / 1000).toFixed(2)} ton CO2e
                        </p>
                      )
                  )}
                </div>
              </div>

              {/* Kapsam 2 */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Kapsam 2</h4>
                <p className="text-2xl font-bold">
                  {(calculations.byScope.scope2.total / 1000).toFixed(2)} ton
                  CO2e
                </p>
              </div>

              {/* Kapsam 3 */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Kapsam 3</h4>
                <p className="text-2xl font-bold">
                  {(calculations.byScope.scope3.total / 1000).toFixed(2)} ton
                  CO2e
                </p>
              </div>

              {/* Toplam */}
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-medium mb-2">Toplam Emisyon</h4>
                <p className="text-3xl font-bold text-primary">
                  {(calculations.totalEmissions / 1000).toFixed(2)} ton CO2e
                </p>
              </div>
            </div>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "ton CO2e",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(2)} ton CO2e`]}
                />
                <Legend />
                <Bar dataKey="Emisyon" fill="#0ea5e9" name="Emisyon" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmissionSummary;
