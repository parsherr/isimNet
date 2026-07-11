import Link from "next/link";

interface MenuCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function MenuCard({ href, title, description, icon, iconBg }: MenuCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-[0.98]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-base">{title}</p>
        <p className="text-gray-400 text-sm mt-0.5">{description}</p>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.2}
          stroke="#94A3B8"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}