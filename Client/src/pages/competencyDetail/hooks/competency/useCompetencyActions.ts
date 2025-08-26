import { useCallback, useState, useEffect } from "react";

export const useCompetencyActions = (source?: string, id?: string, competencyTitle?: string) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Load bookmarked and favorited state from localStorage
  useEffect(() => {
    if (source && id) {
      const competencyKey = `${source}-${id}`;
      const bookmarks = JSON.parse(localStorage.getItem("competency-bookmarks") ?? "[]");
      const favorites = JSON.parse(localStorage.getItem("competency-favorites") ?? "[]");

      setIsBookmarked(bookmarks.includes(competencyKey));
      setIsFavorited(favorites.includes(competencyKey));
    }
  }, [source, id]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => {
      const newValue = !prev;
      const bookmarks = JSON.parse(localStorage.getItem("competency-bookmarks") ?? "[]");
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

      localStorage.setItem("competency-bookmarks", JSON.stringify(bookmarks));
      return newValue;
    });
  }, [source, id]);

  const handleFavorite = useCallback(() => {
    setIsFavorited((prev) => {
      const newValue = !prev;
      const favorites = JSON.parse(localStorage.getItem("competency-favorites") ?? "[]");
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

      localStorage.setItem("competency-favorites", JSON.stringify(favorites));
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
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      setShowTooltip("URL copied to clipboard!");
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
          <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
        </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${source}-${id}-competency.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowTooltip("Downloaded successfully!");
    setTimeout(() => setShowTooltip(null), 2000);
  }, [competencyTitle, source, id]);

  return {
    isBookmarked,
    isFavorited,
    showTooltip,
    setShowTooltip,
    handleBookmark,
    handleFavorite,
    handleShare,
    handlePrint,
    handleDownload,
  };
};
