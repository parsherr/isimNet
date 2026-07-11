interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Yeni Ürün Ekle"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-[0.92]"
      style={{
        background: "#2563EB",
        boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="white"
        className="w-6 h-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  );
}