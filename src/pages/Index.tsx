
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import { ChevronRight, CheckCircle2, Award, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <FeatureSection />
        
        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Converting and managing your files is simple and straightforward
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 relative">
                <div className="bg-primary/10 rounded-full p-5 mb-6">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Upload Your Files</h3>
                <p className="text-muted-foreground">
                  Drag and drop your files or browse to select them from your device
                </p>
                
                {/* Arrow for desktop */}
                <div className="hidden md:block absolute top-16 right-0 transform translate-x-1/2">
                  <ChevronRight size={40} className="text-muted-foreground/30" />
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 relative">
                <div className="bg-primary/10 rounded-full p-5 mb-6">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Select Options</h3>
                <p className="text-muted-foreground">
                  Choose your desired settings and conversion parameters
                </p>
                
                {/* Arrow for desktop */}
                <div className="hidden md:block absolute top-16 right-0 transform translate-x-1/2">
                  <ChevronRight size={40} className="text-muted-foreground/30" />
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-primary/10 rounded-full p-5 mb-6">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Download Result</h3>
                <p className="text-muted-foreground">
                  Get your converted files instantly, ready to use
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Why Choose Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide top-quality conversion tools with exceptional benefits
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-card rounded-xl p-8 shadow-subtle">
                <div className="mb-6">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your files are processed securely and deleted automatically after conversion. 
                  We prioritize your privacy and data security.
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-8 shadow-subtle">
                <div className="mb-6">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">Fast & Efficient</h3>
                <p className="text-muted-foreground">
                  Optimized tools that provide quick conversions, saving you time and resources.
                  Batch processing available for multiple files.
                </p>
              </div>
              
              <div className="bg-card rounded-xl p-8 shadow-subtle">
                <div className="mb-6">
                  <Award className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">High Quality</h3>
                <p className="text-muted-foreground">
                  Advanced algorithms ensure optimal quality preservation during conversion.
                  Professional-grade results every time.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-primary/10 rounded-2xl p-12 md:p-16 text-center max-w-5xl mx-auto relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
              
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 relative z-10">
                Ready to Transform Your Documents?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 relative z-10">
                Get started with our powerful tools today. No registration required!
              </p>
              <div className="relative z-10">
                <a 
                  href="/pdf-tools" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-3 rounded-lg font-medium inline-flex items-center"
                >
                  Start Converting Now
                  <ChevronRight className="ml-1 w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
