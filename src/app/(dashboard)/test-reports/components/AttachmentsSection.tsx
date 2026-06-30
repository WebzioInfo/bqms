import { ReportFormData } from "./types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X } from "lucide-react";

interface Props {
  data: ReportFormData;
  updateData: (updates: Partial<ReportFormData>) => void;
}

export function AttachmentsSection({ data, updateData }: Props) {
  // Placeholder for actual file upload logic. 
  // We just allow adding a dummy file string to demonstrate UI for now.
  const handleAddDummyFile = () => {
    updateData({ attachments: [...data.attachments, `scanned_report_${Date.now()}.pdf`] });
  };

  const removeFile = (index: number) => {
    const newAttachments = [...data.attachments];
    newAttachments.splice(index, 1);
    updateData({ attachments: newAttachments });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
      <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Attachments</h2>
          <p className="text-sm text-slate-500">Upload scanned lab reports, images, or additional PDFs.</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.attachments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {data.attachments.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                    <File className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-slate-700 truncate font-medium">{file}</span>
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={handleAddDummyFile}>
          <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Click to upload or drag and drop</h3>
          <p className="text-xs text-slate-500">SVG, PNG, JPG, or PDF (max. 10MB)</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); handleAddDummyFile(); }}>
            Select Files
          </Button>
        </div>
      </div>
    </div>
  );
}
