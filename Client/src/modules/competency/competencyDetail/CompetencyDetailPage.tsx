/**
 * @fileoverview CompetencyDetailPage component for displaying detailed information
 * about SFIA and TPQI competency frameworks with interactive features.
 *
 * This component provides:
 * - Dynamic competency data fetching based on framework type
 * - Error handling and retry mechanisms
 * - Interactive actions (bookmark, favorite, share, etc.)
 * - Responsive design with animations
 * - Professional loading and error states
 *
 * @author Siriwat Chairak
 * @version 2.1.0
 * @since 2025-07-20
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useReducedMotion,
} from "framer-motion";
import Layout from "@Layouts/Layout";
import {
  useSfiaSkillDetail,
  useTpqiUnitDetail,
  useAnimationVariants,
  useCompetencyActions,
} from "./hooks";
import { useCompetencyDetailError } from "./hooks/competency/useCompetencyDetailError";
import { sanitizeUrlParams, isMalformedParam } from "@Utils/errorHandler";
import { SfiaLevel, SfiaCompetency } from "./types/sfia";
import { TpqiUnit } from "./types/tpqi";
import type { TpqiCompetency as TpqiCompetencyView } from "./components/tpqi/types";

import { getFrameworkIcon, getFrameworkColor } from "./utils/frameworkUtils";
import InvalidUrl from "./components/states/InvalidUrl";
import ErrorState from "./components/states/ErrorState";
import LoadingState from "./components/states/LoadingState";
import NoDataState from "./components/states/NoDataState";
import PageHeader from "./components/layouts/PageHeader";
import SfiaSection from "./components/sfia/SfiaSection";
import TpqiContainer from "./components/tpqi/TpqiContainer";
import PageFooter from "./components/layouts/PageFooter";
import FloatingTooltip from "./components/ui/FloatingTooltip";
import OptimizedBackgroundDecor from "./components/layouts/OptimizedBackgroundDecor";

/**
 * CompetencyDetailPage - A comprehensive detail page for competency frameworks
 *
 * This component handles the display of detailed competency information for both
 * SFIA (Skills Framework for the Information Age) and TPQI frameworks. It provides
 * a rich user interface with loading states, error handling, and interactive features.
 *
 * @component
 * @example
 * // Usage in routing
 * <Route path="/competency/:source/:id" component={CompetencyDetailPage} />
 *
 * // URL examples:
 * // /competency/sfia/123 - Display SFIA competency with ID 123
 * // /competency/tpqi/456 - Display TPQI unit with ID 456
 *
 * @returns {JSX.Element} The rendered competency detail page
 *
 * @throws {Error} When source parameter is not 'sfia' or 'tpqi'
 * @throws {Error} When id parameter is missing or invalid
 *
 * @see {@link useSfiaSkillDetail} For SFIA data fetching
 * @see {@link useTpqiUnitDetail} For TPQI data fetching
 * @see {@link useCompetencyActions} For interactive actions
 *
 * @public
 */

const CompetencyDetailPage: React.FC = () => {
  // Navigation and routing
  // React Router navigation function
  const navigate = useNavigate();

  /**
   * URL parameters extraction from the route
   * Includes validation and sanitization for malformed parameters
   * @type {{ source: "sfia" | "tpqi"; id: string }}
   */
  const { source, id } = useParams<{ source: "sfia" | "tpqi"; id: string }>();

  // Sanitize and validate URL parameters using utility functions
  // First check for known malformed patterns, then use original params if safe
  const sourceIsMalformed = source && isMalformedParam(source);
  const idIsMalformed = id && isMalformedParam(id);

  // Use original params if they're not malformed, otherwise try to sanitize
  const finalSource = sourceIsMalformed
    ? sanitizeUrlParams({ source }).source
    : source;
  const finalId = idIsMalformed ? sanitizeUrlParams({ id }).id : id;

  const isValidSource = finalSource === "sfia" || finalSource === "tpqi";
  const isValidId = finalId && finalId.length > 0 && finalId.length < 100; // Reasonable length limit

  // Use the final validated parameters
  const validatedSource = isValidSource ? finalSource : undefined;
  const validatedId = isValidId ? finalId : undefined;

  // Debug logging in development
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('URL Params Debug:', {
  //     original: { source, id },
  //     malformed: { sourceIsMalformed, idIsMalformed },
  //     final: { finalSource, finalId },
  //     valid: { isValidSource, isValidId },
  //     validated: { validatedSource, validatedId }
  //   });
  // }

  /**
   * Counter for tracking retry attempts when data fetching fails
   * @type {number}
   */
  const [retryCount, setRetryCount] = useState(0);

  // Animation variants for Framer Motion
  /**
   * Check if user prefers reduced motion for accessibility
   * @type {boolean}
   */
  const prefersReducedMotion = useReducedMotion();

  /**
   * Animation variants for Framer Motion components
   * Respects user's motion preferences for accessibility
   * @see {@link useAnimationVariants}
   */
  const { containerVariants, itemVariants } = useAnimationVariants();

  /**
   * Modified animation variants that respect reduced motion preferences
   * @type {object}
   */
  const accessibleContainerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : containerVariants;

  const accessibleItemVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : itemVariants;

  /**
   * Error management utility for competency detail operations
   * @see {@link useCompetencyDetailError}
   */
  const { addError, clearErrors } = useCompetencyDetailError();

  // Data fetching hooks with comfiguration
  /**
   * SFIA competency data fetching hook with caching and retry logic
   * Configuration:
   * - cacheDuration: 5 minutes (300,000 ms)
   * - maxRetries: 3 attempts
   * - autoRetryOnNetworkError: enabled
   *
   * @see {@link useSfiaSkillDetail}
   */
  const sfiaHook = useSfiaSkillDetail({
    cacheDuration: 5 * 60 * 1000,
    maxRetries: 3,
    autoRetryOnNetworkError: true,
  });

  /**
   * TPQI competency data fetching hooks with caching and retry logic
   * Configuration:
   * - cacheDuration: 5 minutes (300,000 ms)
   * - maxRetries: 3 attempts
   * - autoRetryOnNetworkError: enabled
   *
   * @see {@link useTpqiUnitDetail}
   */
  const tpqiHook = useTpqiUnitDetail({
    cacheDuration: 5 * 60 * 1000,
    maxRetries: 3,
    autoRetryOnNetworkError: true,
  });

  /**
   * Selects the appropriate data fetching hook based on the framework source
   * This allows for polymorphic behavior while maintaining type safety
   *
   * @type { typeof sfiaHook | typeof tpqiHook }
   */
  const currentHook = validatedSource === "sfia" ? sfiaHook : tpqiHook;

  /**
   * Destructures loading state, error, last fetched time, and reset function
   * from the currently selected data fetching hook
   *
   * @type { boolean } loading - Indicates if data is being fetched
   * @type { Error | null } error - Error object if fetching failed
   * @type { Date | null } lastFetched - Timestamp of the last successful fetch
   * @type { Function } resetState - Function to reset the hook state
   */
  const { loading, error, lastFetched, resetState } = currentHook;

  /**
   * Memoized competency data retrieval with type-safe framework switching
   *
   * This memoization prevents unnecessary re-renders when dependencies haven't changed.
   * The data structure varies between SFIA and TPQI frameworks:
   * - SFIA: Contains skill details with competency information
   * - TPQI: Contains unit-code details with competency information
   *
   * @return { object | null } The competency data object or null if not available
   * @memoized Recalculates only when `validatedSource`, `sfiaHook.skillDetail`, or `tpqiHook.unitDetail` change
   */
  const competencyData = useMemo(() => {
    if (validatedSource === "sfia") {
      return sfiaHook.skillDetail;
    } else if (validatedSource === "tpqi") {
      return tpqiHook.unitDetail;
    }
    return null;
  }, [validatedSource, sfiaHook.skillDetail, tpqiHook.unitDetail]);

  /**
   * Memoized competency title based on the framework source
   *
   * This ensures the title is dynamically generated based on the competency data
   * or defaults to a generic title if not available.
   *
   * @return { string } The competency title for display in the header
   * @memoized Recalculates only when `competencyData` or `validatedSource` changes
   */
  const competencyTitle = useMemo(
    () =>
      competencyData?.competency?.competency_name ??
      `${validatedSource?.toUpperCase()} Competency`,
    [competencyData?.competency?.competency_name, validatedSource]
  );

  /**
   * Memoized quick navigation items based on the framework source
   *
   * This provides a dynamic list of navigation links for quick access to different sections
   * of the competency detail page, tailored to the specific framework.
   *
   * @return { Array<{ label: string; href: string }> } The list of quick navigation items
   * @memoized Recalculates only when `validatedSource` changes
   */
  const quickNavItems = useMemo(() => {
    if (validatedSource === "sfia") {
      return [
        { label: "Overview", href: "#overview" },
        { label: "Skill Levels", href: "#skills" },
      ];
    } else if (validatedSource === "tpqi") {
      return [
        { label: "Skills", href: "#skills" },
        { label: "Knowledge", href: "#knowledge" },
        { label: "Occupational", href: "#occupational" },
      ];
    }
    return [];
  }, [validatedSource]);

  /**
   * Memoized framework icon and color retrieval functions
   *
   * These functions provide the appropriate icon and color for the competency framework
   * based on the source type, ensuring consistent UI representation.
   *
   * @return { Function } Function to get the framework icon
   * @return { Function } Function to get the framework color
   */
  const {
    isBookmarked,
    isFavorited,
    showTooltip,
    setShowTooltip,
    handleBookmark,
    handleFavorite,
    handleShare,
    handlePrint,
    handleDownload,
  } = useCompetencyActions(validatedSource, validatedId, competencyTitle);

  /**
   * Effect hook to fetch competency data when the component mounts
   * or when the source or id parameters change.
   * This ensures that the correct data is fetched based on the URL parameters.
   * @param {Array} dependencies - The effect runs when any of these change:
   *   - validatedSource: The framework type ('sfia' or 'tpqi')
   *   - validatedId: The unique identifier for the competency
   *   - retryCount: Incremented on retry attempts to refetch data
   *   - sfiaHook: The SFIA data fetching hook
   *   - tpqiHook: The TPQI data fetching hook
   * @memoized Recalculates only when dependencies change
   */
  useEffect(() => {
    if (validatedSource && validatedId && isValidSource && isValidId) {
      if (validatedSource === "sfia") {
        sfiaHook.fetchSkillDetail(validatedId);
      } else if (validatedSource === "tpqi") {
        tpqiHook.fetchUnitDetail(validatedId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedSource, validatedId, retryCount]);

  /**
   * Effect hook to handle errors by adding them to the error state
   * This ensures that any errors encountered during data fetching are logged
   * and can be displayed to the user.
   *
   * @param {Error | string} error - The error object or message to log
   * @param {string} validatedSource - The source of the competency ('sfia' or 'tpqi')
   */
  useEffect(() => {
    if (error) {
      addError({
        name: "CompetencyDetailError",
        message:
          typeof error === "string" ? error : "Failed to fetch competency data",
        source: validatedSource ?? "unknown",
      });
    }
  }, [error, addError, validatedSource]);

  /**
   * Handles retry functionality for failed competency data fetching operations.
   *
   * This callback function is triggered when the user attempts to retry a failed data fetch operation.
   * It performs a complete reset of the component state and attemps to refetch the competency data
   * based on the current source type.
   *
   * @async
   * @function handleRetry
   *
   * @description
   * The retry process follow these steps:
   * 1. Validates that both `validatedSource` and `validatedId` are defined.
   * 2. Increments the `retryCount` state to trigger a refetch.
   * 3. Clears any existing errors to reset the error state.
   * 4. Resets the component state to its initial values.
   * 5. Attempts to refetch the competency data using the appropriate hook based on the `validatedSource`.
   * 6. Logs any errors encountered during the retry attempt.
   *
   * @param { void } - This function does not take any parameters.
   * @returns { Promise<void> } - A promise that resolves when the retry operation is successful.
   *
   * @throws { Error } - If the retry operation fails, an error is logged to the console.
   */
  const handleRetry = useCallback(async () => {
    if (!validatedSource || !validatedId) return;

    setRetryCount((prev) => prev + 1);
    clearErrors();
    resetState();
    try {
      if (validatedSource === "sfia") {
        await sfiaHook.fetchSkillDetail(validatedId);
      } else {
        await tpqiHook.fetchUnitDetail(validatedId);
      }
    } catch (err) {
      console.error("Retry failed:", err);
    }
  }, [
    clearErrors,
    resetState,
    validatedSource,
    validatedId,
    sfiaHook,
    tpqiHook,
  ]);

  // Validate URL parameters
  if (!isValidSource || !isValidId) {
    return (
      <Layout>
        <InvalidUrl onGoHome={() => navigate("/home")} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 pt-20 overflow-hidden relative">
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
                  <LoadingState
                    source={validatedSource as "sfia" | "tpqi"}
                    id={validatedId || ""}
                  />
                </motion.div>
              )}

              {!loading && error && (
                <ErrorState
                  error={
                    typeof error === "string"
                      ? error
                      : error?.message || "An unknown error occurred"
                  }
                  source={validatedSource as "sfia" | "tpqi"}
                  id={validatedId || ""}
                  retryCount={retryCount}
                  onRetry={handleRetry}
                  onGoBack={() => navigate(-1)}
                />
              )}

              {!loading && !error && competencyData && (
                <motion.div
                  key="success"
                  variants={accessibleContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {validatedSource === "sfia" && (
                    <PageHeader
                      source="sfia"
                      id={validatedId || ""}
                      competencyTitle={competencyTitle}
                      lastFetched={lastFetched || undefined}
                      quickNavItems={quickNavItems}
                      competencyData={
                        "competency" in competencyData &&
                        competencyData.competency &&
                        "category" in competencyData.competency &&
                        "levels" in competencyData.competency
                          ? (competencyData.competency.levels as SfiaLevel[])
                          : []
                      }
                      isBookmarked={isBookmarked}
                      isFavorited={isFavorited}
                      onBack={() => navigate(-1)}
                      onBookmark={handleBookmark}
                      onFavorite={handleFavorite}
                      onShare={handleShare}
                      onPrint={handlePrint}
                      onDownload={handleDownload}
                      onTooltip={setShowTooltip}
                      getFrameworkIcon={getFrameworkIcon}
                      getFrameworkColor={getFrameworkColor}
                      itemVariants={accessibleItemVariants}
                    />
                  )}
                  {validatedSource === "tpqi" && (
                    <PageHeader
                      source="tpqi"
                      id={validatedId || ""}
                      competencyTitle={competencyTitle}
                      lastFetched={lastFetched || undefined}
                      quickNavItems={quickNavItems}
                      competencyData={
                        validatedSource === "tpqi" &&
                        Array.isArray(competencyData)
                          ? (competencyData.map((item) => ({
                              id: item.id, // Ensure the id property is included
                              unit_code: item.unit_code,
                              unit_name: item.unit_name,
                              skills: item.skills || [],
                              knowledge: item.knowledge || [],
                              occupational: item.occupational || [],
                            })) as TpqiUnit[])
                          : []
                      }
                      isBookmarked={isBookmarked}
                      isFavorited={isFavorited}
                      onBack={() => navigate(-1)}
                      onBookmark={handleBookmark}
                      onFavorite={handleFavorite}
                      onShare={handleShare}
                      onPrint={handlePrint}
                      onDownload={handleDownload}
                      onTooltip={setShowTooltip}
                      getFrameworkIcon={getFrameworkIcon}
                      getFrameworkColor={getFrameworkColor}
                      itemVariants={accessibleItemVariants}
                    />
                  )}

                  {/* Content Section */}
                  <motion.div variants={itemVariants} className="space-y-8">
                    {validatedSource === "sfia" &&
                      competencyData?.competency &&
                      "category" in competencyData.competency &&
                      "levels" in competencyData.competency && (
                        <SfiaSection
                          competency={
                            competencyData.competency as SfiaCompetency
                          }
                        />
                      )}
                    {validatedSource === "tpqi" &&
                      competencyData?.competency &&
                      "occupational" in competencyData.competency &&
                      "skills" in competencyData.competency && (
                        <TpqiContainer
                          competency={
                            competencyData.competency as TpqiCompetencyView
                          }
                        />
                      )}
                  </motion.div>

                  <PageFooter
                    source={validatedSource as "sfia" | "tpqi"}
                    lastFetched={lastFetched || undefined}
                    itemVariants={itemVariants}
                  />
                </motion.div>
              )}

              {!loading && !error && !competencyData && lastFetched && (
                <NoDataState
                  source={validatedSource || ""}
                  id={validatedId || ""}
                  onGoBack={() => navigate(-1)}
                />
              )}
            </AnimatePresence>
          </LazyMotion>
        </div>

        <FloatingTooltip showTooltip={showTooltip} />
      </div>
    </Layout>
  );
};

export default CompetencyDetailPage;
