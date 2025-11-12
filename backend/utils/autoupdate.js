// utils/orderLifecycle.js
import Order from "../models/Order.js";

export const autoUpdateOrderStatuses = async (io) => {
  const orders = await Order.find({ 
    status: { $nin: ["delivered", "cancelled"] } 
  });

  const now = Date.now();

  for (const order of orders) {
    const created = new Date(order.createdAt).getTime();
    const diff = now - created;

    let newStatus = order.status;

    if (diff < 20 * 1000) newStatus = "pending";
    else if (diff < 60 * 1000) newStatus = "confirmed";
    else if (diff < 4 * 60 * 1000) newStatus = "cooking";
    else if (diff < 5 * 60 * 1000) newStatus = "out for delivery";
    else newStatus = "delivered";

    if (newStatus !== order.status) {
      order.status = newStatus;
      await order.save();

      if (io) {
        io.emit("orderUpdated", order);
        io.to(`user_${order.user}`).emit("orderUpdated", order);
      }
    }
  }
};
