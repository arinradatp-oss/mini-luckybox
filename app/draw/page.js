"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const BOX_SIZES = {
  S: { price: 250, count: 4 },
  M: { price: 390, count: 7 },
  L: { price: 550, count: 10 },
};
const CATEGORIES = ['rope', 'bead', 'silver', 'gold'];

// สุ่มแบบถ่วงน้ำหนัก ไม่คืนที่ (ไม่ซ้ำชิ้น)
function weightedSampleWithoutReplacement(items, count) {
  const pool = [...items];
  const result = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const totalWeight = pool.reduce((sum, item) => sum + item.draw_weight, 0);
    let rand = Math.random() * totalWeight;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      rand -= pool[idx].draw_weight;
      if (rand <= 0) break;
    }
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

export default function DrawPage() {
  const [boxSize, setBoxSize] = useState('S');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  async function getPriceEstimate() {
    if (selectedCategories.length === 0) return 0;
    const { data } = await supabase
      .from('products')
      .select('category, price_multiplier')
      .in('category', selectedCategories);
    if (!data || data.length === 0) return BOX_SIZES[boxSize].price;
    const multipliers = {};
    data.forEach(p => { multipliers[p.category] = p.price_multiplier; });
    const avg = selectedCategories.reduce((sum, c) => sum + (multipliers[c] || 1), 0) / selectedCategories.length;
    return Math.round(BOX_SIZES[boxSize].price * avg * 100) / 100;
  }

  const [estimatedPrice, setEstimatedPrice] = useState(0);

  async function updatePrice(newBoxSize, newCategories) {
    if (newCategories.length === 0) { setEstimatedPrice(0); return; }
    const { data } = await supabase
      .from('products')
      .select('category, price_multiplier')
      .in('category', newCategories);
    const multipliers = {};
    (data || []).forEach(p => { multipliers[p.category] = p.price_multiplier; });
    const avg = newCategories.reduce((sum, c) => sum + (multipliers[c] || 1), 0) / newCategories.length;
    setEstimatedPrice(Math.round(BOX_SIZES[newBoxSize].price * avg * 100) / 100);
  }

  function handleBoxSizeChange(size) {
    setBoxSize(size);
    updatePrice(size, selectedCategories);
  }

  function handleCategoryToggle(cat) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    updatePrice(boxSize, next);
  }

  async function handleDraw(e) {
    e.preventDefault();
    setMessage('');
    setResult(null);

    if (selectedCategories.length === 0) {
      setMessage('กรุณาเลือกอย่างน้อย 1 หมวด');
      return;
    }

    setLoading(true);
    const neededCount = BOX_SIZES[boxSize].count;

    // ดึงสินค้าที่มีสต๊อกในหมวดที่เลือก
    const { data: candidates, error } = await supabase
      .from('products')
      .select('*')
      .in('category', selectedCategories)
      .gt('stock', 0);

    if (error || !candidates || candidates.length < neededCount) {
      setMessage(`สินค้าในหมวดที่เลือกไม่พอสำหรับสุ่มครบ ${neededCount} ชิ้น (มีของอยู่ ${candidates ? candidates.length : 0} ชิ้น)`);
      setLoading(false);
      return;
    }

    // สุ่มแบบถ่วงน้ำหนัก ไม่ซ้ำ
    const drawn = weightedSampleWithoutReplacement(candidates, neededCount);

    // บันทึกออเดอร์
    const { data: order, error: orderError } = await supabase
      .from('draw_orders')
      .insert({
        customer_name: customerName,
        contact,
        box_size: boxSize,
        categories_selected: selectedCategories.join(','),
        total_price: estimatedPrice,
        note,
      })
      .select()
      .single();

    if (orderError) {
      setMessage('เกิดข้อผิดพลาดในการบันทึกออเดอร์');
      setLoading(false);
      return;
    }

    // บันทึกไอเทมที่สุ่มได้
    const itemsToInsert = drawn.map(p => ({
      order_id: order.id,
      product_id: p.id,
      product_name: p.name,
      category: p.category,
    }));
    await supabase.from('draw_order_items').insert(itemsToInsert);

    // ตัดสต๊อกทีละชิ้น
    for (const p of drawn) {
      await supabase.from('products').update({ stock: p.stock - 1 }).eq('id', p.id);
    }

    setResult(drawn);
    setCustomerName('');
    setContact('');
    setNote('');
    setSelectedCategories([]);
    setEstimatedPrice(0);
    setLoading(false);
  }

  return (
    <div>
      <h1>สุ่มกล่อง</h1>

      <form onSubmit={handleDraw}>
        <div style={{ marginBottom: '16px' }}>
          <strong>เลือกไซส์กล่อง:</strong><br />
          {Object.keys(BOX_SIZES).map(size => (
            <label key={size} style={{ marginRight: '12px' }}>
              <input type="radio" name="boxSize" checked={boxSize === size}
                onChange={() => handleBoxSizeChange(size)} />
              {' '}{size} ({BOX_SIZES[size].price} บาท / {BOX_SIZES[size].count} ชิ้น)
            </label>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong>เลือกหมวด:</strong><br />
          {CATEGORIES.map(cat => (
            <label key={cat} style={{ marginRight: '12px' }}>
              <input type="checkbox" checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)} />
              {' '}{cat}
            </label>
          ))}
        </div>

        <p><strong>ราคารวม:</strong> {estimatedPrice} บาท</p>

        <div style={{ marginBottom: '8px' }}>
          <input placeholder="ชื่อลูกค้า" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <input placeholder="ช่องทางติดต่อ (เบอร์/LINE)" value={contact} onChange={e => setContact(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <input placeholder="หมายเหตุ (ถ้ามี)" value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}>{loading ? 'กำลังสุ่ม...' : 'สุ่มเลย'}</button>
      </form>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {result && (
        <div style={{ marginTop: '24px', padding: '16px', border: '2px solid #4caf50' }}>
          <h3>ลูกค้าได้รับ:</h3>
          <ul>
            {result.map((item, i) => (
              <li key={i}>{item.name} ({item.category})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
