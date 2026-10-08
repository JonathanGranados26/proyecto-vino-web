import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      name
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      brand
      category
      description
      presentation
      alcoholicDegree
      price
      currency
      stock
      country
      region
      imageUrl
      tastingNotes
    }
  }
`;

const CATEGORIES = ['WHISKY', 'RON', 'TEQUILA', 'VINO', 'VODKA', 'GIN', 'LICOR', 'CERVEZA'];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: 'WHISKY',
    description: '',
    presentation: '',
    alcoholicDegree: 0,
    price: 0,
    currency: 'MXN',
    stock: 0,
    country: '',
    region: '',
    imageUrl: '',
    tastingNotes: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { data } = useQuery(GET_PRODUCT, {
    variables: { id },
    skip: !isEdit,
    onCompleted: (data) => {
      const p = data.product;
      setForm({
        name: p.name || '',
        brand: p.brand || '',
        category: p.category || 'WHISKY',
        description: p.description || '',
        presentation: p.presentation || '',
        alcoholicDegree: p.alcoholicDegree || 0,
        price: p.price || 0,
        currency: p.currency || 'MXN',
        stock: p.stock || 0,
        country: p.country || '',
        region: p.region || '',
        imageUrl: p.imageUrl || '',
        tastingNotes: p.tastingNotes?.join(', ') || '',
      });
      if (p.imageUrl) setImagePreview(p.imageUrl);
    },
  });

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      alert('✅ Producto creado exitosamente');
      navigate('/products');
    },
    onError: (err) => alert('Error: ' + err.message),
  });

  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      alert('✅ Producto actualizado exitosamente');
      navigate('/products');
    },
    onError: (err) => alert('Error: ' + err.message),
  });

  // Manejar selección de archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.match(/image\/(jpg|jpeg|png|webp|gif)/)) {
      setUploadError('Solo se permiten imágenes (JPG, PNG, WEBP, GIF)');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB');
      return;
    }

    setUploadError('');
    setUploading(true);

    // Mostrar preview inmediato
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:4000/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir la imagen');

      const result = await response.json();
      setForm({ ...form, imageUrl: result.url });
      setUploading(false);
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir la imagen');
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      ...form,
      alcoholicDegree: Number(form.alcoholicDegree),
      price: Number(form.price),
      stock: Number(form.stock),
      tastingNotes: form.tastingNotes.split(',').map((n) => n.trim()).filter(Boolean),
    };

    if (isEdit) {
      updateProduct({ variables: { input: { id, ...input } } });
    } else {
      createProduct({ variables: { input } });
    }
  };

  const loading = creating || updating;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? `Editando: ${data?.product?.name}` : 'Agrega un nuevo producto al catálogo'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Sección de Imagen */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagen del Producto</h2>
          
          <div className="flex gap-6">
            {/* Preview */}
            <div className="w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400 p-4">
                  <div className="text-4xl mb-2"></div>
                  <div className="text-xs">Sin imagen</div>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-3 bg-wine-700 text-white rounded-lg hover:bg-wine-800 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="animate-spin"></span>
                    <span>Subiendo imagen...</span>
                  </>
                ) : (
                  <>
                    <span></span>
                    <span>Subir imagen desde computadora</span>
                  </>
                )}
              </button>

              <div className="text-center text-gray-500 text-sm">o</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O pega una URL de imagen
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm({ ...form, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
                />
              </div>

              {uploadError && (
                <div className="bg-red-50 text-red-700 p-2 rounded text-sm">
                  {uploadError}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Formatos: JPG, PNG, WEBP, GIF • Máximo: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Campos del producto */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <input
              required
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presentación *</label>
            <input
              required
              placeholder="750 ml"
              value={form.presentation}
              onChange={(e) => setForm({ ...form, presentation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (MXN) *</label>
            <input
              required
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input
              required
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado alcohólico (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.alcoholicDegree}
              onChange={(e) => setForm({ ...form, alcoholicDegree: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
            <input
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas de cata (separadas por coma)</label>
            <input
              placeholder="ahumado, vainilla, frutas secas"
              value={form.tastingNotes}
              onChange={(e) => setForm({ ...form, tastingNotes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-wine-700 text-white rounded-lg hover:bg-wine-800 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Producto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
}