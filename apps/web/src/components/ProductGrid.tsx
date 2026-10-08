'use client';

import { useQuery, gql } from '@apollo/client';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      slug
      brand
      category
      price
      imageUrl
      stock
    }
  }
`;

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export function ProductGrid() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data?.products.map((product: Product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="h-64 overflow-hidden bg-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Sin imagen
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="text-sm text-wine-600 font-semibold mb-2 uppercase tracking-wide">
              {product.category}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {product.name}
            </h3>
            <p className="text-gray-600 mb-4">{product.brand}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-wine-700">
                ${product.price.toLocaleString()} MXN
              </span>
              <button className="bg-wine-700 text-white px-4 py-2 rounded hover:bg-wine-800 transition font-medium">
                Agregar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}