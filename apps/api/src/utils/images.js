const IMAGE_TYPES = [
  { extension: 'jpg', mediaType: 'image/jpeg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { extension: 'png', mediaType: 'image/png', matches: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { extension: 'webp', mediaType: 'image/webp', matches: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP' },
];

/** The bytes decide the type, not the filename or header, both of which the client controls. */
export function detectImageType(buffer) {
  return IMAGE_TYPES.find((type) => buffer?.length >= 12 && type.matches(buffer)) ?? null;
}
