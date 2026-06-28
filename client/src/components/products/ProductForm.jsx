import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const EMPTY_PRODUCT_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  brand: '',
  image: '',
  countInStock: '',
};

const ProductForm = ({
  form,
  categories,
  saving,
  editing,
  onChange,
  onImageFileChange,
  onSubmit,
  onCancel,
}) => (
  <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2 text-xs font-semibold select-none">
    <div className="space-y-1.5">
      <label className="text-foreground uppercase tracking-wider">Product Name *</label>
      <Input
        type="text"
        required
        value={form.name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder="e.g. Leather Jacket"
        className="h-10 text-sm font-medium"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-foreground uppercase tracking-wider">Category *</label>
      <Input
        type="text"
        required
        list="category-options"
        value={form.category}
        onChange={(e) => onChange('category', e.target.value)}
        placeholder="e.g. Electronics"
        className="h-10 text-sm font-medium"
      />
      <datalist id="category-options">
        {categories.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>
    </div>

    <div className="space-y-1.5">
      <label className="text-foreground uppercase tracking-wider">Brand Name</label>
      <Input
        type="text"
        value={form.brand}
        onChange={(e) => onChange('brand', e.target.value)}
        placeholder="e.g. Nike"
        className="h-10 text-sm font-medium"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-foreground uppercase tracking-wider">Price (₹) *</label>
      <Input
        type="number"
        required
        min="0"
        step="0.01"
        value={form.price}
        onChange={(e) => onChange('price', e.target.value)}
        placeholder="0.00"
        className="h-10 text-sm font-medium"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-foreground uppercase tracking-wider">Stock Inventory *</label>
      <Input
        type="number"
        required
        min="0"
        value={form.countInStock}
        onChange={(e) => onChange('countInStock', e.target.value)}
        placeholder="0"
        className="h-10 text-sm font-medium"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-foreground uppercase tracking-wider">Image URL Source</label>
      <Input
        type="text"
        value={form.image}
        onChange={(e) => onChange('image', e.target.value)}
        placeholder="https://images.unsplash.com/..."
        className="h-10 text-sm font-medium"
      />
      <div className="pt-1.5">
        <label className="text-foreground uppercase tracking-wider">Or upload local file</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
          className="mt-1.5 block w-full text-xs text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20 transition cursor-pointer"
        />
        <p className="mt-1 text-[10px] text-muted-foreground leading-normal font-medium">Uploaded images will be securely hosted on Cloudinary.</p>
      </div>
    </div>

    <div className="sm:col-span-2 space-y-1.5">
      <label className="text-foreground uppercase tracking-wider">Description Details *</label>
      <textarea
        required
        rows={4}
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary duration-150"
        placeholder="Provide detail description about product specs, sizing and material..."
      />
    </div>

    {form.image && (
      <div className="sm:col-span-2 space-y-1.5 pt-2">
        <p className="text-foreground uppercase tracking-wider">Image Preview</p>
        <img
          src={form.image}
          alt="Preview"
          className="h-28 w-28 rounded-lg border border-border object-cover bg-secondary"
          onError={(e) => {
            e.target.src = 'https://placehold.co/128x128/e2e8f0/64748b?text=Preview';
          }}
        />
      </div>
    )}

    <div className="flex gap-2 sm:col-span-2 pt-4">
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </form>
);

export default ProductForm;
