import { useState, useCallback } from "react";
import { CompetencyService, CompetencySearchResult, CompetencyDetail, SaveEvidenceRequest } from "../services/competencyService";

const service = new CompetencyService();

export function useCompetency() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // -----------------------------------------------------
  // 1. Hook สำหรับค้นหา (Search)
  // -----------------------------------------------------
  const searchCompetency = useCallback(async (keyword: string): Promise<CompetencySearchResult[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.search(keyword);
      return result;
    } catch (err: any) {
      console.error("[useCompetency] Search Error:", err);
      setError("เกิดข้อผิดพลาดในการค้นหาข้อมูล กรุณาลองใหม่อีกครั้ง");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------
  // 2. Hook สำหรับดึงรายละเอียด (Get Detail)
  // -----------------------------------------------------
  const getCompetencyDetail = useCallback(async (source: "TPQI" | "SFIA", id: string | number, level: number): Promise<CompetencyDetail | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getDetail(source, id, level);
      return result;
    } catch (err: any) {
      console.error("[useCompetency] Detail Error:", err);
      setError("ไม่สามารถโหลดรายละเอียดข้อมูลได้");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------
  // 3. Hook สำหรับบันทึกหลักฐาน (Save Evidence)
  // -----------------------------------------------------
  const saveEvidence = useCallback(async (data: SaveEvidenceRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await service.saveEvidence(data);
      return success;
    } catch (err: any) {
      console.error("[useCompetency] Save Error:", err);
      const errorMessage = err instanceof Error ? err.message : "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    searchCompetency,
    getCompetencyDetail,
    saveEvidence,
  };
}
