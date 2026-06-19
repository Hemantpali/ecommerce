import { useState } from 'react';
import { productApi } from '../../api/productApi';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/formatPrice';
import ProductForm, { EMPTY_PRODUCT_FORM } from '../../components/products/ProductForm';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';

const AdminProducts = () => {
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { categories } = useCategories();
  const { products, loading, refetch } = useProducts({ limit: 100 });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const openCreate = () => {
    clearMessages();
    setForm(EMPTY_PRODUCT_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    clearMessages();
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      image: product.image || '',
      countInStock: product.countInStock,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    clearMessages();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      brand: form.brand.trim() || undefined,
      image: form.image.trim() || undefined,
      price: Number(form.price),
      countInStock: Number(form.countInStock),
    };

    try {
      if (editingId) {
        await productApi.updateProduct(editingId, payload);
        setSuccess('Product updated successfully');
      } else {
        await productApi.createProduct(payload);
        setSuccess('Product added successfully');
      }
      closeForm();
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    clearMessages();
    setDeletingId(id);
    try {
      await productApi.deleteProduct(id);
      setSuccess('Product deleted successfully');
      if (editingId === id) closeForm();
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage Products</h2>
          <p className="mt-1 text-sm text-slate-500">{products.length} products in catalog</p>
        </div>
        {!showForm && (
          <button onClick={openCreate} className="btn-primary">
            + Add Product
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>
          <ProductForm
            form={form}
            categories={categories}
            saving={saving}
            editing={!!editingId}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start selling."
          action={
            <button onClick={openCreate} className="btn-primary">
              Add Product
            </button>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/40x40/e2e8f0/64748b?text=P';
                        }}
                      />
                      <span className="font-medium text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.countInStock > 0 ? 'text-green-600' : 'text-red-500'
                      }
                    >
                      {product.countInStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(product)}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        disabled={deletingId === product._id}
                        className="font-medium text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deletingId === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
