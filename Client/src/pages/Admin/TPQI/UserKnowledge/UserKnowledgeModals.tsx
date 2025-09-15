import React from "react";
import { Modal, Button, LoadingButton } from "@Components/Common/ExportComponent";
import { KnowledgeApprovalStatus } from "@Types/tpqi/userKnowledgeTypes";

interface EditUserKnowledgeStatusModalProps {
  isOpen: boolean;
  initialStatus: KnowledgeApprovalStatus | null | undefined;
  onClose: () => void;
  onConfirm: (status: KnowledgeApprovalStatus | null) => void;
  isLoading?: boolean;
}

const STATUS_META: Record<
  KnowledgeApprovalStatus,
  { label: string; desc: string; badgeClass: string; cardRing: string }
> = {
  [KnowledgeApprovalStatus.APPROVED]: {
    label: "APPROVED",
    desc: "ผ่านการตรวจสอบแล้ว ผู้ใช้สามารถนำไปอ้างอิงได้",
    badgeClass:
      "bg-green-100 text-green-800 border border-green-200",
    cardRing: "ring-2 ring-green-500/70",
  },
  [KnowledgeApprovalStatus.NOT_APPROVED]: {
    label: "NOT_APPROVED",
    desc: "ยังไม่ผ่านการตรวจสอบ หรือจำเป็นต้องแก้ไข",
    badgeClass:
      "bg-rose-100 text-rose-800 border border-rose-200",
    cardRing: "ring-2 ring-rose-500/70",
  },
};

export const EditUserKnowledgeStatusModal: React.FC<EditUserKnowledgeStatusModalProps> = ({
  isOpen,
  initialStatus,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [status, setStatus] = React.useState<KnowledgeApprovalStatus | null>(initialStatus ?? null);
  const onPick = (value: KnowledgeApprovalStatus) => setStatus(value);

  React.useEffect(() => {
    setStatus(initialStatus ?? null);
  }, [initialStatus]);

  return (
    <Modal
      className="z-50"
      isOpen={isOpen}
      onClose={onClose}
      title="Update UserKnowledge Status"
      actions={
        <>
          <Button
            className="!bg-black !text-white hover:!bg-gray-800"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={() => onConfirm(status)}
            isLoading={isLoading}
            loadingText="Saving..."
          >
            Save
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((key) => {
            const meta = STATUS_META[key];
            const selected = status === key;
            return (
              <button
                key={key as string}
                type="button"
                onClick={() => onPick(key)}
                className={[
                  "w-full text-left rounded-2xl border p-4 transition",
                  "hover:shadow-md focus:outline-none",
                  selected ? meta.cardRing + " bg-white" : "hover:border-gray-300 bg-white",
                ].join(" ")}
                aria-pressed={selected}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-medium">{meta.label}</div>
                    <div className="text-xs text-gray-600">{meta.desc}</div>
                  </div>
                  <div
                    className={[
                      "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center",
                      selected ? "border-gray-900" : "border-gray-300",
                    ].join(" ")}
                    aria-hidden
                  >
                    {selected && (
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <path
                          d="M20 7L9 18l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};