
import React, { useRef, useState } from 'react';
import { ingestTabularData } from '../ollamaService';

interface BulkImportPanelProps {
  moduleName: 'Risk' | 'Audit' | 'User' | 'Asset' | 'Policy';
  templateHeaders: string[];
  onImportComplete: (data: any[]) => void;
  onCancel: () => void;
}

const BulkImportPanel: React.FC<BulkImportPanelProps> = ({ moduleName, templateHeaders, onImportComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + templateHeaders.join(",") + "\n" + 
      templateHeaders.map(() => "Sample Data").join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RiskLens_${moduleName}_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await ingestTabularData(base64, file.type, moduleName);
        setPendingData(res);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("AI Ingestion failed. Ensure the file is readable.");
    }
  };

  const confirmImport = () => {
    if (!pendingData) return;
    onImportComplete(pendingData);
    setPendingData(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[75vh]">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Bulk Ingest: {moduleName} Register</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Import historical records via Excel/CSV with AI column mapping</p>
          </div>
          <button onClick={onCancel} className="text-slate-300 hover:text-slate-900 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
          {!pendingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
              <div className="space-y-6">
                <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                  <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-4">Step 1: Get Template</h4>
                  <p className="text-sm text-blue-600/70 mb-6 leading-relaxed font-medium">Download our standardized structure to ensure 100% ingestion accuracy.</p>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 border border-blue-100"
                  >
                    📥 Download CSV Template
                  </button>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                   <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">AI Note</h4>
                   <p className="text-[10px] text-slate-500 italic leading-relaxed">"You can also upload your own existing Excel file. Our Gemini engine will attempt to auto-map your columns to our platform schema."</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[3rem] p-12 text-center group hover:border-blue-200 transition-all h-full">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" />
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">📊</div>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-4">Upload Data File</h4>
                <p className="text-xs text-slate-400 font-medium max-w-[180px] mx-auto mb-8">Drop your Excel/CSV here or click below to browse.</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'AI Processing...' : 'Select File'}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-8">
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Preview: Mapped AI Output ({pendingData.length} records)</h4>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[8px] font-black uppercase tracking-widest border border-green-200">✓ Ready for Vault</span>
                 </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {Object.keys(pendingData[0]).map(key => (
                        <th key={key} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-6 py-4 text-xs font-bold text-slate-700 truncate max-w-[150px]">{val?.toString() || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {pendingData && (
          <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
            <button 
              onClick={confirmImport}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-2xl transition-all uppercase text-xs tracking-[0.2em]"
            >
              Commit Data to Registry
            </button>
            <button 
              onClick={() => setPendingData(null)}
              className="px-12 py-5 border-2 border-slate-200 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-white transition-all"
            >
              Discard & Re-Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImportPanel;
