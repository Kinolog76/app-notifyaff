import Papa from "papaparse";
import { z } from "zod";

const linkSchema = z.object({
  url: z.string().url("Invalid URL format"),
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  tags: z.string().optional(),
});

export type ParsedLink = z.infer<typeof linkSchema>;

export interface ParseResult {
  success: boolean;
  data: ParsedLink[];
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

export const parseCSV = (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: (results) => {
        const validLinks: ParsedLink[] = [];
        const errors: ParseResult["errors"] = [];

        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because index starts at 0 and we have header row

          try {
            const validated = linkSchema.parse({
              url: row.url || row.URL,
              name: row.name || row.Name,
              category: row.category || row.Category || undefined,
              tags: row.tags || row.Tags || undefined,
            });
            validLinks.push(validated);
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.issues.forEach((issue) => {
                errors.push({
                  row: rowNumber,
                  field: issue.path[0]?.toString(),
                  message: issue.message,
                });
              });
            } else {
              errors.push({
                row: rowNumber,
                message: "Unknown parsing error",
              });
            }
          }
        });

        resolve({
          success: errors.length === 0,
          data: validLinks,
          errors,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          errors: [
            {
              row: 0,
              message: `CSV parsing failed: ${error.message}`,
            },
          ],
        });
      },
    });
  });
};

export const generateCSVTemplate = () => {
  const delimiter = ";";

  const headers = ["url", "name", "category", "tags"];
  const exampleRow = [
    "https://example.com/affiliate/abc123",
    "Example Product",
    "amazon",
    "fashion, summer",
  ];

  const csv = [
    headers.join(delimiter),
    exampleRow.join(delimiter),
  ].join("\n");

  return csv;
};

export const downloadCSVTemplate = () => {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "links-import-template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
