
import { 
  FileText, 
  Scissors, 
  Combine, 
  FileCheck, 
  ImageIcon, 
  Lock, 
  Unlock, 
  FilePlus2, 
  RotateCcw 
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Combine className="w-10 h-10 text-primary" />,
    title: "Merge PDFs",
    description: "Combine multiple PDFs into a single document",
    link: "/merge-pdf"
  },
  {
    icon: <Scissors className="w-10 h-10 text-primary" />,
    title: "Split PDF",
    description: "Extract pages or split PDF into multiple files",
    link: "/split-pdf"
  },
  {
    icon: <FileCheck className="w-10 h-10 text-primary" />,
    title: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    link: "/compress-pdf"
  },
  {
    icon: <ImageIcon className="w-10 h-10 text-primary" />,
    title: "PDF to Image",
    description: "Convert PDF pages to JPG, PNG or other formats",
    link: "/pdf-to-image"
  },
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: "PDF to Text",
    description: "Extract text content from PDF documents",
    link: "/pdf-to-text"
  },
  {
    icon: <Lock className="w-10 h-10 text-primary" />,
    title: "Protect PDF",
    description: "Add password protection to sensitive documents",
    link: "/protect-pdf"
  },
  {
    icon: <Unlock className="w-10 h-10 text-primary" />,
    title: "Unlock PDF",
    description: "Remove password protection from PDFs",
    link: "/unlock-pdf"
  },
  {
    icon: <RotateCcw className="w-10 h-10 text-primary" />,
    title: "Rotate PDF",
    description: "Change page orientation of your PDF files",
    link: "/rotate-pdf"
  },
  {
    icon: <FilePlus2 className="w-10 h-10 text-primary" />,
    title: "Create PDF",
    description: "Generate PDF from various file formats",
    link: "/create-pdf"
  },
];

const FeatureSection = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Powerful PDF Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to work with PDF files in one place
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-card rounded-xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300 group"
            >
              <div className="bg-primary/5 rounded-lg w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
