import React from 'react';
import { Shield, Mail, MapPin, FileText, AlertCircle, Clock, Scale } from 'lucide-react';

export default function DMCAPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">DMCA Policy</h1>
            <p className="text-gray-400">Digital Millennium Copyright Act Compliance</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          Last Updated: January 16, 2026
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-gray-300">
        {/* Introduction */}
        <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-orange-500" />
            DMCA Safe Harbor Statement
          </h2>
          <p className="mb-4">
            BoyFanz, operated by Fanz Unlimited Network (FUN) L.L.C., respects the intellectual
            property rights of others and expects our users to do the same. In accordance with
            the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously
            to claims of copyright infringement committed using our service.
          </p>
          <p>
            We have adopted and implemented a policy that provides for the termination, in
            appropriate circumstances, of users who are repeat infringers of copyright. We
            also accommodate and do not interfere with standard technical measures used by
            copyright owners to protect their materials.
          </p>
        </section>

        {/* Designated Agent */}
        <section className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/30">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-500" />
            Designated DMCA Agent
          </h2>
          <p className="mb-4">
            Our designated agent for receiving notifications of claimed infringement is:
          </p>
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Fanz Unlimited Network (FUN) L.L.C.</p>
                <p className="text-gray-400">DMCA Designated Agent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-white">30 N Gould St #45302</p>
                <p className="text-white">Sheridan, Wyoming 82801</p>
                <p className="text-gray-400">United States</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <a href="mailto:dmca@fanzunlimited.com" className="text-orange-400 hover:text-orange-300 font-medium">
                  dmca@fanzunlimited.com
                </a>
                <p className="text-gray-400 text-sm">For DMCA notices only</p>
              </div>
            </div>
          </div>
        </section>

        {/* How to File a DMCA Notice */}
        <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            How to File a DMCA Takedown Notice
          </h2>
          <p className="mb-4">
            If you believe that content available on or through BoyFanz infringes one or more
            of your copyrights, please send a written notification of claimed infringement to
            our Designated Agent containing the following information:
          </p>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <span className="font-semibold text-white">Physical or electronic signature</span>
              <p className="text-gray-400 ml-6 mt-1">
                A physical or electronic signature of the copyright owner or a person authorized
                to act on their behalf.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Identification of copyrighted work</span>
              <p className="text-gray-400 ml-6 mt-1">
                Identification of the copyrighted work claimed to have been infringed. If multiple
                copyrighted works are covered by a single notification, provide a representative
                list of such works.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Identification of infringing material</span>
              <p className="text-gray-400 ml-6 mt-1">
                Identification of the material that is claimed to be infringing and information
                reasonably sufficient to permit us to locate the material (e.g., the URL or URLs
                of the infringing content).
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Contact information</span>
              <p className="text-gray-400 ml-6 mt-1">
                Information reasonably sufficient to permit us to contact you, such as an address,
                telephone number, and email address.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Good faith statement</span>
              <p className="text-gray-400 ml-6 mt-1">
                A statement that you have a good faith belief that use of the material in the
                manner complained of is not authorized by the copyright owner, its agent, or the law.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Accuracy and authorization statement</span>
              <p className="text-gray-400 ml-6 mt-1">
                A statement that the information in the notification is accurate, and under penalty
                of perjury, that you are authorized to act on behalf of the copyright owner.
              </p>
            </li>
          </ol>
        </section>

        {/* Counter-Notification */}
        <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Counter-Notification Procedure
          </h2>
          <p className="mb-4">
            If you believe that your content was removed or disabled as a result of a mistake or
            misidentification, you may submit a counter-notification to our Designated Agent
            containing the following:
          </p>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <span className="font-semibold text-white">Physical or electronic signature</span>
              <p className="text-gray-400 ml-6 mt-1">
                Your physical or electronic signature.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Identification of removed material</span>
              <p className="text-gray-400 ml-6 mt-1">
                Identification of the material that has been removed or to which access has been
                disabled, and the location at which the material appeared before it was removed
                or access was disabled.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Statement under penalty of perjury</span>
              <p className="text-gray-400 ml-6 mt-1">
                A statement under penalty of perjury that you have a good faith belief that the
                material was removed or disabled as a result of mistake or misidentification.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Consent to jurisdiction</span>
              <p className="text-gray-400 ml-6 mt-1">
                Your name, address, and telephone number, and a statement that you consent to the
                jurisdiction of the Federal District Court for the judicial district in which your
                address is located, or if outside the United States, for any judicial district in
                which we may be found, and that you will accept service of process from the person
                who provided the original notification or an agent of such person.
              </p>
            </li>
          </ol>
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> If we receive a valid counter-notification, we will forward
              it to the party who submitted the original DMCA notification. The original complainant
              will then have 10 business days to notify us that they have filed a legal action seeking
              a court order to restrain you from engaging in infringing activity. If we do not receive
              such notice, we may restore the removed material within 10-14 business days.
            </p>
          </div>
        </section>

        {/* Repeat Infringer Policy */}
        <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Repeat Infringer Policy
          </h2>
          <p className="mb-4">
            In accordance with the DMCA and other applicable law, we have adopted a policy of
            terminating, in appropriate circumstances and at our sole discretion, users who are
            deemed to be repeat infringers.
          </p>
          <p>
            We may also, at our sole discretion, limit access to our service and/or terminate
            the accounts of any users who infringe any intellectual property rights of others,
            whether or not there is any repeat infringement.
          </p>
        </section>

        {/* False Claims Warning */}
        <section className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Warning: False Claims
          </h2>
          <p className="text-red-200">
            Please be aware that under 17 U.S.C. § 512(f), any person who knowingly materially
            misrepresents that material or activity is infringing, or that material or activity
            was removed or disabled by mistake or misidentification, may be subject to liability
            for damages, including costs and attorneys' fees. If you are not sure whether material
            available online infringes your copyright, we suggest that you first contact an attorney.
          </p>
        </section>

        {/* Contact Information */}
        <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
          <p className="mb-4">
            For any questions regarding this DMCA Policy or to report copyright infringement,
            please contact:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-white mb-2">DMCA Notices</p>
              <a href="mailto:dmca@fanzunlimited.com" className="text-orange-400 hover:text-orange-300">
                dmca@fanzunlimited.com
              </a>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-white mb-2">General Legal Inquiries</p>
              <a href="mailto:legal@fanzunlimited.com" className="text-orange-400 hover:text-orange-300">
                legal@fanzunlimited.com
              </a>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="pt-6 border-t border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Related Policies</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/terms" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="/privacy" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/content-policy" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              Content Policy
            </a>
            <a href="/2257" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              2257 Statement
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
