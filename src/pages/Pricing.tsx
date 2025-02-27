
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckIcon, XIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type PricingToggle = "monthly" | "annual";
type PricingTier = "free" | "pro" | "business";

interface PricingPlan {
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: {
    text: string;
    included: boolean;
  }[];
  buttonText: string;
  popular?: boolean;
}

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<PricingToggle>("monthly");
  const [highlightedPlan, setHighlightedPlan] = useState<PricingTier | null>(null);
  
  const pricingPlans: PricingPlan[] = [
    {
      name: "Free",
      description: "Basic PDF tools for occasional use",
      price: {
        monthly: 0,
        annual: 0,
      },
      features: [
        { text: "5 PDF conversions per day", included: true },
        { text: "File size limit: 10 MB", included: true },
        { text: "Basic PDF tools (Merge, Split)", included: true },
        { text: "Create PDF from files", included: true },
        { text: "PDF to Image conversion", included: true },
        { text: "Standard file compression", included: true },
        { text: "PDF to Office conversion", included: false },
        { text: "OCR for scanned documents", included: false },
        { text: "Batch processing", included: false },
        { text: "Remove watermarks", included: false },
      ],
      buttonText: "Get Started",
    },
    {
      name: "Pro",
      description: "Advanced tools for individual professionals",
      price: {
        monthly: 9.99,
        annual: 7.99,
      },
      features: [
        { text: "Unlimited PDF conversions", included: true },
        { text: "File size limit: 100 MB", included: true },
        { text: "All basic PDF tools", included: true },
        { text: "Create PDF from files", included: true },
        { text: "PDF to Image conversion", included: true },
        { text: "Advanced compression", included: true },
        { text: "PDF to Office conversion", included: true },
        { text: "OCR for scanned documents", included: true },
        { text: "Batch processing", included: true },
        { text: "Remove watermarks", included: false },
      ],
      buttonText: "Start Free Trial",
      popular: true,
    },
    {
      name: "Business",
      description: "Enterprise-grade tools with API access",
      price: {
        monthly: 29.99,
        annual: 24.99,
      },
      features: [
        { text: "Unlimited PDF conversions", included: true },
        { text: "File size limit: 500 MB", included: true },
        { text: "All PDF tools", included: true },
        { text: "Create PDF from files", included: true },
        { text: "PDF to Image conversion", included: true },
        { text: "Advanced compression", included: true },
        { text: "PDF to Office conversion", included: true },
        { text: "OCR for scanned documents", included: true },
        { text: "Batch processing", included: true },
        { text: "Remove watermarks", included: true },
        { text: "API Access & Integration", included: true },
        { text: "Team Management", included: true },
      ],
      buttonText: "Contact Sales",
    },
  ];

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
            <span className="text-foreground font-medium">Pricing</span>
          </nav>
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your PDF conversion needs
            </p>
          </div>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-secondary rounded-lg p-1 inline-flex">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === "monthly" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === "annual" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual <span className="text-xs text-emerald-500 font-bold">Save 20%</span>
              </button>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative border rounded-xl p-6 transition-all duration-300 ${
                  plan.popular
                    ? "shadow-xl border-primary/50 scale-105 md:scale-105 z-10" 
                    : highlightedPlan === (index === 0 ? "free" : index === 1 ? "pro" : "business")
                    ? "shadow-lg border-primary/30"
                    : "shadow-subtle hover:shadow-md hover:border-primary/20"
                }`}
                onMouseEnter={() => setHighlightedPlan(index === 0 ? "free" : index === 1 ? "pro" : "business")}
                onMouseLeave={() => setHighlightedPlan(null)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 text-center">
                    <span className="bg-primary text-primary-foreground text-xs font-bold py-1 px-3 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${plan.price[billingPeriod].toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.price[billingPeriod] > 0 ? `/${billingPeriod === "monthly" ? "mo" : "mo, billed annually"}` : ""}
                  </span>
                </div>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start">
                      {feature.included ? (
                        <CheckIcon className="h-5 w-5 text-emerald-500 shrink-0 mr-3 mt-0.5" />
                      ) : (
                        <XIcon className="h-5 w-5 text-muted-foreground shrink-0 mr-3 mt-0.5" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 shadow-subtle">
                <h3 className="text-lg font-medium mb-2">What's included in the free plan?</h3>
                <p className="text-muted-foreground">
                  The free plan includes basic PDF tools such as merging, splitting, and creating PDFs from images or other files. 
                  You get 5 conversions per day with a file size limit of 10MB per file.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-subtle">
                <h3 className="text-lg font-medium mb-2">Can I upgrade or downgrade my plan at any time?</h3>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your subscription at any time. When upgrading, you'll immediately gain access to additional features. 
                  When downgrading, changes will take effect at the end of your current billing cycle.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-subtle">
                <h3 className="text-lg font-medium mb-2">Do you offer a free trial for premium plans?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 7-day free trial for our Pro plan, giving you full access to all premium features. 
                  No credit card is required to start your trial.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-subtle">
                <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards including Visa, Mastercard, and American Express. 
                  We also support PayPal for convenient payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
