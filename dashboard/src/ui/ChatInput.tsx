import { useState, useRef } from 'react';
import { Dropdown, type DropdownOption } from './Dropdown.tsx';

export interface AttachedFile {
  id: string;
  file: File;
  name: string;
  type: string;
}

export interface ChatInputProps {
  onSend?: (message: string, files: AttachedFile[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

const modeOptions: DropdownOption[] = [
  { id: 'usecase', label: 'UseCase', icon: 'apps' },
  { id: 'knowledge', label: 'Knowledge', icon: 'menu_book' },
  { id: 'selection', label: 'Selection', icon: 'checklist' },
  { id: 'analysis', label: 'Analysis', icon: 'analytics' },
];

export function ChatInput({
  onSend,
  placeholder = 'Ask anything ',
  suggestions = [],
  className = '',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('usecase');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: AttachedFile[] = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      type: f.type,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('python') || type.includes('javascript') || type.includes('text/')) return 'code';
    return 'description';
  };

  const getFileLabel = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase();
    return ext ?? 'File';
  };

  const handleSubmit = () => {
    if (!message.trim() && files.length === 0) return;
    onSend?.(message, files);
    setMessage('');
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Input Card */}
      <div className="relative bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-outline-variant p-4 transition-all focus-within:shadow-[0_8px_32px_rgba(26,77,46,0.06)] focus-within:border-primary/20">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder-outline px-1 py-1 text-base font-sans"
        />

        {/* Attached Files */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {files.map(f => (
              <div
                key={f.id}
                className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-surface-container-high/60 text-on-surface-variant"
              >
                <span className="icon text-[16px]">{getFileIcon(f.type)}</span>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] font-semibold text-on-surface truncate max-w-[120px]">{f.name}</span>
                  <span className="text-[9px] text-outline">{getFileLabel(f.name)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  <span className="icon text-[14px] text-outline">close</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && <div className="mb-6" />}

        <div className="flex items-center justify-between">
          {/* Dropdown */}
          <Dropdown
            options={modeOptions}
            value={mode}
            onChange={setMode}
            icon="apps"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-outline/40 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="icon text-xl">attachment</span>
            </button>
            <button
              type="button"
              className="text-outline/40 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="icon text-xl">language</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-primary shadow-lg transition-all bg-primary-container shadow-primary/20 hover:bg-primary cursor-pointer"
            >
              <span className="icon text-xl">graphic_eq</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion Chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { setMessage(s); }}
              className="px-4 py-1.5 rounded-full border border-outline-variant bg-surface-container-lowest/40 text-xs font-medium text-on-surface-variant hover:bg-surface-container-lowest hover:border-primary/20 hover:text-primary transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
