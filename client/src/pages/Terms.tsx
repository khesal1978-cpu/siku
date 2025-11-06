import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#10221a] pb-24">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <header className="sticky top-0 z-20 flex items-center bg-[#f6f8f7]/80 dark:bg-[#10221a]/80 p-4 pb-2 backdrop-blur-sm">
          <Link href="/profile" data-testid="link-back">
            <button className="flex items-center justify-center w-12 h-12 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors" data-testid="button-back">
              <ArrowLeft className="w-6 h-6 text-[#111815] dark:text-[#e0e2e1]" />
            </button>
          </Link>
          <h2 className="flex-1 pr-12 text-center text-lg font-bold text-[#111815] dark:text-[#e0e2e1]">Terms & Privacy</h2>
        </header>

        <main className="px-4">
          <h1 className="text-[#111815] dark:text-[#e0e2e1] pt-6 pb-3 text-left text-3xl font-bold">Terms of Service & Privacy Policy</h1>
          <p className="text-[#618979] dark:text-[#a0a3a1] pt-1 pb-3 text-sm font-normal">Last Updated: October 26, 2023</p>
          
          <p className="text-[#111815] dark:text-[#e0e2e1] pt-1 pb-6 text-base leading-relaxed">
            Welcome to PingCaset. This document outlines the terms you agree to when you use our services, and how we handle your data. Please read it carefully. By accessing or using our mobile application, you agree to be bound by these Terms of Service and our Privacy Policy.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-[#111815] dark:text-[#e0e2e1] pt-5 pb-3 text-left text-2xl font-bold">1. Acceptance of Terms</h2>
              <p className="text-[#111815] dark:text-[#e0e2e1] pt-1 pb-3 text-base leading-relaxed">
                By creating an account and using the PingCaset application, you confirm that you have read, understood, and agree to be bound by these terms. If you do not agree with any part of these terms, you must not use our services. We may update these terms from time to time, and will notify you of any significant changes.
              </p>
            </div>

            <div>
              <h2 className="text-[#111815] dark:text-[#e0e2e1] pt-5 pb-3 text-left text-2xl font-bold">2. User Accounts & Responsibilities</h2>
              <p className="text-[#111815] dark:text-[#e0e2e1] pt-1 pb-3 text-base leading-relaxed">
                You are responsible for maintaining the confidentiality of your account information, including your password. You are also responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h2 className="text-[#111815] dark:text-[#e0e2e1] pt-5 pb-3 text-left text-2xl font-bold">3. Privacy Policy</h2>
              <p className="text-[#111815] dark:text-[#e0e2e1] pt-1 pb-3 text-base leading-relaxed">
                Our Privacy Policy, which is part of these Terms, describes how we collect, use, and protect your personal information. We are committed to protecting your privacy and handling your data in an open and transparent manner.
              </p>
            </div>

            <div>
              <h2 className="text-[#111815] dark:text-[#e0e2e1] pt-5 pb-3 text-left text-2xl font-bold">4. Information We Collect</h2>
              <div className="space-y-4 text-base leading-relaxed text-[#111815] dark:text-[#e0e2e1]">
                <p>We may collect the following types of information:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li><strong>Personal Information:</strong> Name, email address, and wallet addresses you provide when you register and use the service.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our app, such as device information, IP address, and mining activity logs.</li>
                  <li><strong>Transaction Data:</strong> Details about mining rewards and transfers conducted through the platform.</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[#111815] dark:text-[#e0e2e1] pt-5 pb-3 text-left text-2xl font-bold">5. How We Use Your Information</h2>
              <p className="text-[#111815] dark:text-[#e0e2e1] pt-1 pb-3 text-base leading-relaxed">
                Your information is used to operate, maintain, and improve our services. This includes processing transactions, providing customer support, communicating with you, and ensuring the security of our platform. We do not sell your personal data to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-[#111815] dark:text-[#e0e2e1] pt-5 pb-3 text-left text-2xl font-bold">6. Data Security</h2>
              <p className="text-[#111815] dark:text-[#e0e2e1] pt-1 pb-3 text-base leading-relaxed">
                We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-[#111815] dark:text-[#e0e2e1] pt-5 pb-3 text-left text-2xl font-bold">7. Contact Information</h2>
              <p className="text-[#111815] dark:text-[#e0e2e1] pt-1 pb-3 text-base leading-relaxed">
                If you have any questions about these Terms or our Privacy Policy, please contact us at support@pingcaset.com.
              </p>
            </div>
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
