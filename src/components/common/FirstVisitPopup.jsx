import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { APP_NAME } from "@/constants";
import { resolveMediaUrl } from "@/utils";
import {
  fetchHomepageSections,
  selectFirstVisitPopup,
  selectHomePageHydrated,
} from "@/features/homepage";

const SESSION_KEY = "firstVisitPopupDismissed";

function wasDismissed() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    // Ignore storage failures; popup still closes for this visit.
  }
}

export default function FirstVisitPopup() {
  const dispatch = useDispatch();
  const popup = useSelector(selectFirstVisitPopup);
  const hydrated = useSelector(selectHomePageHydrated);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      dispatch(fetchHomepageSections());
    }
  }, [dispatch, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!popup || popup.active === false || !popup.image) {
      setOpen(false);
      return;
    }
    if (wasDismissed()) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [hydrated, popup]);

  const dismiss = () => {
    markDismissed();
    setOpen(false);
  };

  if (!popup?.image) return null;

  const buttonUrl = popup.buttonUrl || "/products";
  const buttonText = popup.buttonText || "Shop Now";
  const isExternal = /^https?:\/\//i.test(buttonUrl);

  return (
    <Modal
      open={open}
      onClose={dismiss}
      size="xl"
      flush
      className="max-w-[min(92vw,24rem)] bg-slate-900 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
    >
      <div className="relative h-[min(78vh,32rem)] w-full sm:h-[min(72vh,34rem)] md:h-[min(68vh,30rem)]">
        <img
          src={resolveMediaUrl(popup.image)}
          alt={popup.alt || `${APP_NAME} promotion`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-black/30"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white sm:top-4 sm:right-4"
          aria-label="Close promotional popup"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-5 pb-6 sm:px-8 sm:pb-8 md:pb-10">
          {isExternal ? (
            <Button
              as="a"
              href={buttonUrl}
              size="lg"
              onClick={dismiss}
              className="min-w-[11rem] shadow-lg sm:min-w-[13rem]"
            >
              {buttonText}
            </Button>
          ) : (
            <Button
              as={Link}
              to={buttonUrl}
              size="lg"
              onClick={dismiss}
              className="min-w-[11rem] shadow-lg sm:min-w-[13rem]"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
