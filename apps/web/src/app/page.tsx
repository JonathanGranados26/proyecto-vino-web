import { ProductGrid } from '@/components/ProductGrid';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-wine-800 to-wine-950 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            GWS Wine Platform
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-wine-100 max-w-2xl mx-auto">
            Descubra nuestra selección premium de vinos y licores de todo el mundo.
          </p>
          <button className="bg-white text-wine-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg">
            Explorar Catálogo
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
          Catálogo Completo
        </h2>
        <ProductGrid />
      </div>
    </main>
  );
}