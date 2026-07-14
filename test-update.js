const productId = NaN;
const isNumeric = productId && !isNaN(Number(productId));
console.log('isNumeric:', isNumeric);
let realId = null;
if (!isNumeric) {
  // realId is null
} else {
  realId = Number(productId);
}
console.log('realId:', realId);
if (realId) {
  console.log('Entered if (realId)');
} else {
  console.log('Entered else');
}
