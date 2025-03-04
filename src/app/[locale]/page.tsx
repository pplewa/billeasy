"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Suspense } from "react";
import { ArrowRight, CheckCircle, FileText, Mail, CreditCard, BarChart4, Globe } from "lucide-react";

function HomeContent() {
  const appT = useTranslations("app");
  const appName = appT("name");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Streamline Your Invoicing Process with {appName}
              </h1>
              <p className="text-xl text-gray-600">
                Create professional invoices in minutes, get paid faster, and manage your finances with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href={{ pathname: "/invoice/create" }}>
                    Create Invoice Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative rounded-lg shadow-xl overflow-hidden">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="font-bold text-xl text-blue-600">Invoice #INV-2023</div>
                    <div className="text-sm text-gray-500">Due: 30 days</div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">From</div>
                      <div className="font-medium">Your Business Name</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium">Client Company Ltd.</div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <div>Total</div>
                      <div>$1,250.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Your Business</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, send, and track professional invoices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-blue-600" />}
              title="Professional Templates"
              description="Choose from a variety of professionally designed invoice templates that make your business look its best."
            />
            <FeatureCard
              icon={<Mail className="h-10 w-10 text-blue-600" />}
              title="Email Integration"
              description="Send invoices directly to clients via email with just a few clicks. Track when they've been viewed."
            />
            <FeatureCard
              icon={<CreditCard className="h-10 w-10 text-blue-600" />}
              title="Multiple Payment Options"
              description="Accept payments through various methods including credit cards, bank transfers, and digital wallets."
            />
            <FeatureCard
              icon={<BarChart4 className="h-10 w-10 text-blue-600" />}
              title="Financial Insights"
              description="Get valuable insights into your business finances with detailed reports and analytics."
            />
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-blue-600" />}
              title="Multi-Language Support"
              description="Create invoices in multiple languages to better serve your international clients."
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-blue-600" />}
              title="Compliance Ready"
              description="Our invoices meet legal requirements in multiple countries, helping you stay compliant."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thousands of businesses trust {appName} for their invoicing needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Bill Easy has transformed how we handle invoicing. We've reduced the time spent on billing by 75%."
              author="Sarah Johnson"
              company="Design Studio Inc."
            />
            <TestimonialCard
              quote="The templates are professional and the system is intuitive. Our clients are impressed with our invoices."
              author="Michael Chen"
              company="Tech Solutions Ltd."
            />
            <TestimonialCard
              quote="As a freelancer, I needed something simple yet powerful. Bill Easy is exactly what I was looking for."
              author="Emma Rodriguez"
              company="Independent Consultant"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Starter"
              price="Free"
              description="Perfect for individuals and small businesses just getting started"
              features={[
                "Up to 5 invoices per month",
                "Basic templates",
                "Email support",
                "PDF export"
              ]}
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard
              title="Professional"
              price="$12"
              period="per month"
              description="Ideal for growing businesses with regular invoicing needs"
              features={[
                "Unlimited invoices",
                "All templates",
                "Priority support",
                "Multiple payment options",
                "Client portal"
              ]}
              buttonText="Try Free for 14 Days"
              buttonVariant="default"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="$29"
              period="per month"
              description="For established businesses with advanced requirements"
              features={[
                "Everything in Professional",
                "Custom templates",
                "API access",
                "Team accounts",
                "Advanced analytics",
                "Dedicated support"
              ]}
              buttonText="Contact Sales"
              buttonVariant="outline"
            />
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Invoicing?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that use {appName} to create professional invoices and get paid faster.
          </p>
          <Button size="lg" variant="secondary" asChild className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href={{ pathname: "/invoice/create" }}>
              Create Your First Invoice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  company,
}: {
  quote: string;
  author: string;
  company: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-yellow-500 mb-4">★★★★★</div>
      <p className="text-gray-700 mb-6 italic">&ldquo;{quote}&rdquo;</p>
      <div>
        <div className="font-semibold">{author}</div>
        <div className="text-gray-500 text-sm">{company}</div>
      </div>
    </div>
  );
}

// function PricingCard({
//   title,
//   price,
//   period,
//   description,
//   features,
//   buttonText,
//   buttonVariant,
//   highlighted = false,
// }: {
//   title: string;
//   price: string;
//   period?: string;
//   description: string;
//   features: string[];
//   buttonText: string;
//   buttonVariant: "default" | "outline" | "secondary";
//   highlighted?: boolean;
// }) {
//   return (
//     <div className={`bg-white rounded-lg border ${highlighted ? 'border-blue-500 shadow-lg ring-1 ring-blue-500' : 'shadow-sm'} p-8 flex flex-col h-full`}>
//       <div className="mb-6">
//         <h3 className="text-xl font-bold mb-2">{title}</h3>
//         <div className="flex items-baseline">
//           <span className="text-3xl font-bold">{price}</span>
//           {period && <span className="text-gray-500 ml-2">{period}</span>}
//         </div>
//         <p className="text-gray-600 mt-3">{description}</p>
//       </div>
//       <ul className="space-y-3 mb-8 flex-grow">
//         {features.map((feature, index) => (
//           <li key={index} className="flex items-start">
//             <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
//             <span>{feature}</span>
//           </li>
//         ))}
//       </ul>
//       <Button variant={buttonVariant} className={`w-full ${highlighted ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
//         {buttonText}
//       </Button>
//     </div>
//   );
// }

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
