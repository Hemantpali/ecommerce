import { useState, useEffect } from 'react';
import { couponApi } from '../../api/couponApi';
import { useToast } from '../../components/ui/toast';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tag, Edit, Trash2 } from 'lucide-react';

const EMPTY_FORM = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
};

const AdminCoupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await couponApi.getCoupons();
      setCoupons(data.data);
    } catch {
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const openCreate = () => {
    clearMessages();
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (coupon) => {
    clearMessages();
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    clearMessages();

    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      isActive: true,
    };

    if (form.type === 'percentage' && form.maxDiscount) {
      payload.maxDiscount = Number(form.maxDiscount);
    }

    if (form.usageLimit) {
      payload.usageLimit = Number(form.usageLimit);
    }

    if (form.expiresAt) {
      payload.expiresAt = new Date(form.expiresAt).toISOString();
    }

    try {
      if (editingId) {
        await couponApi.updateCoupon(editingId, payload);
        const successMsg = `Coupon "${payload.code}" updated successfully`;
        setSuccess(successMsg);
        toast({
          title: 'Coupon updated',
          description: successMsg,
          variant: 'success',
        });
      } else {
        await couponApi.createCoupon(payload);
        const successMsg = `Coupon "${payload.code}" created successfully`;
        setSuccess(successMsg);
        toast({
          title: 'Coupon created',
          description: successMsg,
          variant: 'success',
        });
      }
      closeForm();
      fetchCoupons();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save coupon';
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

  const handleToggleActive = async (coupon) => {
    try {
      await couponApi.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      toast({
        title: coupon.isActive ? 'Coupon deactivated' : 'Coupon activated',
        description: `Status for "${coupon.code}" has been updated.`,
        variant: 'success',
      });
      fetchCoupons();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update coupon';
      setError(errMsg);
      toast({
        title: 'Status update failed',
        description: errMsg,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id, code) => {
    clearMessages();
    try {
      await couponApi.deleteCoupon(id);
      const successMsg = `Coupon "${code}" deleted successfully`;
      setSuccess(successMsg);
      toast({
        title: 'Coupon deleted',
        description: successMsg,
        variant: 'default',
      });
      if (editingId === id) closeForm();
      fetchCoupons();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete coupon';
      setError(errMsg);
      toast({
        title: 'Delete failed',
        description: errMsg,
        variant: 'destructive',
      });
    }
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manage Coupons</h2>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{coupons.length} discount coupons</p>
        </div>
        {!showForm && (
          <Button onClick={openCreate} size="sm">
            + Add Coupon
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
              {editingId ? 'Edit Coupon Settings' : 'Create New Discount Coupon'}
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-foreground uppercase tracking-wider">Coupon Code *</label>
                <Input
                  required
                  value={form.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE30"
                  maxLength={20}
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground uppercase tracking-wider">Discount Type *</label>
                <Select
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Price Reduction (₹)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground uppercase tracking-wider">
                  {form.type === 'percentage' ? 'Discount Percentage (%) *' : 'Fixed Discount (₹) *'}
                </label>
                <Input
                  required
                  type="number"
                  min="0.01"
                  step="any"
                  value={form.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder={form.type === 'percentage' ? '15' : '150.00'}
                  className="h-10 text-sm font-medium"
                />
              </div>

              {form.type === 'percentage' && (
                <div className="space-y-1.5">
                  <label className="text-foreground uppercase tracking-wider">Maximum Discount Limit (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={form.maxDiscount}
                    onChange={(e) => handleChange('maxDiscount', e.target.value)}
                    placeholder="Optional limit"
                    className="h-10 text-sm font-medium"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-foreground uppercase tracking-wider">Minimum Order Total (₹)</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={form.minOrderAmount}
                  onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                  placeholder="0.00"
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground uppercase tracking-wider">Usage Limit per Coupon</label>
                <Input
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={(e) => handleChange('usageLimit', e.target.value)}
                  placeholder="Unlimited usage"
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground uppercase tracking-wider">Expiry Date</label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => handleChange('expiresAt', e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="flex gap-2 sm:col-span-2 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {coupons.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No coupons created yet"
          description="Offer discount coupons to boost sales and conversions."
          action={
            <Button onClick={openCreate}>
              Add Coupon
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden border border-border bg-card shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs font-semibold">
              <thead className="border-b border-border bg-secondary/35 text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 font-bold">Code</th>
                  <th className="px-4 py-3.5 font-bold">Discount Value</th>
                  <th className="px-4 py-3.5 font-bold">Min Order</th>
                  <th className="px-4 py-3.5 font-bold">Usage Status</th>
                  <th className="px-4 py-3.5 font-bold">Expires</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);
                  return (
                    <tr key={coupon._id} className="hover:bg-secondary/15 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-extrabold text-foreground flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 opacity-60 text-primary" />
                          <span>{coupon.code}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}%${coupon.maxDiscount ? ` (Max ${formatPrice(coupon.maxDiscount)})` : ''}`
                          : formatPrice(coupon.value)}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {coupon.usageLimit ? `${coupon.usedCount} / ${coupon.usageLimit}` : `${coupon.usedCount} used`}
                      </td>
                      <td className="px-4 py-3.5">
                        {coupon.expiresAt ? (
                          <span className={expired ? 'text-red-500 font-bold' : 'text-foreground'}>
                            {formatDate(coupon.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No Expiry</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition tracking-wider ${
                            coupon.isActive && !expired
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(coupon)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary"
                            aria-label="Edit coupon"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDelete({ id: coupon._id, code: coupon.code })}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete coupon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogHeader>
          <DialogTitle>Delete Coupon</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete coupon &ldquo;{confirmDelete?.code}&rdquo;? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleDelete(confirmDelete.id, confirmDelete.code);
              setConfirmDelete(null);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
