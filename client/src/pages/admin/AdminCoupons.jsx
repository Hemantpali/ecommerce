import { useState, useEffect } from 'react';
import { couponApi } from '../../api/couponApi';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';

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
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
        setSuccess('Coupon updated successfully');
      } else {
        await couponApi.createCoupon(payload);
        setSuccess('Coupon created successfully');
      }
      closeForm();
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await couponApi.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;

    clearMessages();
    try {
      await couponApi.deleteCoupon(id);
      setSuccess('Coupon deleted successfully');
      if (editingId === id) closeForm();
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete coupon');
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
          <h2 className="text-xl font-semibold text-slate-900">Manage Coupons</h2>
          <p className="mt-1 text-sm text-slate-500">{coupons.length} coupons</p>
        </div>
        {!showForm && (
          <button onClick={openCreate} className="btn-primary">
            + Add Coupon
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
            {editingId ? 'Edit Coupon' : 'Add New Coupon'}
          </h3>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                className="input-field"
                placeholder="SUMMER20"
                maxLength={20}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {form.type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}
              </label>
              <input
                required
                type="number"
                min="0.01"
                step="any"
                value={form.value}
                onChange={(e) => handleChange('value', e.target.value)}
                className="input-field"
              />
            </div>

            {form.type === 'percentage' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Max Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.maxDiscount}
                  onChange={(e) => handleChange('maxDiscount', e.target.value)}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Min Order Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Usage Limit</label>
              <input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => handleChange('usageLimit', e.target.value)}
                className="input-field"
                placeholder="Unlimited"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiry Date</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex items-end gap-3 sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button type="button" onClick={closeForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {coupons.length === 0 ? (
        <EmptyState
          title="No coupons yet"
          description="Create discount coupons to boost sales."
          action={
            <button onClick={openCreate} className="btn-primary">
              Add Coupon
            </button>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min Order</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{coupon.code}</td>
                  <td className="px-4 py-3">
                    {coupon.type === 'percentage'
                      ? `${coupon.value}%${coupon.maxDiscount ? ` (max ${formatPrice(coupon.maxDiscount)})` : ''}`
                      : formatPrice(coupon.value)}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit}` : coupon.usedCount}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.expiresAt ? (
                      <span className={isExpired(coupon.expiresAt) ? 'text-red-500' : ''}>
                        {formatDate(coupon.expiresAt)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
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

export default AdminCoupons;
