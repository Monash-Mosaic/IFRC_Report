import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Home() {
  const t = useTranslations('Home');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/globe.svg"
                alt="IFRC Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-gray-900">IFRC Reports</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/documents"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Documents
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <Image
              src="/globe.svg"
              alt="IFRC Globe"
              width={120}
              height={120}
              className="mx-auto mb-6 opacity-80"
            />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              IFRC Report System
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Comprehensive document management and reporting platform for the International Federation of Red Cross and Red Crescent Societies. 
              Access, analyze, and collaborate on humanitarian reports and publications.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/documents"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/file.svg"
                alt="Documents icon"
                width={24}
                height={24}
              />
              Browse Documents
            </Link>
            <Link
              href="/documents"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Upload Reports
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/file.svg"
                  alt="Document icon"
                  width={24}
                  height={24}
                  className="text-blue-600"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Management</h3>
              <p className="text-gray-600">Organize and categorize reports with advanced filtering and search capabilities.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/globe.svg"
                  alt="Global icon"
                  width={24}
                  height={24}
                  className="text-green-600"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Access</h3>
              <p className="text-gray-600">Access humanitarian reports and publications from anywhere in the world.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/window.svg"
                  alt="Analytics icon"
                  width={24}
                  height={24}
                  className="text-purple-600"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">Analyze trends and insights from comprehensive humanitarian data.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 IFRC Report System. All rights reserved.</p>
            <p className="mt-2 text-sm">International Federation of Red Cross and Red Crescent Societies</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
