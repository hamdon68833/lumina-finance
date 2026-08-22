import React, { useState, useEffect } from 'react';
import { FileCode, Folder, Copy, Check, Download, BookOpen, Terminal, Sparkles } from 'lucide-react';
import { PythonProjectFile } from '../types';

export const PythonProjectCodeViewer: React.FC = () => {
  const [fileList, setFileList] = useState<PythonProjectFile[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('python_project/app.py');
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/project/files')
      .then((res) => res.json())
      .then((data: PythonProjectFile[]) => {
        setFileList(data);
      })
      .catch((err) => console.error('Failed to load file list:', err));
  }, []);

  useEffect(() => {
    if (!selectedFilePath) return;
    setLoading(true);
    fetch(`/api/project/file-content?path=${encodeURIComponent(selectedFilePath)}`)
      .then((res) => res.json())
      .then((data) => {
        setFileContent(data.content || '');
      })
      .catch((err) => console.error('Failed to load file content:', err))
      .finally(() => setLoading(false));
  }, [selectedFilePath]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFilePath.split('/').pop() || 'file.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider">
              Python Streamlit Major Project
            </span>
            <span className="text-xs text-zinc-500">VTU Belagavi ISE (2025–2026)</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Modular Source Code Repository</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Explore and copy the exact Python code files built for the 10-step methodology synopsis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied File' : 'Copy File'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar File Picker */}
        <div className="bg-[#111113] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-2">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Project File Tree</span>
          </h3>

          <div className="space-y-1">
            {fileList.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFilePath(file.path)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                  selectedFilePath === file.path
                    ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/30'
                    : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${selectedFilePath === file.path ? 'text-blue-400' : 'text-zinc-600'}`} />
                <div className="truncate">
                  <p className="truncate font-mono">{file.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{file.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-400 p-2 space-y-2">
            <p className="font-semibold text-zinc-300 flex items-center gap-1 text-xs">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Streamlit Execution Command:</span>
            </p>
            <code className="block bg-[#09090b] p-2.5 rounded-xl border border-white/10 text-emerald-400 font-mono text-[10px]">
              pip install -r requirements.txt<br />
              streamlit run app.py
            </code>
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-3 bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
          <div className="bg-[#111113] border-b border-white/5 px-4 py-3 flex items-center justify-between text-xs text-zinc-300">
            <span className="font-mono text-blue-400">{selectedFilePath}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">UTF-8 • Python / Text</span>
          </div>

          <div className="p-4 flex-1 overflow-x-auto text-zinc-200 text-xs font-mono leading-relaxed">
            {loading ? (
              <div className="py-20 text-center text-zinc-500">Loading source file contents...</div>
            ) : (
              <pre className="whitespace-pre-wrap">{fileContent}</pre>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
