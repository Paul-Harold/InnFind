export const formatPrice = (amount) => `₱${Number(amount).toLocaleString()}`;

export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Nights between two yyyy-mm-dd strings.
export const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

export const todayStr = () => new Date().toISOString().split("T")[0];
