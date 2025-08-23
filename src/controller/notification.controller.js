const Notification = require("../models/notificationModel");

// ✅ Get all unread notifications and all recipient name for a specific user
// sends only read = false notification , read = true notifications will not be sent
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      recipients: {
        $elemMatch: {
          userId,
          isRead: false,
        },
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Unread notifications fetched",
      notifications,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// in this instead of sending all the recipient data we will send only that specific userid recipient of params 
// so by this the response will become less heavy and easy to transfer and read
// we will use this one instead of using the previous one which is sending the whole recipient name with the all notificaiotion
// in this it will send all notifications but in the response recipient we will only have that specific user_id from params
// sends only read = false notification , read = true notifications will not be sent 
// const getSpecificRecipientandallNotifications = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const notifications = await Notification.find({
//       recipients: { $elemMatch: { userId, isRead: false } }
//     }).lean(); // lean = plain JS object

//     const userNotifications = notifications.map((notif) => {
//       const recipientData = notif.recipients.find(r => r.userId.toString() === userId);

//       return {
//         _id: notif._id,
//         title: notif.title,
//         body: notif.body,
//         type: notif.type,
//         data: notif.data,
//         createdAt: notif.createdAt,
//         recipient: {
//           userId: recipientData?.userId,
//           isRead: recipientData?.isRead || false
//         }
//       };
//     });

//     res.status(200).json(userNotifications);
//   } catch (err) {
//     res.status(500).json({
//       message: "Failed to fetch notifications",
//       error: err.message
//     });
//   }
// };


//test
const getSpecificRecipientandallNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      recipients: { $elemMatch: { userId, isRead: false } }
    }).lean();

    if (!notifications.length) {
      return res.status(200).json({ message: "No unread notifications", notifications: [] });
    }

    // 🔹 Final response array
    const formattedNotifications = [];

    for (const notif of notifications) {
      const recipientData = notif.recipients.find(r => r.userId.toString() === userId);

      const { shop, user, selectedAddress, items } = notif.data || {};

      // 🔹 GROUP ITEMS SHOP-WISE
      const shopWiseMap = new Map();
      (items || []).forEach((item) => {
        const shopId = item.shop._id.toString();
        if (!shopWiseMap.has(shopId)) {
          shopWiseMap.set(shopId, {
            shop: item.shop,
            items: [],
          });
        }
        shopWiseMap.get(shopId).items.push(item);
      });

      // 🔹 Build shop-wise formatted data
      const shopsFormatted = [];
      for (let [shopId, data] of shopWiseMap.entries()) {
        const html = `
          <h2>🛒 ${notif.title}</h2>
          <h3>👤 Customer Details</h3>
          <p><strong>Name:</strong> ${user?.name || "N/A"}</p>
          <p><strong>Email:</strong> ${user?.email || "N/A"}</p>
          <p><strong>Mobile:</strong> ${selectedAddress?.phoneNumber || "N/A"}</p>

          <h3>📦 Delivery Address</h3>
          <p>
            Country: ${selectedAddress?.countryName || "N/A"}<br>
            State: ${selectedAddress?.state || "N/A"}<br>
            Town/City: ${selectedAddress?.town || "N/A"}<br>
            Area: ${selectedAddress?.area || "N/A"}<br>
            Landmark: ${selectedAddress?.landmark || "N/A"}<br>
            Pincode: ${selectedAddress?.pincode || "N/A"}<br>
            House No: ${selectedAddress?.houseNo || "N/A"}
          </p>

          <h3>🧾 Ordered Products</h3>
          ${data.items.map(i => `
            <p>
              <strong>Product Name:</strong> ${i.name}<br>
              <strong>Product Price (per unit):</strong> ₹${i.price}<br>
              <strong>Quantity:</strong> ${i.quantity}<br>
              ${i.weightInGrams ? `<strong>Weight:</strong> ${i.weightInGrams} grams<br>` : ""}
              <strong>Total for this product:</strong> ₹${i.priceWithQuantity}
            </p><hr>
          `).join("")}

          <h3>💰 Total Order Amount: ₹${data.items.reduce((sum, i) => sum + i.priceWithQuantity, 0)}</h3>
        `;

        shopsFormatted.push({
          shop: data.shop,
          items: data.items,
          html,
        });
      }

      formattedNotifications.push({
        _id: notif._id,
        type: notif.type,
        createdAt: notif.createdAt,
        recipient: {
          userId: recipientData?.userId,
          isRead: recipientData?.isRead || false
        },
        shops: shopsFormatted, // ✅ shop-wise grouping here
      });
    }

    res.status(200).json({
      message: "Unread notifications fetched",
      notifications: formattedNotifications,
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: err.message
    });
  }
};



// ✅ put request - Mark notification as read or unread for a specific user
const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, isRead } = req.body;

    const updated = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        "recipients.userId": userId,
      },
      {
        $set: {
          "recipients.$.isRead": isRead,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification or recipient not found" });
    }

    res.status(200).json({
      message: `Notification marked as ${isRead ? "read" : "unread"}`,
    });
  } catch (err) {
    console.error("Error marking notification:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// delete request - Delete a notification only for a specific user
//The deleteNotificationForUser controller removes a specific user 
// from the recipients array of a specific notification document.
const deleteNotificationForUser = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    const updated = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        "recipients.userId": userId,
      },
      {
        $pull: {
          recipients: { userId },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification or recipient not found" });
    }

    res.status(200).json({ message: "Notification deleted for user" });
  } catch (err) {
    console.error("Error deleting notification:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const deleted = await Notification.findByIdAndDelete(notificationId);

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: err.message,
    });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  deleteNotificationForUser,
  getSpecificRecipientandallNotifications,
  deleteNotification
};