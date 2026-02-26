"use client";

type LogoutConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-2 text-center">
          <h2 className="text-xl font-bold text-gray-900">ミリネからログアウトしますか？</h2>
          <p className="mt-2 text-sm text-gray-500">
            このアカウントにのみ適用されます。他のアカウントにはログインしたままです。
          </p>
        </div>
        <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full bg-gray-900 text-white py-3 rounded-full font-semibold hover:bg-gray-800"
          >
            ログアウト
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-white text-gray-900 py-3 rounded-full font-semibold border border-gray-300 hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
