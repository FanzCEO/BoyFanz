import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const policyLinks = [
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Privacy & Age Verification", path: "/privacy" },
    { name: "About Us", path: "/about" },
    { name: "Content Management Policy and Data Governance Procedures", path: "/content-policy" },
    { name: "Cookies Policy", path: "/cookies" },
    { name: "Legal Library & Ethics Policy", path: "/legal-ethics" },
    { name: "Complaint Policy", path: "/complaint-policy" },
    { name: "Cancellation Policy", path: "/cancellation" },
    { name: "Adult Star Model Release: 2257 and Agreement with Fanz™ Unlimited Network LLC", path: "/model-release-star" },
    { name: "Adult Co-Star Model Release: 2257 and Agreement with Fanz™ Unlimited Network LLC", path: "/model-release-costar" },
    { name: "Transaction/Chargeback Policy", path: "/transaction-policy" },
    { name: "Tech Support", path: "/help" },
    { name: "Want to Request a New Feature?", path: "/help/tickets/new" },
    { name: "Become a VIP", path: "/vip" },
    { name: "Contact us", path: "/contact" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 px-4 mt-12">
      <div className="max-w-7xl mx-auto">
        {/* Policy Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {policyLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-sm hover:text-blue-400 transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Copyright and Company Info */}
        <div className="text-center text-sm text-gray-400">
          <p>
            © {currentYear} BoyFanz, All rights reserved.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-gray-400 text-xs uppercase tracking-wider">A</span>
            <img
              src="/fanz-group-holdings.png"
              alt="FANZ Group Holdings"
              className="h-8 opacity-70 hover:opacity-100 transition-opacity"
            />
            <span className="text-gray-400 text-xs uppercase tracking-wider">Company</span>
          </div>
          <p className="mt-2">
            Address: 30 N Gould St #45302 Sheridan, Wyoming United States
          </p>
        </div>
      </div>
    </footer>
  );
}
