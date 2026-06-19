export const EMPTY_PRODUCT_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  brand: '',
  image: '',
  countInStock: '',
};

const ProductForm = ({ form, categories, saving, editing, onChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
      <input
        type="text"
        required
        value={form.name}
        onChange={(e) => onChange('name', e.target.value)}
        className="input-field"
        placeholder="Product name"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
      <input
        type="text"
        required
        list="category-options"
        value={form.category}
        onChange={(e) => onChange('category', e.target.value)}
        className="input-field"
        placeholder="e.g. Electronics"
      />
      <datalist id="category-options">
        {categories.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
      <input
        type="text"
        value={form.brand}
        onChange={(e) => onChange('brand', e.target.value)}
        className="input-field"
        placeholder="Brand name"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Price ($) *</label>
      <input
        type="number"
        required
        min="0"
        step="0.01"
        value={form.price}
        onChange={(e) => onChange('price', e.target.value)}
        className="input-field"
        placeholder="0.00"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Stock *</label>
      <input
        type="number"
        required
        min="0"
        value={form.countInStock}
        onChange={(e) => onChange('countInStock', e.target.value)}
        className="input-field"
        placeholder="0"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Image URL</label>
      <input
        type="text"
        value={form.image}
        onChange={(e) => onChange('image', e.target.value)}
        className="input-field"
        placeholder="https://..."
      />
    </div>

    <div className="sm:col-span-2">
      <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
      <textarea
        required
        rows={4}
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        className="input-field"
        placeholder="Product description"
      />
    </div>

    {form.image && (
      <div className="sm:col-span-2">
        <p className="mb-2 text-sm font-medium text-slate-700">Image Preview</p>
        <img
          src={form.image}
          alt="Preview"
          className="h-32 w-32 rounded-lg border object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/128x128/e2e8f0/64748b?text=Preview';
          }}
        />
      </div>
    )}

    <div className="flex gap-2 sm:col-span-2">
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
      </button>
      <button type="button" onClick={onCancel} className="btn-secondary">
        Cancel
      </button>
    </div>
  </form>
);

export default ProductForm;
