import React, { useState } from 'react';
import { Card, CardContent } from "./ui/Card";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Button } from "./ui/Button_temp";
import { 
  PlusCircle, 
  Save, 
  Trash2, 
  Download, 
  Edit2, 
  X, 
  Check,
  Upload
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/Alert_temp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/Dialog";

const EmissionCategories = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedSource, setSelectedSource] = useState('');
  const [formData, setFormData] = useState({});
  const [entries, setEntries] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [bulkImportDialog, setBulkImportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  const handleInputChange = (scopeKey, subKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [scopeKey]: {
        ...prev[scopeKey],
        [subKey]: {
          ...prev[scopeKey]?.[subKey],
          [field]: value
        }
      }
    }));
  };

  const showSuccessAlert = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddEntry = (scopeKey, subKey) => {
    const currentFormData = formData[scopeKey]?.[subKey];
    if (!currentFormData || !selectedSource) return;

    const newEntry = {
      id: Date.now(),
      scopeKey,
      subKey,
      source: selectedSource,
      ...currentFormData
    };

    setEntries(prev => [...prev, newEntry]);
    resetForm(scopeKey, subKey);
    showSuccessAlert('Kayıt başarıyla eklendi!');
  };

  const resetForm = (scopeKey, subKey) => {
    setFormData(prev => ({
      ...prev,
      [scopeKey]: {
        ...prev[scopeKey],
        [subKey]: {}
      }
    }));
    setSelectedSource('');
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    setEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
    setShowDeleteDialog(false);
    showSuccessAlert('Kayıt başarıyla silindi!');
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setFormData(prev => ({
      ...prev,
      [entry.scopeKey]: {
        ...prev[entry.scopeKey],
        [entry.subKey]: { ...entry }
      }
    }));
    setSelectedSource(entry.source);
  };

  const handleUpdateEntry = () => {
    const updatedEntries = entries.map(entry =>
      entry.id === editingEntry.id
        ? { ...formData[editingEntry.scopeKey][editingEntry.subKey], id: entry.id }
        : entry
    );
    setEntries(updatedEntries);
    resetForm(editingEntry.scopeKey, editingEntry.subKey);
    setEditingEntry(null);
    showSuccessAlert('Kayıt başarıyla güncellendi!');
  };

  const handleExport = () => {
    const exportData = JSON.stringify(entries, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emisyon-kayitlari.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccessAlert('Veriler başarıyla dışa aktarıldı!');
  };

  const handleBulkImport = () => {
    try {
      const importedData = JSON.parse(importData);
      setEntries(prev => [...prev, ...importedData]);
      setBulkImportDialog(false);
      setImportData('');
      showSuccessAlert('Veriler başarıyla içe aktarıldı!');
    } catch (error) {
      showSuccessAlert('Hata: Geçersiz veri formatı!');
    }
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
            { name: "unit", label: "Birim", type: "select", options: ["m³", "kg", "lt"] },
            { name: "operatingHours", label: "Çalışma Saati", type: "number" }
          ]
        },
        mobileCombustion: {
          title: "Hareketli Yakma Kaynaklı Emisyonlar",
          sources: ["Şirkete ait araçlar", "Forkliftler", "İş makineleri"],
          fuelTypes: ["Benzin", "Dizel", "LPG"],
          fields: [
            { name: "consumption", label: "Yakıt Tüketimi", type: "number" },
            { name: "unit", label: "Birim", type: "select", options: ["lt", "kg"] },
            { name: "distance", label: "Kat edilen mesafe (km)", type: "number" }
          ]
        }
      }
    },
    scope2: {
      title: "Kapsam 2 - Enerji Dolaylı Emisyonlar",
      subcategories: {
        purchasedElectricity: {
          title: "Satın Alınan Elektrik",
          sources: ["Şebeke elektriği", "Yenilenebilir enerji"],
          fields: [
            { name: "consumption", label: "Elektrik Tüketimi (kWh)", type: "number" },
            { name: "period", label: "Dönem", type: "select", options: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"] }
          ]
        },
        purchasedHeating: {
          title: "Satın Alınan Isı/Soğutma",
          sources: ["Bölgesel ısıtma", "Bölgesel soğutma", "Buhar"],
          fields: [
            { name: "consumption", label: "Tüketim", type: "number" },
            { name: "unit", label: "Birim", type: "select", options: ["kWh", "ton", "kcal"] }
          ]
        }
      }
    },
    scope3: {
      title: "Kapsam 3 - Diğer Dolaylı Emisyonlar",
      subcategories: {
        businessTravel: {
          title: "İş Seyahatleri",
          sources: ["Uçak", "Otobüs", "Tren", "Araç"],
          fields: [
            { name: "from", label: "Nereden", type: "text" },
            { name: "to", label: "Nereye", type: "text" },
            { name: "distance", label: "Mesafe (km)", type: "number" },
            { name: "passengers", label: "Yolcu Sayısı", type: "number" },
            { name: "roundTrip", label: "Gidiş-Dönüş", type: "select", options: ["Evet", "Hayır"] }
          ]
        },
        employeeCommuting: {
          title: "Çalışanların İşe Gidiş-Gelişleri",
          sources: ["Servis", "Toplu Taşıma", "Özel Araç"],
          fields: [
            { name: "employeeCount", label: "Çalışan Sayısı", type: "number" },
            { name: "distance", label: "Ortalama Mesafe (km/gün)", type: "number" },
            { name: "workingDays", label: "Aylık Çalışma Günü", type: "number" }
          ]
        },
        wasteDisposal: {
          title: "Atık Bertarafı",
          sources: ["Geri Dönüşüm", "Düzenli Depolama", "Yakma"],
          fields: [
            { name: "wasteType", label: "Atık Türü", type: "text" },
            { name: "amount", label: "Miktar", type: "number" },
            { name: "unit", label: "Birim", type: "select", options: ["kg", "ton"] }
          ]
        }
      }
    }
  };

  const renderFields = (fields, scopeKey, subKey) => {
    return (
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.name} className="mb-4">
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                className="w-full p-2 border rounded mt-1"
                value={formData[scopeKey]?.[subKey]?.[field.name] || ''}
                onChange={(e) => handleInputChange(scopeKey, subKey, field.name, e.target.value)}
              >
                <option value="">Seçiniz</option>
                {field.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                className="mt-1"
                value={formData[scopeKey]?.[subKey]?.[field.name] || ''}
                onChange={(e) => handleInputChange(scopeKey, subKey, field.name, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="flex gap-2">
          {editingEntry ? (
            <>
              <Button 
                className="flex-1"
                onClick={handleUpdateEntry}
              >
                <Check className="mr-2 h-4 w-4" />
                Güncelle
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditingEntry(null);
                  resetForm(scopeKey, subKey);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                İptal
              </Button>
            </>
          ) : (
            <Button 
              className="w-full"
              onClick={() => handleAddEntry(scopeKey, subKey)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ekle
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderEntries = (scopeKey, subKey) => {
    const relevantEntries = entries.filter(
      entry => entry.scopeKey === scopeKey && entry.subKey === subKey
    );

    if (relevantEntries.length === 0) return null;

    return (
      <div className="mt-6 border-t pt-4">
        <h4 className="font-medium mb-3">Eklenen Kayıtlar</h4>
        <div className="space-y-3">
          {relevantEntries.map(entry => (
            <div key={entry.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{entry.source}</p>
                {Object.entries(entry).map(([key, value]) => {
                  if (['id', 'scopeKey', 'subKey', 'source'].includes(key)) return null;
                  return (
                    <p key={key} className="text-sm text-gray-600">
                      {key}: {value}
                    </p>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(entry)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteClick(entry)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sera Gazı Emisyon Kategorileri</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setBulkImportDialog(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            İçe Aktar
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>
      
      {showSuccess && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {Object.entries(categories).map(([scopeKey, scope]) => (
        <Card key={scopeKey}>
          <button
            className="w-full p-4 text-left hover:bg-gray-50 rounded-t-lg font-medium"
            onClick={() => setActiveCategory(activeCategory === scopeKey ? null : scopeKey)}
          >
            {scope.title}
          </button>
          
          {activeCategory === scopeKey && (
            <CardContent className="pt-4">
              {Object.entries(scope.subcategories).map(([subKey, subcat]) => (
                <div key={subKey} className="mb-6 border-b pb-6 last:border-b-0">
                  <h3 className="font-medium mb-4">{subcat.title}</h3>
                  <div className="space-y-4">
                    <select
                      className="w-full p-2 border rounded"
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                    >
                      <option value="">Kaynak seçiniz</option>
                      {subcat.sources.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                    
                    {subcat.fuelTypes && (
                      <select 
                        className="w-full p-2 border rounded"
                        value={formData[scopeKey]?.[subKey]?.fuelType || ''}
                        onChange={(e) => handleInputChange(scopeKey, subKey, 'fuelType', e.target.value)}
                      >
                        <option value="">Yakıt türü seçiniz</option>
                        {subcat.fuelTypes.map((fuel) => (
                          <option key={fuel} value={fuel}>{fuel}</option>
                        ))}
                      </select>
                    )}

                    {selectedSource && subcat.fields && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        {renderFields(subcat.fields, scopeKey, subKey)}
                      </div>
                    )}

                    {renderEntries(scopeKey, subKey)}
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
          </DialogHeader>
          <p>Bu kaydı silmek istediğinizden emin misiniz?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              İptal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkImportDialog} onOpenChange={setBulkImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toplu Veri İçe Aktarma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              JSON formatında verileri yapıştırın
            </p>
            <textarea
              className="w-full h-40 p-2 border rounded"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkImportDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleBulkImport}>
              İçe Aktar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmissionCategories;