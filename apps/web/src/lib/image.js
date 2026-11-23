const MAX_SIDE = 1600;

/**
 * Phone photos are often 4,000 pixels wide and several megabytes. Receipts read
 * just as well at 1,600 pixels, and a smaller image uploads faster and costs
 * fewer AI tokens. Anything the browser can't draw is sent as it is.
 */
export async function shrinkImage(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  return blob ? new File([blob], 'receipt.jpg', { type: 'image/jpeg' }) : file;
}
