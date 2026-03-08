/**
 * Chia nhỏ mảng dữ liệu lớn thành mảng chứa các mảng con (batches)
 * @param {Array} array Mảng dữ liệu cần chia nhỏ
 * @param {number} size Kích thước mỗi batch
 * @returns {Array[]} Mảng chứa các batches
 */
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

module.exports = {
  chunkArray,
};
