const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-teal-800 to-teal-900 text-white text-sm w-full py-8 mt-auto border-t border-teal-700">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mb-6">
          {/* Left: Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-teal-600 font-bold text-xl">C</span>
            </div>
            <div>
              <div className="text-xl font-bold text-white">Competency</div>
              <div className="text-teal-200 text-xs">Database System</div>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-center">
            <a
              href="/about"
              className="text-teal-200 hover:text-white transition-colors duration-300 hover:underline decoration-2 underline-offset-4"
            >
              About
            </a>
            <a
              href="/reference"
              className="text-teal-200 hover:text-white transition-colors duration-300 hover:underline decoration-2 underline-offset-4"
            >
              Reference
            </a>
            <a
              href="https://www.tpqi.go.th/th/standard/rQNWewEb3Q"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-200 hover:text-white transition-colors duration-300 hover:underline decoration-2 underline-offset-4 flex items-center gap-1"
            >
              TPQI Standard
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://sfia-online.org/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-200 hover:text-white transition-colors duration-300 hover:underline decoration-2 underline-offset-4 flex items-center gap-1"
            >
              SFIA Online
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-600 to-transparent mb-6"></div>

        {/* Bottom Row: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-teal-200 text-center md:text-left">
            <a
              href="https://ecpe.nu.ac.th"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300 hover:underline decoration-2 underline-offset-4"
            >
              © {currentYear} Department of Electrical and Computer Engineering
            </a>
            <div className="text-xs text-teal-300 mt-1">
              Faculty of Engineering, Naresuan University
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-4 text-teal-300">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 5a1 1 0 112 0v3.691l1.802 1.802a1 1 0 11-1.414 1.414l-2.293-2.293A1 1 0 019 8.586V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">Version 2.0</span>
            </div>
            <div className="text-xs">Built with React</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
