import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";

interface DataUploadProps {
  onDataLoaded: (data: any) => void;
}

const DataUpload = ({ onDataLoaded }: DataUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [companyMetrics, setCompanyMetrics] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = import.meta.env.DEV ? "http://localhost:8000/api/upload" : "/api/upload";
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        setUploadStatus("success");
        setStatusMessage(result.message);
        setCompanyMetrics(result.metrics);
        onDataLoaded(result.metrics);
      } else {
        setUploadStatus("error");
        setStatusMessage(result.message || "Upload failed");
      }
    } catch (error) {
      setUploadStatus("error");
      if (error instanceof TypeError) {
        setStatusMessage("Cannot connect to backend server. Make sure it's running on port 8000.");
      } else {
        setStatusMessage("Network error during upload");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const clearUpload = () => {
    setUploadStatus("idle");
    setStatusMessage("");
    setCompanyMetrics(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="w-full px-6 py-4">
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h3 className="font-bold">Company Data Upload</h3>
              <p className="text-xs text-muted-foreground">
                Upload Q1-Q4 data for personalized calculations
              </p>
            </div>
          </div>
          {uploadStatus === "success" && (
            <button
              onClick={clearUpload}
              className="p-2 rounded-lg hover:bg-neon-red/10 text-neon-red transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {uploadStatus === "idle" && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-neon-cyan/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-foreground mb-1">
              {isUploading ? "Uploading..." : "Drop your file here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports CSV, Excel (.xlsx, .xls)
            </p>
          </div>
        )}

        {uploadStatus === "success" && companyMetrics && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-neon-green">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Data loaded successfully</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {companyMetrics.total_revenue && (
                <div className="glass-panel rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="font-mono-nums text-lg font-bold text-neon-cyan">
                    {formatCurrency(companyMetrics.total_revenue)}
                  </p>
                </div>
              )}
              {companyMetrics.total_profit && (
                <div className="glass-panel rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
                  <p className="font-mono-nums text-lg font-bold text-neon-green">
                    {formatCurrency(companyMetrics.total_profit)}
                  </p>
                </div>
              )}
              {companyMetrics.current_headcount && (
                <div className="glass-panel rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Headcount</p>
                  <p className="font-mono-nums text-lg font-bold text-foreground">
                    {companyMetrics.current_headcount} FTE
                  </p>
                </div>
              )}
              {companyMetrics.avg_cac && (
                <div className="glass-panel rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Avg CAC</p>
                  <p className="font-mono-nums text-lg font-bold text-neon-orange">
                    {formatCurrency(companyMetrics.avg_cac)}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              All calculations will now use your actual company data as baseline.
            </p>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-center gap-2 text-neon-red p-4 rounded-lg bg-neon-red/5">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{statusMessage}</span>
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>Expected columns:</strong> revenue, profit, costs, headcount, cac, new_customers, 
            marketing_spend, churn_rate, retention_rate, nps, csat, pipeline, deals_closed
          </p>
          <p className="text-xs text-muted-foreground">
            One row per quarter (Q1, Q2, Q3, Q4) or monthly data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
