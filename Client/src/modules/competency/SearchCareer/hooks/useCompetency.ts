import { useState, useCallback, useRef } from "react";
import { CompetencyService, CompetencySearchResult, CompetencyDetail, SaveEvidenceRequest, DeleteEvidenceRequest } from "../services/competencyService";

const service = new CompetencyService();

// Helper function เพื่อดึง Error Message อย่างปลอดภัย
const extractErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err instanceof Error) {
    if (err.name === "AbortError") return "";
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return defaultMessage;
};

export function useCompetency() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // -----------------------------------------------------
  // 1. Hook สำหรับค้นหา (Search) - เพิ่ม Abort Logic
  // -----------------------------------------------------
  const searchCompetency = useCallback(async (keyword: string): Promise<CompetencySearchResult[]> => {
    // 1. ยกเลิก Request ก่อนหน้า (ถ้ามี)
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    // 2. สร้าง Controller ใหม่สำหรับรอบนี้
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // หมายเหตุ: ถ้าใน service.search รองรับ signal ให้ส่ง { signal: controller.signal } ไปด้วยจะดีที่สุด
      // แต่ถ้าไม่รองรับ Logic นี้ก็ยังช่วยกันผลลัพธ์เก่าทับใหม่ที่หน้าจอได้อยู่ครับ
      const result = await service.search(keyword /*, { signal: controller.signal } */);

      return result;
    } catch (err: unknown) {
      // ถ้า Error เกิดจากการ Abort (ยกเลิก) เราจะไม่นับว่าเป็น Error จริง
      if (err instanceof Error && err.name === "AbortError") {
        return [];
      }

      const msg = extractErrorMessage(err, "เกิดข้อผิดพลาดในการค้นหาข้อมูล กรุณาลองใหม่อีกครั้ง");
      console.error("[useCompetency] Search Error:", err);
      setError(msg);
      return [];
    } finally {
      // เช็คว่า Controller ปัจจุบันยังเป็นตัวเดียวกับที่สั่งงานไหม
      // เพื่อป้องกันการปิด Loading ในขณะที่ Request ใหม่กำลังทำงานอยู่
      if (searchAbortRef.current === controller) {
        setLoading(false);
        searchAbortRef.current = null;
      }
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
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "ไม่สามารถโหลดรายละเอียดข้อมูลได้");
      console.error("[useCompetency] Detail Error:", err);
      setError(msg);
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
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      console.error("[useCompetency] Save Error:", err);
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------
  // 4. Hook สำหรับลบหลักฐาน (Delete Evidence)
  // -----------------------------------------------------
  const deleteEvidence = useCallback(async (data: DeleteEvidenceRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await service.deleteEvidence(data);
      return success;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      console.error("[useCompetency] Delete Error:", err);
      setError(msg);
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
    deleteEvidence,
  };
}
