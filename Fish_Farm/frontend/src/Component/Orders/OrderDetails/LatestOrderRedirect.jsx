import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

const LatestOrderRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.get('/orderDetails');
        const orders = res.data?.orders || (Array.isArray(res.data) ? res.data : []);
        if (isMounted && orders.length > 0) {
          const targetId = orders[0]._id;
          try { localStorage.setItem('lastViewedOrderId', targetId); } catch (e) {}
          navigate(`/dashboard/admin/orders/${targetId}`, { replace: true });
        } else if (isMounted) {
          navigate('/dashboard/admin/orders', { replace: true });
        }
      } catch (err) {
        navigate('/dashboard/admin/orders', { replace: true });
      }
    })();

    return () => { isMounted = false; };
  }, [navigate]);

  return (
    <div className="r_a_o_loading" style={{ padding: 24 }}>
      <h3>Opening latest order…</h3>
    </div>
  );
};

export default LatestOrderRedirect;


