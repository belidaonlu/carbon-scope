import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EmissionSummary from "./EmissionSummary";

// Tooltip komponenti
const Tooltip = ({ content, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="invisible group-hover:visible absolute z-50 w-48 p-2 bg-gray-900 text-white text-sm rounded-md -left-20 top-full mt-2">
      {content}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
    </div>
  </div>
);

// Progress indikatörü
const ProgressIndicator = ({ total, completed }) => {
  const percentage = (completed / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Yeni form header komponenti
const FormHeader = ({ title, description }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Tooltip content={description}>
        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
      </Tooltip>
    </div>
  </div>
);

// Geliştirilmiş select komponenti
const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
  tooltip,
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label>{label}</Label>
      {tooltip && (
        <Tooltip content={tooltip}>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </Tooltip>
      )}
    </div>
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

// Geliştirilmiş giriş kartı
const EntryCard = ({ entry, onDelete }) => (
  <div className="p-4 rounded-md border bg-muted/50 relative group">
    {onDelete && (
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(entry.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    )}
    <p className="font-medium mb-2">{entry.source}</p>
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(entry).map(([key, value]) => {
        if (["id", "scopeKey", "subKey", "source"].includes(key)) return null;
        return (
          <div key={key} className="text-sm">
            <span className="text-muted-foreground">{key}: </span>
            <span className="font-medium">{value}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// Ana form komponenti
const EmissionForm = ({
  fields,
  scopeKey,
  subKey,
  formData,
  onInputChange,
  onAddEntry,
  selectedSource,
}) => {
  const [isValid, setIsValid] = useState(false);

  const validateForm = () => {
    const currentData = formData[scopeKey]?.[subKey] || {};
    const requiredFields = fields.filter((f) => !f.optional);
    const isComplete = requiredFields.every(
      (field) =>
        currentData[field.name] &&
        currentData[field.name].toString().trim() !== ""
    );
    setIsValid(isComplete);
    return isComplete;
  };

  React.useEffect(() => {
    validateForm();
  }, [formData, scopeKey, subKey]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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
                tooltip={field.description}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.description && (
                    <Tooltip content={field.description}>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </Tooltip>
                  )}
                </div>
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[scopeKey]?.[subKey]?.[field.name] || ""}
                  onChange={(e) =>
                    onInputChange(scopeKey, subKey, field.name, e.target.value)
                  }
                  className={field.error ? "border-red-500" : ""}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <Button
        className="w-full"
        disabled={!isValid}
        onClick={() => onAddEntry(scopeKey, subKey)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Veri Ekle
      </Button>
    </div>
  );
};

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

// Ana komponent
const EmissionCategories = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedSource, setSelectedSource] = useState("");
  const [formData, setFormData] = useState({});
  const [entries, setEntries] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Toplam ve tamamlanan giriş sayısını hesapla
  const totalSources = Object.values(categories).reduce(
    (acc, scope) =>
      acc +
      Object.values(scope.subcategories).reduce(
        (subAcc, subcat) => subAcc + subcat.sources.length,
        0
      ),
    0
  );

  const completedEntries = entries.length;

  // handleInputChange fonksiyonu
  const handleInputChange = (scopeKey, subKey, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [scopeKey]: {
        ...prev[scopeKey],
        [subKey]: {
          ...(prev[scopeKey]?.[subKey] || {}),
          [fieldName]: value,
        },
      },
    }));
  };

  // handleAddEntry fonksiyonu
  const handleAddEntry = (scopeKey, subKey) => {
    const currentData = formData[scopeKey]?.[subKey];
    if (!currentData || !selectedSource) return;

    const newEntry = {
      id: Date.now(),
      scopeKey,
      subKey,
      source: selectedSource,
      ...currentData,
    };

    setEntries((prev) => [...prev, newEntry]);

    // Formu temizle
    setFormData((prev) => ({
      ...prev,
      [scopeKey]: {
        ...prev[scopeKey],
        [subKey]: {},
      },
    }));
    setSelectedSource("");

    // Başarı mesajını göster
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return categories;

    const filtered = {};
    Object.entries(categories).forEach(([scopeKey, scope]) => {
      const matchingSubcats = {};
      Object.entries(scope.subcategories).forEach(([subKey, subcat]) => {
        if (
          subcat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subcat.sources.some((source) =>
            source.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ) {
          matchingSubcats[subKey] = subcat;
        }
      });
      if (Object.keys(matchingSubcats).length > 0) {
        filtered[scopeKey] = {
          ...scope,
          subcategories: matchingSubcats,
        };
      }
    });
    return filtered;
  }, [searchTerm, categories]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Sera Gazı Emisyon Kategorileri</h1>
        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Kategori veya kaynak ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={() => window.print()}>
            Rapor Al
          </Button>
        </div>
      </div>

      <ProgressIndicator total={totalSources} completed={completedEntries} />

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Veri başarıyla eklendi!
          </AlertDescription>
        </Alert>
      )}

      {/* EmissionSummary komponenti burada */}
      {entries.length > 0 && <EmissionSummary entries={entries} />}

      <div className="grid gap-4">
        {Object.entries(filteredCategories).map(([scopeKey, scope]) => (
          <Card key={scopeKey} className="overflow-hidden">
            <button
              className="w-full px-6 py-4 text-left hover:bg-accent rounded-t-lg font-medium flex items-center justify-between"
              onClick={() =>
                setActiveCategory(activeCategory === scopeKey ? null : scopeKey)
              }
            >
              <div className="flex items-center gap-4">
                <span>{scope.title}</span>
                <span className="text-sm text-muted-foreground">
                  ({Object.keys(scope.subcategories).length} kategori)
                </span>
              </div>
              {activeCategory === scopeKey ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {activeCategory === scopeKey && (
              <CardContent className="divide-y">
                {Object.entries(scope.subcategories).map(([subKey, subcat]) => (
                  <div key={subKey} className="py-6 first:pt-0 last:pb-0">
                    <FormHeader
                      title={subcat.title}
                      description={
                        subcat.description ||
                        "Bu kategori için veri girişi yapın"
                      }
                    />

                    <div className="space-y-6">
                      <SelectField
                        label="Emisyon Kaynağı"
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        options={subcat.sources}
                        placeholder="Kaynak seçiniz"
                        tooltip="Emisyon kaynağını seçin"
                      />

                      {subcat.fuelTypes && (
                        <SelectField
                          label="Yakıt Türü"
                          value={formData[scopeKey]?.[subKey]?.fuelType || ""}
                          onChange={(e) =>
                            handleInputChange(
                              scopeKey,
                              subKey,
                              "fuelType",
                              e.target.value
                            )
                          }
                          options={subcat.fuelTypes}
                          placeholder="Yakıt türü seçiniz"
                          tooltip="Kullanılan yakıt türünü seçin"
                        />
                      )}

                      {selectedSource && (
                        <div className="rounded-lg border bg-card p-4">
                          <EmissionForm
                            fields={subcat.fields}
                            scopeKey={scopeKey}
                            subKey={subKey}
                            formData={formData}
                            onInputChange={handleInputChange}
                            onAddEntry={handleAddEntry}
                            selectedSource={selectedSource}
                          />
                        </div>
                      )}

                      {entries.filter(
                        (e) => e.scopeKey === scopeKey && e.subKey === subKey
                      ).length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            Eklenen Kayıtlar
                            <span className="text-sm text-muted-foreground">
                              (
                              {
                                entries.filter(
                                  (e) =>
                                    e.scopeKey === scopeKey &&
                                    e.subKey === subKey
                                ).length
                              }
                              )
                            </span>
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {entries
                              .filter(
                                (e) =>
                                  e.scopeKey === scopeKey && e.subKey === subKey
                              )
                              .map((entry) => (
                                <EntryCard
                                  key={entry.id}
                                  entry={entry}
                                  onDelete={(id) => {
                                    setEntries(
                                      entries.filter((e) => e.id !== id)
                                    );
                                    setShowSuccess(false);
                                  }}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmissionCategories;
