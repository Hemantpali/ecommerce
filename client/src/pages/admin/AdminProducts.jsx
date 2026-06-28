import { useState } from 'react';
import { productApi } from '../../api/productApi';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useToast } from '../../components/ui/toast';
import { formatPrice } from '../../utils/formatPrice';
import ProductForm, { EMPTY_PRODUCT_FORM } from '../../components/products/ProductForm';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ShoppingBag, Edit, Trash2 } from 'lucide-react';

const AdminProducts = () => {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
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
    setImageFile(null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    clearMessages();
    setImageFile(null);
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
    setImageFile(null);
    setForm(EMPTY_PRODUCT_FORM);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = (file) => {
    setImageFile(file);
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
      if (imageFile) {
        const imagePayload = new FormData();
        imagePayload.append('image', imageFile);
        const { data } = await productApi.uploadProductImage(imagePayload);
        payload.image = data.data.url;
      }

      if (editingId) {
        await productApi.updateProduct(editingId, payload);
        const successMsg = `Product "${payload.name}" updated successfully`;
        setSuccess(successMsg);
        toast({
          title: 'Product updated',
          description: successMsg,
          variant: 'success',
        });
      } else {
        await productApi.createProduct(payload);
        const successMsg = `Product "${payload.name}" added successfully`;
        setSuccess(successMsg);
        toast({
          title: 'Product added',
          description: successMsg,
          variant: 'success',
        });
      }
      closeForm();
      refetch();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save product';
      setError(errMsg);
      toast({
        title: 'Save failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    clearMessages();
    setDeletingId(id);
    try {
      await productApi.deleteProduct(id);
      const successMsg = `Product "${name}" deleted successfully`;
      setSuccess(successMsg);
      toast({
        title: 'Product deleted',
        description: successMsg,
        variant: 'default',
      });
      if (editingId === id) closeForm();
      refetch();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete product';
      setError(errMsg);
      toast({
        title: 'Delete failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manage Products</h2>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{products.length} products in catalog</p>
        </div>
        {!showForm && (
          <Button onClick={openCreate} size="sm">
            + Add Product
          </Button>
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
        <Card className="mb-6 border border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-5 text-base font-bold text-foreground">
              {editingId ? 'Edit Product Catalog Details' : 'Add New Catalog Product'}
            </h3>
            <ProductForm
              form={form}
              categories={categories}
              saving={saving}
              editing={!!editingId}
              onChange={handleChange}
              onImageFileChange={handleImageFileChange}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No products yet"
          description="Add your first catalog product to start selling."
          action={
            <Button onClick={openCreate}>
              Add Product
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden border border-border bg-card shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs font-semibold">
              <thead className="border-b border-border bg-secondary/35 text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 font-bold">Product</th>
                  <th className="px-4 py-3.5 font-bold">Category</th>
                  <th className="px-4 py-3.5 font-bold">Price</th>
                  <th className="px-4 py-3.5 font-bold">Stock</th>
                  <th className="px-4 py-3.5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-secondary/15 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover bg-secondary border border-border/20"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/40x40/e2e8f0/64748b?text=P';
                          }}
                        />
                        <span className="font-bold text-foreground max-w-[240px] truncate block">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="px-2 py-0.5">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-foreground text-sm">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={
                          product.countInStock > 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'
                        }
                      >
                        {product.countInStock > 0 ? `${product.countInStock} units` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(product)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary"
                          aria-label="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDelete({ id: product._id, name: product.name })}
                          disabled={deletingId === product._id}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{confirmDelete?.name}&rdquo;? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deletingId === confirmDelete?.id}
            onClick={() => {
              handleDelete(confirmDelete.id, confirmDelete.name);
              setConfirmDelete(null);
            }}
          >
            {deletingId === confirmDelete?.id ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
