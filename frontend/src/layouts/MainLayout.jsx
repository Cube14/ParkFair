import Sidebar from "../components/Sidebar";
import BackgroundGlow from "../components/BackgroundGlow";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">

      <BackgroundGlow />

      <Sidebar />

      <main
        className="
          relative
          z-10
          p-4
          pt-20
          md:p-10
          md:pt-10
          md:ml-64
        "
      >
        {children}
      </main>

    </div>
  );
}

export default MainLayout;