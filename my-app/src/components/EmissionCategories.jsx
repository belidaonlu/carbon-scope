import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}) => (
  <div className="space-y-2">
    {label && <Label>{label}</Label>}
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      value={value}
      onChange={onChange}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const EntryCard = ({ entry }) => (
  <div className="p-4 rounded-md border bg-muted/50">
    <p className="font-medium mb-2">{entry.source}</p>
    <div className="space-y-1">
      {Object.entries(entry).map(([key, value]) => {
        if (["id", "scopeKey", "subKey", "source"].includes(key)) return null;
        return (
          <p key={key} className="text-sm text-muted-foreground">
            {key}: {value}
          </p>
        );
      })}
    </div>
  </div>
);

const EmissionForm = ({
  fields,
  scopeKey,
  subKey,
  formData,
  onInputChange,
  onAddEntry,
  selectedSource,
}) => (
  <div className="space-y-4">
    {fields.map((field) => (
      <div key={field.name}>
        {field.type === "select" ? (
          <SelectField
            label={field.label}
            value={formData[scopeKey]?.[subKey]?.[field.name] || ""}
            onChange={(e) =>
              onInputChange(scopeKey, subKey, field.name, e.target.value)
            }
            options={field.options}
            placeholder="Seçiniz"
          />
        ) : (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              value={formData[scopeKey]?.[subKey]?.[field.name] || ""}
              onChange={(e) =>
                onInputChange(scopeKey, subKey, field.name, e.target.value)
              }
            />
          </div>
        )}
      </div>
    ))}
    <Button
      variant="outline"
      className="w-full"
      onClick={() => onAddEntry(scopeKey, subKey)}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      Ekle
    </Button>
  </div>
);

const SubcategorySection = ({
  subcat,
  subKey,
  scopeKey,
  selectedSource,
  formData,
  onSourceChange,
  onInputChange,
  onAddEntry,
  entries,
}) => (
  <div className="space-y-6 pb-6 border-b last:border-b-0 last:pb-0">
    <h3 className="font-medium">{subcat.title}</h3>

    <div className="space-y-4">
      <SelectField
        label="Kaynak"
        value={selectedSource}
        onChange={(e) => onSourceChange(e.target.value)}
        options={subcat.sources}
        placeholder="Kaynak seçiniz"
      />

      {subcat.fuelTypes && (
        <SelectField
          label="Yakıt Türü"
          options={subcat.fuelTypes}
          value={formData[scopeKey]?.[subKey]?.fuelType || ""}
          onChange={(e) =>
            onInputChange(scopeKey, subKey, "fuelType", e.target.value)
          }
          placeholder="Yakıt türü seçiniz"
        />
      )}

      {selectedSource && subcat.fields && (
        <div className="pl-4 border-l-2 border-primary/20">
          <EmissionForm
            fields={subcat.fields}
            scopeKey={scopeKey}
            subKey={subKey}
            formData={formData}
            onInputChange={onInputChange}
            onAddEntry={onAddEntry}
            selectedSource={selectedSource}
          />
        </div>
      )}

      {entries.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Eklenen Kayıtlar</h4>
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const categories = {
  scope1: {
    title: "Kapsam 1 - Doğrudan Emisyonlar",
    subcategories: {
      stationaryCombustion: {
        title: "Sabit Yakma Kaynaklı Emisyonlar",
        sources: ["Kazanlar", "Fırınlar", "Türbinler", "Isıtıcılar"],
        fuelTypes: ["Doğal Gaz", "Fuel Oil", "LPG", "Kömür"],
        fields: [
          { name: "consumption", label: "Yakıt Tüketimi", type: "number" },
          {
            name: "unit",
            label: "Birim",
            type: "select",
            options: ["m³", "kg", "lt"],
          },
          { name: "operatingHours", label: "Çalışma Saati", type: "number" },
        ],
      },
      mobileCombustion: {
        title: "Hareketli Yakma Kaynaklı Emisyonlar",
        sources: ["Şirkete ait araçlar", "Forkliftler", "İş makineleri"],
        fuelTypes: ["Benzin", "Dizel", "LPG"],
        fields: [
          { name: "consumption", label: "Yakıt Tüketimi", type: "number" },
          {
            name: "unit",
            label: "Birim",
            type: "select",
            options: ["lt", "kg"],
          },
          { name: "distance", label: "Kat edilen mesafe (km)", type: "number" },
        ],
      },
      fugitiveEmissions: {
        title: "Kaçak Emisyonlar",
        sources: ["Soğutucular", "Klima Sistemleri", "Yangın Söndürücüler"],
        fields: [
          {
            name: "refrigerantType",
            label: "Soğutucu Türü",
            type: "select",
            options: ["R-410A", "R-407C", "R-134a", "R-404A"],
          },
          { name: "amount", label: "Kullanılan Miktar", type: "number" },
          { name: "unit", label: "Birim", type: "select", options: ["kg"] },
        ],
      },
    },
  },
  scope2: {
    title: "Kapsam 2 - Dolaylı Emisyonlar",
    subcategories: {
      electricity: {
        title: "Elektrik Tüketimi",
        sources: ["Ofis Binaları", "Üretim Tesisleri", "Depolar", "Aydınlatma"],
        fields: [
          { name: "consumption", label: "Elektrik Tüketimi", type: "number" },
          {
            name: "unit",
            label: "Birim",
            type: "select",
            options: ["kWh", "MWh"],
          },
          { name: "billingPeriod", label: "Fatura Dönemi", type: "text" },
        ],
      },
      heating: {
        title: "Isıtma/Soğutma",
        sources: ["Merkezi Sistem", "Bireysel Sistemler"],
        fields: [
          { name: "consumption", label: "Tüketim", type: "number" },
          {
            name: "unit",
            label: "Birim",
            type: "select",
            options: ["kWh", "MWh", "kcal"],
          },
          { name: "period", label: "Dönem", type: "text" },
        ],
      },
    },
  },
  scope3: {
    title: "Kapsam 3 - Diğer Dolaylı Emisyonlar",
    subcategories: {
      businessTravel: {
        title: "İş Seyahatleri",
        sources: ["Uçak", "Otobüs", "Tren", "Taksi"],
        fields: [
          { name: "distance", label: "Mesafe", type: "number" },
          { name: "unit", label: "Birim", type: "select", options: ["km"] },
          { name: "passengers", label: "Yolcu Sayısı", type: "number" },
          { name: "travelDate", label: "Seyahat Tarihi", type: "date" },
        ],
      },
      employeeCommuting: {
        title: "Personel Servis/Ulaşım",
        sources: ["Servis Araçları", "Toplu Taşıma", "Özel Araçlar"],
        fields: [
          { name: "distance", label: "Günlük Mesafe", type: "number" },
          { name: "unit", label: "Birim", type: "select", options: ["km"] },
          { name: "employeeCount", label: "Çalışan Sayısı", type: "number" },
          { name: "workingDays", label: "Çalışma Günü", type: "number" },
        ],
      },
      wasteDisposal: {
        title: "Atık Yönetimi",
        sources: [
          "Evsel Atıklar",
          "Endüstriyel Atıklar",
          "Geri Dönüşüm",
          "Tehlikeli Atıklar",
        ],
        fields: [
          { name: "amount", label: "Atık Miktarı", type: "number" },
          {
            name: "unit",
            label: "Birim",
            type: "select",
            options: ["kg", "ton"],
          },
          {
            name: "disposalMethod",
            label: "Bertaraf Yöntemi",
            type: "select",
            options: ["Düzenli Depolama", "Yakma", "Geri Dönüşüm", "Kompost"],
          },
        ],
      },
      purchasedGoods: {
        title: "Satın Alınan Ürün ve Hizmetler",
        sources: [
          "Hammaddeler",
          "Yarı Mamüller",
          "Ambalaj Malzemeleri",
          "Ofis Malzemeleri",
        ],
        fields: [
          { name: "materialType", label: "Malzeme Türü", type: "text" },
          { name: "amount", label: "Miktar", type: "number" },
          {
            name: "unit",
            label: "Birim",
            type: "select",
            options: ["kg", "ton", "adet"],
          },
          { name: "supplier", label: "Tedarikçi", type: "text" },
        ],
      },
      upstreamTransportation: {
        title: "Tedarik Zinciri Nakliye",
        sources: [
          "Kara Nakliyesi",
          "Deniz Nakliyesi",
          "Hava Nakliyesi",
          "Demiryolu",
        ],
        fields: [
          { name: "distance", label: "Mesafe", type: "number" },
          { name: "unit", label: "Birim", type: "select", options: ["km"] },
          { name: "weight", label: "Taşınan Yük", type: "number" },
          {
            name: "weightUnit",
            label: "Yük Birimi",
            type: "select",
            options: ["kg", "ton"],
          },
        ],
      },
    },
  },
};

const EmissionCategories = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedSource, setSelectedSource] = useState("");
  const [formData, setFormData] = useState({});
  const [entries, setEntries] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (scopeKey, subKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [scopeKey]: {
        ...prev[scopeKey],
        [subKey]: {
          ...prev[scopeKey]?.[subKey],
          [field]: value,
        },
      },
    }));
  };

  const handleAddEntry = (scopeKey, subKey) => {
    const currentFormData = formData[scopeKey]?.[subKey];
    if (!currentFormData || !selectedSource) return;

    const newEntry = {
      id: Date.now(),
      scopeKey,
      subKey,
      source: selectedSource,
      ...currentFormData,
    };

    setEntries((prev) => [...prev, newEntry]);
    setFormData((prev) => ({
      ...prev,
      [scopeKey]: {
        ...prev[scopeKey],
        [subKey]: {},
      },
    }));
    setSelectedSource("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Sera Gazı Emisyon Kategorileri</h1>

      {showSuccess && <Alert variant="success">Kayıt başarıyla eklendi!</Alert>}

      {Object.entries(categories).map(([scopeKey, scope]) => (
        <Card key={scopeKey}>
          <button
            className="w-full px-6 py-4 text-left hover:bg-accent rounded-t-lg font-medium flex justify-between items-center"
            onClick={() =>
              setActiveCategory(activeCategory === scopeKey ? null : scopeKey)
            }
          >
            <span>{scope.title}</span>
            {activeCategory === scopeKey ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {activeCategory === scopeKey && (
            <CardContent>
              {Object.entries(scope.subcategories).map(([subKey, subcat]) => (
                <SubcategorySection
                  key={subKey}
                  subcat={subcat}
                  subKey={subKey}
                  scopeKey={scopeKey}
                  selectedSource={selectedSource}
                  formData={formData}
                  onSourceChange={setSelectedSource}
                  onInputChange={handleInputChange}
                  onAddEntry={handleAddEntry}
                  entries={entries.filter(
                    (entry) =>
                      entry.scopeKey === scopeKey && entry.subKey === subKey
                  )}
                />
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default EmissionCategories;
