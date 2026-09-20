const generateOrderNumber = () => {
  // specify for identity the informasi
  const identity = "ORD";

  // Get the current time
  const now = new Date();

  // Get the current year
  const year = now.getFullYear();

  // Get the current month and starting where number one
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Get the current date
  const day = String(now.getDate()).padStart(2, "0");

  // Combine the year-month-time format
  const format = `${year}${month}${day}`;

  // create random number
  const numberRandom = Math.floor(1000 + Math.random() * 9000);

  // Then combine Everything
  return `${identity}-${format}-${numberRandom}`;
};

export default generateOrderNumber;
