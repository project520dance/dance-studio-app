import { Logo } from "@/components/ui/Logo";

type NavbarProps = {
  portalName: string;
  userName: string;
};

export function Navbar({ portalName, userName }: NavbarProps) {
  const menuItems = ["My Profile", "My Dancers", "Settings", "Logout"];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-slate-500">{portalName}</p>
          </div>
          <details className="relative">
            <summary
              aria-label="Open profile menu"
              className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700"
            >
              {userName.charAt(0)}
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <p className="px-3 py-2 text-xs font-semibold uppercase text-slate-400">Profile menu</p>
              {menuItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {item}
                </button>
              ))}
              <p className="px-3 py-2 text-xs text-slate-400">Coming soon</p>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
