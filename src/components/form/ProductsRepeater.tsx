import { useState, useEffect } from 'react';

interface OptionalProduct {
  id: string;
  title: string;
  description: string;
  price_adults?: number;
  price_children?: number;
  price_couples?: number;
  price_newborns?: number;
  refundable: boolean;
  optional: boolean;
}

interface Props {
  initialProducts?: OptionalProduct[];
  travelersConfig: {
    adults: boolean;
    children: boolean;
    couples: boolean;
    newborns: boolean;
  };
}

const productTypes = [
  { value: 'volo', label: 'Volo' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'vitto', label: 'Vitto' },
  { value: 'biglietti', label: 'Biglietti' },
  { value: 'assicurazione', label: 'Assicurazione' },
  { value: 'altro', label: 'Altro' },
];

export function ProductsRepeater({ initialProducts = [], travelersConfig }: Props) {
  const [products, setProducts] = useState<OptionalProduct[]>(
    initialProducts.length > 0 ? initialProducts : []
  );

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: 'volo',
        title: '',
        description: '',
        refundable: false,
        optional: true,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof OptionalProduct, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">Prodotti Opzionali</h3>
        <button
          type="button"
          onClick={addProduct}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          + Aggiungi Prodotto
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Prodotto {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="text-red-500 hover:text-red-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tipo Prodotto</label>
                  <select
                    name={`optional_products[${index}][id]`}
                    value={product.id}
                    onChange={(e) => updateProduct(index, 'id', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    {productTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Titolo</label>
                  <input
                    type="text"
                    name={`optional_products[${index}][title]`}
                    value={product.title}
                    onChange={(e) => updateProduct(index, 'title', e.target.value)}
                    placeholder="Nome del prodotto"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Descrizione</label>
                <input
                  type="text"
                  name={`optional_products[${index}][description]`}
                  value={product.description}
                  onChange={(e) => updateProduct(index, 'description', e.target.value)}
                  placeholder="Descrizione del prodotto"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>

              {/* Prezzi condizionali */}
              <div className="grid grid-cols-2 gap-3">
                {travelersConfig.adults && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Prezzo Adulti €</label>
                    <input
                      type="number"
                      name={`optional_products[${index}][price_adults]`}
                      value={product.price_adults || ''}
                      onChange={(e) =>
                        updateProduct(index, 'price_adults', parseFloat(e.target.value))
                      }
                      step="0.01"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                )}

                {travelersConfig.children && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Prezzo Bambini €</label>
                    <input
                      type="number"
                      name={`optional_products[${index}][price_children]`}
                      value={product.price_children || ''}
                      onChange={(e) =>
                        updateProduct(index, 'price_children', parseFloat(e.target.value))
                      }
                      step="0.01"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                )}

                {travelersConfig.couples && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Prezzo Coppie €</label>
                    <input
                      type="number"
                      name={`optional_products[${index}][price_couples]`}
                      value={product.price_couples || ''}
                      onChange={(e) =>
                        updateProduct(index, 'price_couples', parseFloat(e.target.value))
                      }
                      step="0.01"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                )}

                {travelersConfig.newborns && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Prezzo Neonati €</label>
                    <input
                      type="number"
                      name={`optional_products[${index}][price_newborns]`}
                      value={product.price_newborns || ''}
                      onChange={(e) =>
                        updateProduct(index, 'price_newborns', parseFloat(e.target.value))
                      }
                      step="0.01"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={`optional_products[${index}][refundable]`}
                    checked={product.refundable}
                    onChange={(e) => updateProduct(index, 'refundable', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Rimborsabile</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={`optional_products[${index}][optional]`}
                    checked={product.optional}
                    onChange={(e) => updateProduct(index, 'optional', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Opzionale</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden input for product count */}
      <input type="hidden" name="products_count" value={products.length} />
    </div>
  );
}
