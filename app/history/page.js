"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: orderData } = await supabase
        .from('draw_orders')
        .select('*')
        .order('drawn_at', { ascending: false });

      setOrders(orderData || []);

      const { data: itemData } = await supabase
        .from('draw_order_items')
        .select('*');

      const grouped = {};
      (itemData || []).forEach(item => {
        if (!grouped[item.order_id]) grouped[item.order_id] = [];
        grouped[item.order_id].push(item);
      });
      setItemsByOrder(grouped);
      setLoading(false);
    }
    load();
  }, []);

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div>
      <h1>ประวัติการสุ่ม</h1>
      <h2>ยอดขายรวม: {totalRevenue.toLocaleString()} บาท</h2>

      {orders.map(order => (
        <div key={order.id} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '8px' }}>
          <div onClick={() => toggleExpand(order.id)} style={{ cursor: 'pointer' }}>
            <strong>{new Date(order.drawn_at).toLocaleString('th-TH')}</strong> —
            {' '}{order.customer_name} —
            {' '}กล่อง {order.box_size} —
            {' '}หมวด: {order.categories_selected} —
            {' '}{order.total_price} บาท
            {' '}({expanded[order.id] ? 'ซ่อน' : 'ดูรายการ'})
          </div>
          {expanded[order.id] && (
            <ul>
              {(itemsByOrder[order.id] || []).map(item => (
                <li key={item.id}>{item.product_name} ({item.category})</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
