
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureSection from "@/components/FeatureSection";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const PDFTools = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">PDF Tools</span>
          </nav>
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">PDF Tools</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to work with PDF files in one place. Convert, merge, split, and more.
            </p>
          </div>
          
          {/* Feature Grid (reusing the FeatureSection component) */}
          <FeatureSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PDFTools;
