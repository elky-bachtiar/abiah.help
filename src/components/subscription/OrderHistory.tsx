import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Download, AlertCircle } from 'lucide-react';
import { useStripe } from '../../context/StripeContext';
import { Button } from '../ui/Button-bkp';
import { Card, CardContent } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function OrderHistory() {
  const { orders, isLoading, error, refreshOrders } = useStripe();

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-text-secondary">Loading order history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-error mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshOrders}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <ShoppingBag className="w-12 h-12 text-text-secondary mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-primary mb-2">No Orders Yet</h3>
            <p className="text-text-secondary mb-4">
              You haven't made any purchases yet. Check out our pricing plans to get started.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/pricing'}>
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Order History</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Order ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-background-secondary transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {order.order_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {formatCurrency(order.amount_total, order.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.order_status === 'completed' ? 'bg-success/10 text-success' :
                        order.order_status === 'pending' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}