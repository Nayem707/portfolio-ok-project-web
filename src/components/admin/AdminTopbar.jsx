import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Dropdown, { DropdownItem } from "@/components/common/Dropdown";
import { toggleAdminSidebar } from "@/store/slices/uiSlice";
import { logout, selectCurrentUser } from "@/store/slices/authSlice";

export default function AdminTopbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <button
          onClick={() => dispatch(toggleAdminSidebar(true))}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Dropdown
            trigger={
              <span className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <BellIcon className="h-6 w-6" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-500" />
              </span>
            }
          >
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Notifications
              </p>
            </div>
            <DropdownItem>New order ORD-10235 placed</DropdownItem>
            <DropdownItem>3 products low in stock</DropdownItem>
            <DropdownItem>New user registered</DropdownItem>
          </Dropdown>

          <Dropdown
            trigger={
              <span className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-slate-100">
                <img
                  src={user?.avatar || "https://i.pravatar.cc/150?img=15"}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  {user?.name}
                </span>
                <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 sm:block" />
              </span>
            }
          >
            <DropdownItem onClick={() => navigate("/account")}>
              <UserCircleIcon className="h-4.5 w-4.5" /> My Account
            </DropdownItem>
            <DropdownItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon className="h-4.5 w-4.5" /> Sign out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
