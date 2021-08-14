export const FileFormat = {
  Pdf: 1,
  Word: 2,
  Excel: 3,
} as const;

export type FileFormatType = typeof FileFormat[keyof typeof FileFormat];
