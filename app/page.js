"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const CATEGORIES = ['rope', 'bead', 'silver', 'gold'];

const inputStyle = {
  padding: '8px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '0.9375rem',
  outline: 'none',
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  marginBottom: '24px',
};

const secondaryButtonStyle = {
  background: '#f3f4f6',
  color: '#374151',
};

const dangerButtonStyle = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: '6px 12px',
  fontSize: '0.8125rem',
};

const editButtonStyle = {
  background: '#eff6ff',
  color: '#2563eb',
  padding: '6px 12px',
  fontSize: '0.8125rem',
  marginRight: '6px',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    sku: '', name: '', category: 'rope',
    price_multiplier: 1.0, draw_weight: 50, stock: 0, unit: 'ชิ้น'
  });

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error) setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function resetForm() {
    setForm({ sku: '', name: '', category: 'rope', price_multiplier: 1.0, draw_weight: 50, stock: 0, unit: 'ชิ้น' });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      sku: form.sku,
      name: form.name,
      category: form.category,
      price_multiplier: parseFloat(form.price_multiplier),
      draw_weight: parseInt(form.draw_weight),
      stock: parseInt(form.stock),
      unit: form.unit,
    };

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('products').insert(payload);
    }
    resetForm();
    fetchProducts();
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      sku: p.sku, name: p.name, category: p.category,
      price_multiplier: p.price_multiplier, draw_weight: p.draw_weight,
      stock: p.stock, unit: p.unit
    });
  }

  async function handleDelete(id) {
    if (!confirm('ลบสินค้านี้?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  return (
    <div>
      <h1>คลังสินค้า</h1>

      {/* ฟอร์มเพิ่ม/แก้ไขสินค้า */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '16px' }}>
          {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ ...inputStyle, width: '110px' }} placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
          <input style={{ ...inputStyle, width: '160px' }} placeholder="ชื่อสินค้า" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={{ ...inputStyle, width: '110px' }} type="number" step="0.1" placeholder="ตัวคูณราคา" value={form.price_multiplier} onChange={e => setForm({ ...form, price_multiplier: e.target.value })} />
          <input style={{ ...inputStyle, width: '110px' }} type="number" placeholder="น้ำหนักสุ่ม" value={form.draw_weight} onChange={e => setForm({ ...form, draw_weight: e.target.value })} />
          <input style={{ ...inputStyle, width: '90px' }} type="number" placeholder="คงเหลือ" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          <input style={{ ...inputStyle, width: '80px' }} placeholder="หน่วย" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          <button type="submit">{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>
          {editingId && <button type="button" style={secondaryButtonStyle} onClick={resetForm}>ยกเลิก</button>}
        </form>
      </div>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>ชื่อสินค้า</th><th>หมวด</th><th>ตัวคูณ</th>
              <th>น้ำหนักสุ่ม</th><th>คงเหลือ</th><th>หน่วย</th><th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price_multiplier}</td>
                <td>{p.draw_weight}</td>
                <td>{p.stock}</td>
                <td>{p.unit}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button style={editButtonStyle} onClick={() => startEdit(p)}>แก้ไข</button>
                  <button style={dangerButtonStyle} onClick={() => handleDelete(p.id)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
