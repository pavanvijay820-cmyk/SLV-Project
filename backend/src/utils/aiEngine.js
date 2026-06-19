/**
 * AI Rule Engine for SLV Events
 */

function calculatePriorityAndRecommendation(rentalDetails) {
  const { rental_type, pickup_date, estimated_cost, rental_days } = rentalDetails;
  
  const costNum = Number(estimated_cost) || 0;
  const daysNum = Number(rental_days) || 0;
  
  // Calculate days difference
  let daysDiff = 999;
  if (pickup_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickupDay = new Date(pickup_date);
    pickupDay.setHours(0, 0, 0, 0);
    const timeDiff = pickupDay.getTime() - today.getTime();
    daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Determine Priority
  let priority = 'Normal';
  if (daysDiff >= 0 && daysDiff <= 3) {
    priority = 'Urgent';
  } else if (costNum > 15000 || daysNum > 7) {
    priority = 'High';
  }

  // Generate Recommendation
  let recommendation = '';
  if (rental_type === 'Self-Drive') {
    recommendation = "Verify client's driving license validity, national identity card (Aadhar), and credit security authorization.";
  } else if (rental_type === 'Chauffeur Drive') {
    recommendation = "Assign professional driver, double-check route timeline details, and verify clean vehicle check.";
  } else if (rental_type === 'Outstation Tour') {
    recommendation = "Verify inter-state vehicle permits, driver tax clearances, and execute safety check.";
  } else if (daysDiff >= 0 && daysDiff <= 3) {
    recommendation = "Short notice pick-up request. Check vehicle fleet availability and lock booking immediately.";
  } else {
    recommendation = `Standard ${rental_type || 'rental'} inquiry. Send catalogue of available fleet models and tariff options.`;
  }

  return { priority, recommendation };
}

module.exports = { calculatePriorityAndRecommendation };
