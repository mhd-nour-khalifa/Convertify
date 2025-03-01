
const PDFInstructionsSection = () => {
  return (
    <div className="bg-secondary/50 rounded-xl p-6 mt-8">
      <h3 className="text-lg font-medium mb-3">How to Process a PDF</h3>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
        <li>Upload your PDF file using the upload box above</li>
        <li>Enter and confirm a password</li>
        <li>Click the "Process PDF" button</li>
        <li>Download your processed PDF</li>
      </ol>
    </div>
  );
};

export default PDFInstructionsSection;
