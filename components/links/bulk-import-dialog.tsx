"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseCSV, downloadCSVTemplate, ParseResult } from "@/lib/csv-parser";
import { Upload, Download, AlertCircle, CheckCircle2 } from "lucide-react";

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkImportDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importComplete, setImportComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setParseResult(null);
      setImportComplete(false);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const handleParseAndImport = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      // Parse CSV
      const result = await parseCSV(file);
      setParseResult(result);

      if (result.success && result.data.length > 0) {
        // Import to database
        const response = await fetch("/api/links/bulk-import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ links: result.data }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("API error response:", error);
          throw new Error(error.details || error.error || "Failed to import links");
        }

        setImportComplete(true);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParseResult(null);
    setImportComplete(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Links</DialogTitle>
          <DialogDescription>
            Import multiple affiliate links from a CSV file. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Download Template */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={downloadCSVTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label
              htmlFor="csv-upload"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Upload CSV File
            </label>
            <div className="flex items-center gap-2">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {file && (
              <p className="text-sm text-gray-500">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Parse Results */}
          {parseResult && (
            <div className="space-y-2">
              {parseResult.success ? (
                <div className="flex items-start gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Successfully parsed {parseResult.data.length} link
                      {parseResult.data.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Found {parseResult.errors.length} error
                        {parseResult.errors.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {parseResult.errors.slice(0, 10).map((error, index) => (
                      <div
                        key={index}
                        className="text-xs text-red-600 dark:text-red-400 pl-11"
                      >
                        Row {error.row}
                        {error.field && ` (${error.field})`}: {error.message}
                      </div>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <p className="text-xs text-gray-500 pl-11">
                        ... and {parseResult.errors.length - 10} more
                      </p>
                    )}
                  </div>
                  {parseResult.data.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-11">
                      {parseResult.data.length} valid link
                      {parseResult.data.length !== 1 ? "s" : ""} found. You can
                      still import the valid ones.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {importComplete && (
            <div className="flex items-start gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Import completed successfully!
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleParseAndImport}
            disabled={!file || isLoading || importComplete}
            className="gap-2"
          >
            {isLoading ? (
              "Importing..."
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Links
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
