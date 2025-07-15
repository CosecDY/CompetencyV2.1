import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import Layout from "@Layouts/Layout";
import { 
  FaCode, 
  FaGraduationCap, 
  FaTools, 
  FaClock,
  FaBookmark,
  FaShare,
  FaPrint,
  FaDownload,
  FaHeart,
  FaRegHeart,
  FaChevronRight,
  FaInfoCircle,
} from "react-icons/fa";
import { 
  useSfiaSkillDetail, 
  useTpqiUnitDetail 
} from './hooks/useCompetencyDetail';
import { useCompetencyDetailError } from './hooks/useCompetencyDetailError';
import InvalidUrl from "./components/InvalidUrl";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import NoDataState from "./components/NoDataState";
import BackButton from "./components/BackButton";
import FrameworkBadge from "./components/FrameworkBadge";
import StatsCard from "./components/StatsCard";
import SfiaSection from "./components/SfiaSection";
import TpqiSection from "./components/TpqiSection";
import CacheInfo from "./components/CacheInfo";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
      ease: [0.25, 0.46, 0.45, 0.94], // Optimized easing
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Optimized button animation variants
const buttonVariants = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeInOut" }
  }
};

// Memoized particle positions to avoid recalculation on each render
const PARTICLE_POSITIONS = Array.from({ length: 6 }, (_, i) => ({
  id: `particle-${i}`,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 3 + Math.random() * 2,
}));

// Optimized action button component
const ActionButton = React.memo<{
  onClick: () => void;
  icon: React.ReactNode;
  isActive?: boolean;
  activeColors: string;
  inactiveColors: string;
  tooltipKey: string;
  onTooltip: (key: string | null) => void;
}>(({ onClick, icon, isActive, activeColors, inactiveColors, tooltipKey, onTooltip }) => (
  <motion.button
    onClick={onClick}
    className={`p-3 rounded-xl border transition-all duration-200 ${
      isActive ? activeColors : inactiveColors
    }`}
    variants={buttonVariants}
    whileHover="hover"
    whileTap="tap"
    onMouseEnter={() => onTooltip(tooltipKey)}
    onMouseLeave={() => onTooltip(null)}
  >
    {icon}
  </motion.button>
));

ActionButton.displayName = 'ActionButton';

// Optimized background decoration using CSS animations for better performance
const OptimizedBackgroundDecor = React.memo(() => (
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
    {/* Simplified gradient orbs using CSS animations for better performance */}
    <div 
      className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200 via-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" 
      style={{ 
        animationDuration: '8s'
      }} 
    />
    <div 
      className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-200 via-teal-200 to-cyan-200 rounded-full blur-3xl opacity-30 animate-bounce" 
      style={{ 
        animationDuration: '10s'
      }} 
    />
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 rounded-full blur-3xl opacity-20 animate-spin" 
      style={{ 
        animationDuration: '15s'
      }} 
    />
    
    {/* Reduced particles for better performance */}
    {PARTICLE_POSITIONS.slice(0, 4).map(({ id, left, top, delay, duration }) => (
      <motion.div
        key={id}
        className="absolute w-2 h-2 bg-white rounded-full opacity-20"
        style={{ 
          left: `${left}%`, 
          top: `${top}%`
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration,
          repeat: Infinity,
          delay,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
));

OptimizedBackgroundDecor.displayName = 'OptimizedBackgroundDecor';

// Helper functions (memoized outside component)
const getFrameworkIcon = (framework: string) => {
  switch (framework.toLowerCase()) {
    case 'sfia':
      return <FaCode className="w-5 h-5" />;
    case 'tpqi':
      return <FaGraduationCap className="w-5 h-5" />;
    default:
      return <FaTools className="w-5 h-5" />;
  }
};
const getFrameworkColor = (framework: string) => {
  switch (framework.toLowerCase()) {
    case 'sfia':
      return 'from-blue-500 to-blue-600';
    case 'tpqi':
      return 'from-green-500 to-green-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const CompetencyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { source, id } = useParams<{ source: 'sfia' | 'tpqi'; id: string }>();
  const [retryCount, setRetryCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Error handling hook (must be called before any conditional returns)
  const {
    addError,
    clearErrors
  } = useCompetencyDetailError();

  // Specialized hooks based on source (must be called before any conditional returns)
  const sfiaHook = useSfiaSkillDetail({
    cacheDuration: 5 * 60 * 1000,
    maxRetries: 3,
    autoRetryOnNetworkError: true,
  });

  const tpqiHook = useTpqiUnitDetail({
    cacheDuration: 5 * 60 * 1000,
    maxRetries: 3,
    autoRetryOnNetworkError: true,
  });

  // Select the appropriate hook based on source
  const currentHook = source === 'sfia' ? sfiaHook : tpqiHook;
  const { loading, error, lastFetched, resetState } = currentHook;

  // Get competency data with memoization
  const competencyData = useMemo(() => {
    if (source === 'sfia') {
      return sfiaHook.jobDetail;
    } else if (source === 'tpqi') {
      return tpqiHook.unitDetail;
    }
    return null;
  }, [source, sfiaHook.jobDetail, tpqiHook.unitDetail]);

  // Memoized title to avoid recalculation
  const competencyTitle = useMemo(() => 
    competencyData?.competency?.competency_name ?? `${source?.toUpperCase()} Competency`,
    [competencyData?.competency?.competency_name, source]
  );

  // Memoized quick navigation items
  const quickNavItems = useMemo(() => {
    if (source === 'sfia') {
      return [
        { label: 'Overview', href: '#overview' },
        { label: 'Skill Levels', href: '#skills' },
      ];
    } else if (source === 'tpqi') {
      return [
        { label: 'Skills', href: '#skills' },
        { label: 'Knowledge', href: '#knowledge' },
        { label: 'Occupational', href: '#occupational' },
      ];
    }
    return [];
  }, [source]);

  // Fetch data when component mounts or parameters change
  useEffect(() => {
    if (source && id) {
      if (source === 'sfia') {
        sfiaHook.fetchJobDetail(id);
      } else if (source === 'tpqi') {
        tpqiHook.fetchUnitDetail(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, id, retryCount]); // removed sfiaHook, tpqiHook from deps to avoid unnecessary reruns

  // Error tracking
  useEffect(() => {
    if (error) {
      addError({
        message: typeof error === 'string' ? error : 'Failed to fetch competency data',
        source: source ?? 'unknown'
      });
    }
  }, [error, addError, source]);

  // Load bookmarked and favorited state from localStorage
  useEffect(() => {
    if (source && id) {
      const competencyKey = `${source}-${id}`;
      const bookmarks = JSON.parse(localStorage.getItem('competency-bookmarks') ?? '[]');
      const favorites = JSON.parse(localStorage.getItem('competency-favorites') ?? '[]');
      
      setIsBookmarked(bookmarks.includes(competencyKey));
      setIsFavorited(favorites.includes(competencyKey));
    }
  }, [source, id]);

  // --- Move hooks above early return ---
  const handleRetry = useCallback(async () => {
    if (!source || !id) return;
    
    setRetryCount(prev => prev + 1);
    clearErrors();
    resetState();
    try {
      if (source === 'sfia') {
        await sfiaHook.fetchJobDetail(id);
      } else {
        await tpqiHook.fetchUnitDetail(id);
      }
    } catch (err) {
      console.error('Retry failed:', err);
    }
  }, [clearErrors, resetState, source, id, sfiaHook, tpqiHook]);

  // User-friendly action handlers
  const handleBookmark = useCallback(() => {
    setIsBookmarked(prev => {
      const newValue = !prev;
      const bookmarks = JSON.parse(localStorage.getItem('competency-bookmarks') ?? '[]');
      const competencyKey = `${source}-${id}`;
      
      if (newValue) {
        if (!bookmarks.includes(competencyKey)) {
          bookmarks.push(competencyKey);
        }
      } else {
        const index = bookmarks.indexOf(competencyKey);
        if (index > -1) {
          bookmarks.splice(index, 1);
        }
      }
      
      localStorage.setItem('competency-bookmarks', JSON.stringify(bookmarks));
      return newValue;
    });
  }, [source, id]);

  const handleFavorite = useCallback(() => {
    setIsFavorited(prev => {
      const newValue = !prev;
      const favorites = JSON.parse(localStorage.getItem('competency-favorites') ?? '[]');
      const competencyKey = `${source}-${id}`;
      
      if (newValue) {
        if (!favorites.includes(competencyKey)) {
          favorites.push(competencyKey);
        }
      } else {
        const index = favorites.indexOf(competencyKey);
        if (index > -1) {
          favorites.splice(index, 1);
        }
      }
      
      localStorage.setItem('competency-favorites', JSON.stringify(favorites));
      return newValue;
    });
  }, [source, id]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: competencyTitle,
          text: `Check out this competency: ${competencyTitle}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      setShowTooltip('URL copied to clipboard!');
      setTimeout(() => setShowTooltip(null), 2000);
    }
  }, [competencyTitle]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    // Simple implementation: create a printable version
    const printContent = `
      <html>
        <head>
          <title>${competencyTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0f766e; }
            .section { margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>${competencyTitle}</h1>
          <p><strong>Code:</strong> ${id}</p>
          <p><strong>Framework:</strong> ${source?.toUpperCase()}</p>
          ${competencyData?.competency?.overall ? `<div class="section"><h2>Overview</h2><p>${competencyData.competency.overall}</p></div>` : ''}
          <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
        </body>
      </html>
    `;
    
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${source}-${id}-competency.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowTooltip('Downloaded successfully!');
    setTimeout(() => setShowTooltip(null), 2000);
  }, [competencyTitle, source, id, competencyData?.competency?.overall]);
  // --- End move ---

  // Validate URL parameters (after all hooks have been called)
  if (!source || !id || (source !== 'sfia' && source !== 'tpqi')) {
    return (
      <Layout>
        <InvalidUrl onGoHome={() => navigate('/home')} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white via-purple-50 to-teal-50 pt-20 overflow-hidden relative">
        <OptimizedBackgroundDecor />
        <div className="relative z-10 px-4 pb-16 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-96"
                >
                  <LoadingState source={source} id={id} />
                </motion.div>
              )}
              {!loading && error && (
                <ErrorState
                  error={error}
                  source={source}
                  id={id}
                  retryCount={retryCount}
                  onRetry={handleRetry}
                  onGoBack={() => navigate(-1)}
                />
              )}
              {!loading && !error && competencyData && (
                <motion.div
                  key="success"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {/* Enhanced Header with Actions */}
                  <motion.header variants={itemVariants} className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <BackButton onClick={() => navigate(-1)} />
                      
                      {/* Optimized Action Buttons */}
                      <div className="flex items-center gap-2">
                        <ActionButton
                          onClick={handleBookmark}
                          icon={<FaBookmark className="w-4 h-4" />}
                          isActive={isBookmarked}
                          activeColors="bg-yellow-100 border-yellow-300 text-yellow-600"
                          inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-yellow-50"
                          tooltipKey="bookmark"
                          onTooltip={setShowTooltip}
                        />

                        <ActionButton
                          onClick={handleFavorite}
                          icon={isFavorited ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
                          isActive={isFavorited}
                          activeColors="bg-red-100 border-red-300 text-red-600"
                          inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-red-50"
                          tooltipKey="favorite"
                          onTooltip={setShowTooltip}
                        />

                        <ActionButton
                          onClick={handleShare}
                          icon={<FaShare className="w-4 h-4" />}
                          activeColors=""
                          inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-blue-50"
                          tooltipKey="share"
                          onTooltip={setShowTooltip}
                        />

                        <ActionButton
                          onClick={handlePrint}
                          icon={<FaPrint className="w-4 h-4" />}
                          activeColors=""
                          inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-green-50"
                          tooltipKey="print"
                          onTooltip={setShowTooltip}
                        />

                        <ActionButton
                          onClick={handleDownload}
                          icon={<FaDownload className="w-4 h-4" />}
                          activeColors=""
                          inactiveColors="bg-white/80 border-gray-200 text-gray-600 hover:bg-purple-50"
                          tooltipKey="download"
                          onTooltip={setShowTooltip}
                        />
                      </div>
                    </div>

                    {/* Enhanced Title Section */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <FrameworkBadge framework={source} getFrameworkIcon={getFrameworkIcon} getFrameworkColor={getFrameworkColor} />
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
                          {competencyTitle}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                            <FaInfoCircle className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium text-gray-700">Code:</span>
                            <span className="ml-1 font-mono text-blue-600">{id}</span>
                          </div>
                          
                          {lastFetched && (
                            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                              <FaClock className="w-4 h-4 mr-2 text-green-600" />
                              <span className="text-sm text-gray-600">
                                Updated: {lastFetched.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Optimized Quick Navigation */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {quickNavItems.map((item) => (
                            <button 
                              key={item.label}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                                source === 'sfia' 
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              <span>{item.label}</span>
                              <FaChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Enhanced Stats Card */}
                      <motion.div 
                        variants={itemVariants}
                        className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 shadow-xl lg:min-w-80"
                      >
                        <StatsCard source={source} competencyData={competencyData} />
                      </motion.div>
                    </div>
                  </motion.header>
                  {/* Enhanced Content Section */}
                  <motion.div variants={itemVariants} className="space-y-8">
                    {source === 'sfia' && 'competency' in competencyData && competencyData.competency && (
                      <SfiaSection competency={competencyData.competency} />
                    )}
                    {source === 'tpqi' && 'competency' in competencyData && competencyData.competency && (
                      <TpqiSection competency={competencyData.competency} />
                    )}
                  </motion.div>

                  {/* Enhanced Footer */}
                  <motion.footer variants={itemVariants} className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {lastFetched && <CacheInfo lastFetched={lastFetched} />}
                      
                      {/* Helpful Links */}
                      <div className="flex items-center gap-4">
                        <a 
                          href={`/${source}`}
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          Browse more {source?.toUpperCase()} competencies
                          <FaChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </motion.footer>

                  {/* Optimized Floating Tooltip */}
                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none"
                      >
                        {showTooltip === 'bookmark' && 'Bookmark this competency'}
                        {showTooltip === 'favorite' && 'Add to favorites'}
                        {showTooltip === 'share' && 'Share this competency'}
                        {showTooltip === 'print' && 'Print this page'}
                        {showTooltip === 'download' && 'Download as PDF'}
                        {showTooltip && !['bookmark', 'favorite', 'share', 'print', 'download'].includes(showTooltip) && showTooltip}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {!loading && !error && !competencyData && (
                <NoDataState source={source} id={id} onGoBack={() => navigate(-1)} />
              )}
            </AnimatePresence>
          </LazyMotion>
        </div>
      </div>
    </Layout>
  );
};

export default CompetencyDetailPage;
