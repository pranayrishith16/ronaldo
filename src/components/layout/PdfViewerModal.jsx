import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { closeViewer } from "../../store/slices/documentSlice";
import { getValidToken } from "../../utils/streamingHelper";

const PdfViewerModal = () => {
  const dispatch = useDispatch();

  const { isViewerOpen, documentUrl, fileName } = useSelector(
    (state) => state.documents
  );

  const [blobUrl, setBlobUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (!isViewerOpen || !documentUrl) return;

      setLoading(true);
      setError(null);

      try {
        const token = await getValidToken();

        if (!token) {
          throw new Error("No authentication token available");
        }

        console.log("[PDF-MODAL] Fetching PDF with Authorization header...");

        // ✅ SECURE: Make fetch request with Authorization header
        // Backend uses @Depends(verify_jwt_token) to verify it
        const backendHost = "https://www.veritlyai.com";
        const fullUrl = documentUrl.startsWith("https")
          ? documentUrl
          : `${backendHost}${documentUrl}`;

        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token in header (secure)
            Accept: "application/pdf",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log("[PDF-MODAL] PDF fetched successfully");

        // ✅ Convert response to blob
        const pdfBlob = await response.blob();

        // ✅ Create object URL for iframe
        const objectUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(objectUrl);

        console.log("[PDF-MODAL] Blob URL created for iframe");
      } catch (err) {
        console.error("[PDF-MODAL] Error loading PDF:", err);
        setError(err.message || "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isViewerOpen, documentUrl]);

  if (!isViewerOpen || !documentUrl) {
    return null;
  }

  const handleClose = () => {
    console.log("[PDF-MODAL] Closing viewer");
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    setBlobUrl(null);
    dispatch(closeViewer());
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-50">
      <div className="flex flex-col h-full m-4 bg-slate-900 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-800 border-b border-slate-700">
          <h3 className="text-white font-semibold truncate max-w-md">
            {fileName || "Document"}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-slate-950 rounded-b-lg relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950 bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-sm">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
              <div className="text-center p-4">
                <p className="text-red-400 text-sm mb-2">Error loading PDF:</p>
                <p className="text-slate-300 text-xs">{error}</p>
              </div>
            </div>
          )}

          {blobUrl && !loading && !error && (
            <iframe
              src={blobUrl}
              className="w-full h-full border-none"
              title={`PDF - ${fileName}`}
              onLoad={() => console.log("[PDF-MODAL] PDF displayed ✓")}
              onError={() => console.error("[PDF-MODAL] iframe error")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
