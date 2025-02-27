
import { useState, useRef } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  description?: string;
}

const FileUploader = ({
  accept = ".pdf",
  maxSize = 10, // 10MB default
  maxFiles = 10,
  onFilesSelected,
  className,
  disabled = false,
  description = "Drag & drop files here or click to browse",
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFiles = (fileList: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const fileArray = Array.from(fileList);
    
    // Check file count
    if (fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return validFiles;
    }
    
    // Check each file
    for (const file of fileArray) {
      // Check file type
      const fileType = file.name.split(".").pop()?.toLowerCase();
      const acceptTypes = accept.split(",").map(type => 
        type.trim().replace(".", "").toLowerCase()
      );
      
      if (acceptTypes[0] !== "*" && fileType && !acceptTypes.includes(fileType)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        continue;
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxSize}MB size limit`,
          variant: "destructive",
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    const validFiles = validateFiles(droppedFiles);
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFilesSelected(validFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files?.length) return;
    
    const validFiles = validateFiles(e.target.files);
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFilesSelected(validFiles);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        multiple={maxFiles > 1}
        disabled={disabled}
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={cn(
          "w-full rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-10 cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-uploadZone-border bg-uploadZone",
          disabled && "opacity-60 cursor-not-allowed",
          selectedFiles.length > 0 && "border-primary/10 bg-uploadZone-hover"
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Processing files...</p>
          </div>
        ) : selectedFiles.length > 0 ? (
          <div className="w-full">
            <div className="flex items-center justify-center mb-4">
              <File className="w-10 h-10 text-primary" />
              <span className="ml-2 text-lg font-medium">
                {selectedFiles.length} file{selectedFiles.length !== 1 && "s"} selected
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto px-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-background rounded-md p-2 shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-primary hover:underline text-sm inline-flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFiles([]);
                  onFilesSelected([]);
                }}
              >
                Clear all
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-primary/10 rounded-full p-3 mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">
              {description}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Supported formats: {accept.replace(/\./g, "").toUpperCase()}
              <br />
              Max file size: {maxSize}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
