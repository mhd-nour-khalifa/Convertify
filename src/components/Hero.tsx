
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      {/* Background circles */}
      <div className="absolute top-0 right-0 -mt-40 -mr-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -mb-40 -ml-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block py-1 px-3 mb-6 rounded-full bg-secondary text-secondary-foreground text-sm font-medium animate-fade-in">
            Simplify Document Management
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6 fade-in-up">
            Fast & Simple
            <span className="block text-primary">File Conversion</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto fade-in-up animation-delay-200">
            Convert, edit, and manage PDF documents and various file formats with ease. 
            Powerful tools, intuitive interface, fast results.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-up animation-delay-400">
            <Link
              to="/pdf-tools"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center"
            >
              Explore Tools
              <ArrowRight size={18} className="ml-2" />
            </Link>
            
            <Link
              to="/how-it-works"
              className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
