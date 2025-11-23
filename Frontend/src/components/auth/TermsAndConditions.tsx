/**
 * Terms and Conditions Page Component
 * Displays the terms and conditions for using the INSPIRE platform
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function TermsAndConditions(): JSX.Element {
  const navigate = useNavigate();
  const { mode } = useTheme();

  return (
    <div
      className={`min-h-screen ${
        mode === "dark" ? "bg-gray-900" : "bg-gray-50"
      } py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`${
            mode === "dark" ? "bg-gray-800" : "bg-white"
          } rounded-2xl shadow-xl p-8 md:p-12`}
          style={{
            textRendering: "optimizeLegibility",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center text-sm font-medium"
            >
              ← Back
            </button>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "#000000" }}
            >
              Terms and Conditions
            </h1>
            <p className="font-medium" style={{ color: "#000000" }}>
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Content */}
          <div className="max-w-none" style={{ color: "#000000" }}>
            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                1. Acceptance of Terms
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                By accessing and using the I.N.S.P.I.R.E. (Intelligent Network
                System for Partnerships, Insights, Research & Expansion)
                platform, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                2. Description of Service
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                I.N.S.P.I.R.E. is an AI-powered B2B intelligence platform
                designed to help Micro, Small & Medium Enterprises (MSMEs) in
                Rwanda discover strategic partnership opportunities, analyze
                market trends, and make data-driven business decisions. Our
                services include:
              </p>
              <ul
                className="list-disc pl-6 mb-4 space-y-2 leading-relaxed"
                style={{ color: "#000000" }}
              >
                <li>Automated article classification and analysis</li>
                <li>AI-powered text summarization</li>
                <li>Company intelligence extraction and profiling</li>
                <li>Market analysis and recommendations</li>
                <li>Automated outreach campaign generation</li>
                <li>Data visualization and analytics</li>
              </ul>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                3. User Accounts
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                To access certain features of the platform, you must register
                for an account. You agree to:
              </p>
              <ul
                className="list-disc pl-6 mb-4 space-y-2 leading-relaxed"
                style={{ color: "#000000" }}
              >
                <li>
                  Provide accurate, current, and complete information during
                  registration
                </li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>
                  Accept responsibility for all activities that occur under your
                  account
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
              </ul>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                4. Acceptable Use
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                You agree not to use the platform to:
              </p>
              <ul
                className="list-disc pl-6 mb-4 space-y-2 leading-relaxed"
                style={{ color: "#000000" }}
              >
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or illegal content</li>
                <li>
                  Attempt to gain unauthorized access to the platform or its
                  systems
                </li>
                <li>Interfere with or disrupt the platform's operation</li>
                <li>
                  Use automated systems to access the platform without
                  permission
                </li>
                <li>
                  Resell or redistribute any data or content from the platform
                  without authorization
                </li>
              </ul>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                5. Intellectual Property
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                All content, features, and functionality of the platform,
                including but not limited to text, graphics, logos, icons,
                images, audio clips, digital downloads, and software, are the
                exclusive property of I.N.S.P.I.R.E. and its licensors and are
                protected by international copyright, trademark, and other
                intellectual property laws.
              </p>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                You may not reproduce, distribute, modify, create derivative
                works of, publicly display, or otherwise use any content from
                the platform without our express written permission.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                6. Data and Privacy
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                Your use of the platform is also governed by our Privacy Policy.
                By using the platform, you consent to the collection and use of
                your information as described in our Privacy Policy. We are
                committed to protecting your privacy and handling your data in
                accordance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                7. Service Availability
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                We strive to provide continuous access to the platform, but we
                do not guarantee that the service will be available at all
                times. We reserve the right to modify, suspend, or discontinue
                any part of the platform at any time without prior notice.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                8. Disclaimer of Warranties
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                The platform is provided "as is" and "as available" without
                warranties of any kind, either express or implied. We do not
                warrant that the platform will be uninterrupted, error-free, or
                free from viruses or other harmful components. We disclaim all
                warranties, express or implied, including but not limited to
                implied warranties of merchantability, fitness for a particular
                purpose, and non-infringement.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                9. Limitation of Liability
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                To the fullest extent permitted by law, I.N.S.P.I.R.E. and its
                affiliates, officers, employees, and agents shall not be liable
                for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use,
                goodwill, or other intangible losses resulting from your use of
                the platform.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                10. Indemnification
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                You agree to indemnify, defend, and hold harmless I.N.S.P.I.R.E.
                and its affiliates, officers, employees, and agents from and
                against any claims, liabilities, damages, losses, and expenses,
                including reasonable attorneys' fees, arising out of or in any
                way connected with your use of the platform or violation of
                these Terms.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                11. Termination
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                We may terminate or suspend your account and access to the
                platform immediately, without prior notice or liability, for any
                reason, including if you breach these Terms. Upon termination,
                your right to use the platform will immediately cease.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                12. Changes to Terms
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                We reserve the right to modify these Terms at any time. We will
                notify users of any material changes by posting the new Terms on
                this page and updating the "Last updated" date. Your continued
                use of the platform after such modifications constitutes your
                acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                13. Governing Law
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                These Terms shall be governed by and construed in accordance
                with the laws of Rwanda, without regard to its conflict of law
                provisions. Any disputes arising from these Terms or your use of
                the platform shall be subject to the exclusive jurisdiction of
                the courts of Rwanda.
              </p>
            </section>

            <section className="mb-8" style={{ color: "#000000" }}>
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                14. Contact Information
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: "#000000" }}>
                If you have any questions about these Terms and Conditions,
                please contact us at:
              </p>
              <div className=" p-4 rounded-lg">
                <p className="leading-relaxed" style={{ color: "#000000" }}>
                  <strong>Email:</strong> support@inspire.software
                  <br />
                  <strong>Website:</strong> https://inspire.software
                </p>
              </div>
            </section>

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                I Agree - Continue to Sign Up
              </Link>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-gray-300  text-gray-700 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Return to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
