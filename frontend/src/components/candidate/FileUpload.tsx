
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onTextInput: (text: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTextInput }) => {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type.includes('officedocument.wordprocessingml')) {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        });
        resetFileInput();
      }
    }
  };
  
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileName('');
    onFileSelect(null);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTextInput(e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upload')}
        >
          Upload Resume
        </Button>
        <Button
          type="button"
          variant={mode === 'paste' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('paste')}
        >
          Paste Resume
        </Button>
      </div>
      
      {mode === 'upload' ? (
        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            id="resume-upload"
          />
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {fileName || 'Drag and drop your resume or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('resume-upload')?.click()}
            >
              Select File
            </Button>
            {fileName && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={resetFileInput}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Textarea
          placeholder="Paste resume text here..."
          className="min-h-[200px]"
          value={text}
          onChange={handleTextChange}
        />
      )}
    </div>
  );
};
