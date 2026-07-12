import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignInButton from "@/components/SignInButton";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-gray-900 overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Image src="/logo.png" alt="İşimNet" width={100} height={30} className="object-contain" />
          <SignInButton className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all whitespace-nowrap cursor-pointer">
            Uygulamaya Gir →
          </SignInButton>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-5 pt-36 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
          Müşteri Borçları<br />
          ve <span className="text-blue-600">Stok Takibi</span><br />
          Cebinde.
        </h1>
        <p className="text-xl sm:text-2xl text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
          Kağıt kalem bitti. Kim ne borçlu, depoda ne kaldı, bu ay ne sattın — hepsi telefonda.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignInButton className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xl px-10 py-5 rounded-2xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer">
            Google ile Başla →
          </SignInButton>
          <a
            href="#moduller"
            className="bg-white text-gray-700 font-bold text-xl px-10 py-5 rounded-2xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            Nasıl Çalışır?
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="moduller" className="border-y-2 border-black bg-white py-20">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-4xl sm:text-5xl font-black text-center mb-14">3 Modül, 1 Uygulama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="group bg-[#ECEBE9] rounded-3xl p-8 border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Image src="/musteri.png" alt="Müşteri Cari" width={140} height={140} className="object-contain" />
              </div>
              <h3 className="text-2xl font-black mb-2">Müşteri Cari</h3>
              <p className="text-gray-500 text-base leading-relaxed">Kim ne kadar borçlu? Tahsilat yaptın mı? Bir dokunuşta gör.</p>
            </div>
            <div className="group bg-[#EFF1F3] rounded-3xl p-8 border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Image src="/box.png" alt="Stok Yönetimi" width={140} height={140} className="object-contain" />
              </div>
              <h3 className="text-2xl font-black mb-2">Stok Yönetimi</h3>
              <p className="text-gray-500 text-base leading-relaxed">Satış yap, stok otomatik düşer. Elle hesap yok, hata yok.</p>
            </div>
            <div className="group bg-[#EEEEEE] rounded-3xl p-8 border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Image src="/phone-cash.png" alt="Raporlar" width={140} height={140} className="object-contain" />
              </div>
              <h3 className="text-2xl font-black mb-2">Anlık Raporlar</h3>
              <p className="text-gray-500 text-base leading-relaxed">Toplam alacak, mal varlığı, bu ayki satış — hepsi tek ekranda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20">
        <div className="max-w-2xl mx-auto bg-blue-600 rounded-3xl p-12 text-center text-white border-2 border-black shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Hemen Başla.<br />Ücretsiz.
          </h2>
          <p className="text-blue-100 text-lg mb-8">Google hesabınla giriş yap, veriler Drive&apos;ında saklanır.</p>
          <SignInButton className="inline-flex items-center gap-2 bg-white text-blue-600 font-black text-xl px-12 py-5 rounded-2xl border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all whitespace-nowrap cursor-pointer">
            Google ile Giriş Yap →
          </SignInButton>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-black bg-white px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Image src="/logo.png" alt="İşimNet" width={110} height={34} className="object-contain" />
          <p className="text-sm text-gray-400 text-center">Küçük işletmeler için müşteri cari ve stok yönetimi</p>
        </div>
      </footer>

    </div>
  );
}