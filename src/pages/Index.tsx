
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import { ChevronRight, CheckCircle2, Award, Shield, Zap, FileText, Clock, BarChart4 } from "lucide-react";
import { useCounter } from "@/context/CounterContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Index = () => {
  const { totalOperations } = useCounter();
  const [count, setCount] = useState(0);
  
  // Animate the counter
  useEffect(() => {
    let start = 0;
    const end = totalOperations;
    
    // Set duration based on count difference
    const duration = Math.min(2000, Math.max(500, totalOperations * 100));
    
    // If no operations, don't animate
    if (end === 0) {
      setCount(0);
      return;
    }
    
    // Get animation frame to avoid setTimeout throttling
    let animationFrameId: number;
    let startTimestamp: number;
    
    // Gradually animate number
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = Math.floor(progress * (end - start) + start);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [totalOperations]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="flex-grow">
        <Hero />
        <FeatureSection />
        
        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Operations</h3>
                <p className="text-3xl font-bold text-primary mb-1">{count.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Files processed</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Processing Time</h3>
                <p className="text-3xl font-bold text-primary mb-1">&lt; 10s</p>
                <p className="text-sm text-muted-foreground">Average time per file</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart4 className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                <p className="text-3xl font-bold text-primary mb-1">99.9%</p>
                <p className="text-sm text-muted-foreground">Conversion success</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Converting and managing your files is simple and straightforward
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-primary/10 rounded-full p-5 mb-6">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Your Files</h3>
                <p className="text-muted-foreground">
                  Drag and drop your files or browse to select them from your device
                </p>
                
                {/* Arrow for desktop */}
                <div className="hidden md:block absolute top-16 right-0 transform translate-x-1/2 z-10">
                  <ChevronRight size={40} className="text-primary/30" />
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-primary/10 rounded-full p-5 mb-6">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Select Options</h3>
                <p className="text-muted-foreground">
                  Choose your desired settings and conversion parameters
                </p>
                
                {/* Arrow for desktop */}
                <div className="hidden md:block absolute top-16 right-0 transform translate-x-1/2 z-10">
                  <ChevronRight size={40} className="text-primary/30" />
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-primary/10 rounded-full p-5 mb-6">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Download Result</h3>
                <p className="text-muted-foreground">
                  Get your converted files instantly, ready to use
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Why Choose Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide top-quality conversion tools with exceptional benefits
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your files are processed securely and deleted automatically after conversion. 
                  We prioritize your privacy and data security.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast & Efficient</h3>
                <p className="text-muted-foreground">
                  Optimized tools that provide quick conversions, saving you time and resources.
                  Batch processing available for multiple files.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <Award className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">High Quality</h3>
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
            <div className="bg-gradient-to-r from-primary/90 to-purple-600/90 rounded-2xl p-12 md:p-16 text-center max-w-5xl mx-auto relative overflow-hidden shadow-xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10 text-white">
                Ready to Transform Your Documents?
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 relative z-10">
                Get started with our powerful tools today. No registration required!
              </p>
              <div className="relative z-10">
                <a 
                  href="/pdf-tools" 
                  className="bg-white text-primary hover:bg-white/90 transition-colors px-8 py-3 rounded-lg font-medium inline-flex items-center shadow-lg"
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
