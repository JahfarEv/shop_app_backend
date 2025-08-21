// services/subscriptionService.js
const moment = require("moment-timezone");
const Subscription = require("../models/subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");

async function activateOrExtendSubscription(userId, shopId, subscriptionPlanId) {
  const plan = await SubscriptionPlan.findById(subscriptionPlanId);
  if (!plan) throw new Error("Subscription plan not found");

  const amount = plan.amount;
  const now = moment().tz("Asia/Kolkata");

  let existingSubscription = await Subscription.findOne({ userId, shopId, status: "active" });
  let subscription;

  if (existingSubscription) {
    // Extend subscription
    let newEndDate = moment(existingSubscription.endDate);
    if (plan.durationType === "monthly") newEndDate = newEndDate.add(1, "month");
    if (plan.durationType === "yearly") newEndDate = newEndDate.add(1, "year");

    existingSubscription.endDate = newEndDate.toDate();
    existingSubscription.amount += amount;
    await existingSubscription.save();
    subscription = existingSubscription;
  } else {
    // Create new
    let endDate = now.clone();
    if (plan.durationType === "monthly") endDate = now.clone().add(1, "month");
    if (plan.durationType === "yearly") endDate = now.clone().add(1, "year");

    const previousSubscription = await Subscription.findOne({ userId, shopId });
    if (!previousSubscription) endDate = endDate.clone().add(2, "months");

    subscription = await Subscription.create({
      userId,
      shopId,
      subscriptionPlanId,
      amount,
      startDate: now.toDate(),
      endDate: endDate.toDate(),
      status: "active",
      paymentStatus: "paid",
    });
  }

  return subscription;
}

module.exports = { activateOrExtendSubscription };
