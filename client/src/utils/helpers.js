export const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const formatDate = (dateStr, options = {}) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });

export const truncate = (str, length = 80) =>
  str?.length > length ? `${str.slice(0, length)}…` : str;

export const classNames = (...classes) =>
  classes.filter(Boolean).join(" ");
