import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import NoticeMarquee from "@/components/navigation/NoticeMarquee";
import { resolveMediaUrl } from "@/utils";
import { api } from "@/services/api";
import {
  fetchHomepageSections,
  saveHomePageSection,
  selectHomePageHydrated,
  selectHomePageLoading,
  selectHomePageSaving,
  selectHomePageSections,
} from "@/features/homepage";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_IMAGE_SIZE_MB = 5;

const sectionOrder = [
  "marquee",
  "hero",
  "perks",
  "category",
  "featured",
  "popular",
  "newArrival",
  "promo",
  "firstVisitPopup",
];

const activeMarqueeMessages = (section) =>
  (section.messages || []).filter(
    (message) => message.active !== false && message.text?.trim(),
  );

const MARQUEE_SPEED_OPTIONS = [
  { value: "slow", label: "Slow" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
];

const sectionMeta = {
  marquee: {
    label: "Top Notice Marquee",
    summary: (section) =>
      `${activeMarqueeMessages(section).length} active messages`,
  },
  hero: {
    label: "Hero Section",
    summary: (section) => `${section.slides?.length ?? 0} slides`,
  },
  perks: {
    label: "Perks Section",
    summary: (section) => `${section.items?.length ?? 0} perks`,
  },
  category: { label: "Category Section", summary: (section) => section.title },
  featured: { label: "Featured Products", summary: (section) => section.title },
  popular: { label: "Popular Right Now", summary: (section) => section.title },
  newArrival: { label: "New Arrivals", summary: (section) => section.title },
  promo: {
    label: "Promo Section",
    summary: (section) =>
      `${section.left?.title ?? "Promo"} / ${section.right?.title ?? "Promo"}`,
  },
  firstVisitPopup: {
    label: "First Visit Popup",
    summary: (section) =>
      section.active === false
        ? "Disabled"
        : section.buttonText || "Promotional popup",
  },
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function HomePageManagementView() {
  const dispatch = useDispatch();
  const sections = useSelector(selectHomePageSections);
  const loading = useSelector(selectHomePageLoading);
  const saving = useSelector(selectHomePageSaving);
  const hydrated = useSelector(selectHomePageHydrated);
  const [editorKey, setEditorKey] = useState(null);
  const [draft, setDraft] = useState(null);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null);
  const [uploadingPromoSide, setUploadingPromoSide] = useState(null);
  const heroFileInputRef = useRef(null);
  const heroUploadIndexRef = useRef(null);
  const promoFileInputRef = useRef(null);
  const promoUploadSideRef = useRef(null);

  const isUploadingMedia =
    uploadingSlideIndex !== null || uploadingPromoSide !== null;

  useEffect(() => {
    dispatch(fetchHomepageSections());
  }, [dispatch]);

  const sectionItems = useMemo(
    () => sectionOrder.map((key) => ({ key, ...sections[key] })),
    [sections],
  );

  const openEditor = (key) => {
    setEditorKey(key);
    setDraft(JSON.parse(JSON.stringify(sections[key])));
    setUploadingSlideIndex(null);
    setUploadingPromoSide(null);
  };

  const closeEditor = () => {
    if (isUploadingMedia) {
      toast.error("Please wait for the image upload to finish");
      return;
    }
    setEditorKey(null);
    setDraft(null);
    setUploadingSlideIndex(null);
    setUploadingPromoSide(null);
  };

  const updateDraft = (next) => setDraft(next);

  const updateHeroSlide = (index, patch) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextSlides = [...(prev.slides || [])];
      nextSlides[index] = { ...nextSlides[index], ...patch };
      return { ...prev, slides: nextSlides };
    });
  };

  const updatePromoSide = (side, patch) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [side]: { ...(prev[side] || {}), ...patch },
      };
    });
  };

  const openHeroUpload = (index) => {
    if (isUploadingMedia) return;
    heroUploadIndexRef.current = index;
    heroFileInputRef.current?.click();
  };

  const openPromoUpload = (side) => {
    if (isUploadingMedia) return;
    promoUploadSideRef.current = side;
    promoFileInputRef.current?.click();
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const index = heroUploadIndexRef.current;
    heroUploadIndexRef.current = null;
    if (!file || index == null || !draft) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP, GIF, or AVIF image");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    setUploadingSlideIndex(index);
    try {
      const uploaded = await api.uploadImages(file);
      const first = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      const url = first?.url;
      if (!url) throw new Error("Upload did not return an image URL");
      updateHeroSlide(index, { image: url });
      toast.success("Slide image uploaded");
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to upload image",
      );
    } finally {
      setUploadingSlideIndex(null);
    }
  };

  const handlePromoImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const side = promoUploadSideRef.current;
    promoUploadSideRef.current = null;
    if (!file || !side || !draft) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP, GIF, or AVIF image");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    setUploadingPromoSide(side);
    try {
      const uploaded = await api.uploadImages(file);
      const first = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      const url = first?.url;
      if (!url) throw new Error("Upload did not return an image URL");
      updatePromoSide(side, { image: url });
      toast.success(
        `${side === "left" ? "Left" : "Right"} promo image uploaded`,
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to upload image",
      );
    } finally {
      setUploadingPromoSide(null);
    }
  };

  const saveSection = async () => {
    if (!editorKey || !draft || saving) return;
    if (isUploadingMedia) {
      toast.error("Please wait for the image upload to finish");
      return;
    }
    let data = draft;
    if (editorKey === "marquee") {
      data = {
        ...draft,
        badgeText: draft.badgeText?.trim() || "",
        messages: (draft.messages || [])
          .map((message) => ({ ...message, text: message.text?.trim() || "" }))
          .filter((message) => message.text),
      };
      if (data.active !== false && !activeMarqueeMessages(data).length) {
        toast.error("Add at least one active message or turn the marquee off");
        return;
      }
    }
    try {
      await dispatch(
        saveHomePageSection({ sectionKey: editorKey, data }),
      ).unwrap();
      toast.success(`${sectionMeta[editorKey]?.label ?? "Section"} saved`);
      setEditorKey(null);
      setDraft(null);
      setUploadingSlideIndex(null);
      setUploadingPromoSide(null);
    } catch (err) {
      toast.error(err || "Failed to save section");
    }
  };

  const renderFieldValue = (sectionKey, field, value) => {
    if (typeof value === "boolean") {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span>{field}</span>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) =>
              updateDraft({
                ...draft,
                [field]: e.target.checked,
              })
            }
            className="h-4 w-4"
          />
        </label>
      );
    }

    return (
      <Input
        label={field}
        value={value ?? ""}
        onChange={(e) =>
          updateDraft({
            ...draft,
            [field]: e.target.value,
          })
        }
      />
    );
  };

  const renderSectionEditor = () => {
    if (!editorKey || !draft) return null;

    if (editorKey === "marquee") {
      const messages = draft.messages || [];
      const updateMessage = (index, patch) => {
        const nextMessages = [...messages];
        nextMessages[index] = { ...nextMessages[index], ...patch };
        updateDraft({ ...draft, messages: nextMessages });
      };
      const previewMessages = activeMarqueeMessages(draft);

      return (
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span>Marquee active</span>
            <input
              type="checkbox"
              checked={draft.active ?? true}
              onChange={(e) =>
                updateDraft({ ...draft, active: e.target.checked })
              }
              className="h-4 w-4"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Badge text"
              value={draft.badgeText || ""}
              onChange={(e) =>
                updateDraft({ ...draft, badgeText: e.target.value })
              }
              placeholder="e.g. জরুরি নোটিশ"
              maxLength={40}
            />
            <div>
              <label
                htmlFor="marquee-speed"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Scroll speed
              </label>
              <select
                id="marquee-speed"
                value={draft.speed || "normal"}
                onChange={(e) =>
                  updateDraft({ ...draft, speed: e.target.value })
                }
                className="input-base"
              >
                {MARQUEE_SPEED_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Messages</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={PlusIcon}
              onClick={() =>
                updateDraft({
                  ...draft,
                  messages: [
                    ...messages,
                    { id: makeId(), text: "", active: true },
                  ],
                })
              }
            >
              Add message
            </Button>
          </div>

          {messages.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">
              No messages yet. Add one to show the marquee.
            </p>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">
                  Message {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={message.active ?? true}
                      onChange={(e) =>
                        updateMessage(index, { active: e.target.checked })
                      }
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft({
                        ...draft,
                        messages: messages.filter((_, i) => i !== index),
                      })
                    }
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    aria-label="Remove message"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Input
                value={message.text || ""}
                onChange={(e) => updateMessage(index, { text: e.target.value })}
                placeholder="Write the notice text"
                maxLength={300}
                aria-label={`Message ${index + 1}`}
              />
            </div>
          ))}

          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Preview</p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {draft.active !== false && previewMessages.length ? (
                <NoticeMarquee
                  badgeText={draft.badgeText?.trim()}
                  messages={previewMessages}
                  speed={draft.speed}
                />
              ) : (
                <p className="px-3 py-2.5 text-sm text-slate-400">
                  The marquee is hidden on the storefront.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (editorKey === "hero") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Slides</h3>
            <Button
              type="button"
              variant="outline"
              leftIcon={PlusIcon}
              onClick={() =>
                updateDraft({
                  ...draft,
                  slides: [
                    ...draft.slides,
                    {
                      id: makeId(),
                      image: "",
                      subtitle: "New Slide",
                      title: "New Hero Slide",
                      description: "Describe this slide",
                      buttonText: "Learn More",
                      buttonUrl: "/products",
                      active: true,
                    },
                  ],
                })
              }
            >
              Add slide
            </Button>
          </div>

          {draft.slides?.map((slide, index) => (
            <div
              key={slide.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">
                  Slide {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={slide.active}
                      onChange={(e) => {
                        const nextSlides = [...draft.slides];
                        nextSlides[index] = {
                          ...slide,
                          active: e.target.checked,
                        };
                        updateDraft({ ...draft, slides: nextSlides });
                      }}
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextSlides = draft.slides.filter(
                        (_, i) => i !== index,
                      );
                      updateDraft({ ...draft, slides: nextSlides });
                    }}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    aria-label="Remove slide"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-3">
                  <Input
                    label="Image URL"
                    value={slide.image || ""}
                    onChange={(e) =>
                      updateHeroSlide(index, { image: e.target.value })
                    }
                    placeholder="https://… or upload below"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={ArrowUpTrayIcon}
                      loading={uploadingSlideIndex === index}
                      onClick={() => openHeroUpload(index)}
                    >
                      {uploadingSlideIndex === index
                        ? "Uploading…"
                        : "Upload image"}
                    </Button>
                    {slide.image ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploadingSlideIndex === index}
                        onClick={() => updateHeroSlide(index, { image: "" })}
                      >
                        Clear image
                      </Button>
                    ) : null}
                    <p className="text-xs text-slate-400">
                      JPG, PNG, WebP, GIF, or AVIF · max {MAX_IMAGE_SIZE_MB}MB
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {slide.image ? (
                      <img
                        src={resolveMediaUrl(slide.image)}
                        alt={slide.title || `Slide ${index + 1}`}
                        className="h-40 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
                        <PhotoIcon className="h-8 w-8" />
                        <p className="text-xs">Slide image preview</p>
                      </div>
                    )}
                  </div>
                </div>
                <Input
                  label="Subtitle"
                  value={slide.subtitle || ""}
                  onChange={(e) =>
                    updateHeroSlide(index, { subtitle: e.target.value })
                  }
                />
                <Input
                  label="Title"
                  value={slide.title || ""}
                  onChange={(e) =>
                    updateHeroSlide(index, { title: e.target.value })
                  }
                />
                <Input
                  label="Description"
                  value={slide.description || ""}
                  onChange={(e) =>
                    updateHeroSlide(index, { description: e.target.value })
                  }
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="Button text"
                    value={slide.buttonText || ""}
                    onChange={(e) =>
                      updateHeroSlide(index, { buttonText: e.target.value })
                    }
                  />
                  <Input
                    label="Button URL"
                    value={slide.buttonUrl || ""}
                    onChange={(e) =>
                      updateHeroSlide(index, { buttonUrl: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextSlides = [...draft.slides];
                      const temp = nextSlides[index - 1];
                      nextSlides[index - 1] = nextSlides[index];
                      nextSlides[index] = temp;
                      updateDraft({ ...draft, slides: nextSlides });
                    }}
                    disabled={index === 0}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextSlides = [...draft.slides];
                      const temp = nextSlides[index + 1];
                      nextSlides[index + 1] = nextSlides[index];
                      nextSlides[index] = temp;
                      updateDraft({ ...draft, slides: nextSlides });
                    }}
                    disabled={index === draft.slides.length - 1}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Move down
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (editorKey === "perks") {
      return (
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span>Section active</span>
            <input
              type="checkbox"
              checked={draft.active ?? true}
              onChange={(e) =>
                updateDraft({ ...draft, active: e.target.checked })
              }
              className="h-4 w-4"
            />
          </label>
          {draft.items?.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Perk {index + 1}
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={item.active ?? true}
                    onChange={(e) => {
                      const nextItems = [...draft.items];
                      nextItems[index] = { ...item, active: e.target.checked };
                      updateDraft({ ...draft, items: nextItems });
                    }}
                  />
                  Active
                </label>
              </div>
              <div className="space-y-3">
                <Input
                  label="Title"
                  value={item.title || ""}
                  onChange={(e) => {
                    const nextItems = [...draft.items];
                    nextItems[index] = { ...item, title: e.target.value };
                    updateDraft({ ...draft, items: nextItems });
                  }}
                />
                <Input
                  label="Description"
                  value={item.desc || ""}
                  onChange={(e) => {
                    const nextItems = [...draft.items];
                    nextItems[index] = { ...item, desc: e.target.value };
                    updateDraft({ ...draft, items: nextItems });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (["category", "featured", "popular", "newArrival"].includes(editorKey)) {
      return (
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span>Section active</span>
            <input
              type="checkbox"
              checked={draft.active ?? true}
              onChange={(e) =>
                updateDraft({ ...draft, active: e.target.checked })
              }
              className="h-4 w-4"
            />
          </label>
          <Input
            label="Title"
            value={draft.title || ""}
            onChange={(e) => updateDraft({ ...draft, title: e.target.value })}
          />
          <Input
            label="Subtitle"
            value={draft.subtitle || ""}
            onChange={(e) =>
              updateDraft({ ...draft, subtitle: e.target.value })
            }
          />
        </div>
      );
    }

    if (editorKey === "promo") {
      return (
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span>Section active</span>
            <input
              type="checkbox"
              checked={draft.active ?? true}
              onChange={(e) =>
                updateDraft({ ...draft, active: e.target.checked })
              }
              className="h-4 w-4"
            />
          </label>
          {Object.entries({
            left: "Left promo block",
            right: "Right promo block",
          }).map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="mb-3 text-sm font-semibold text-slate-700">
                {label}
              </p>
              <div className="space-y-3">
                <Input
                  label="Eyebrow"
                  value={draft[key]?.eyebrow || ""}
                  onChange={(e) =>
                    updateDraft({
                      ...draft,
                      [key]: { ...draft[key], eyebrow: e.target.value },
                    })
                  }
                />
                <Input
                  label="Title"
                  value={draft[key]?.title || ""}
                  onChange={(e) =>
                    updateDraft({
                      ...draft,
                      [key]: { ...draft[key], title: e.target.value },
                    })
                  }
                />
                <Input
                  label="Description"
                  value={draft[key]?.description || ""}
                  onChange={(e) =>
                    updateDraft({
                      ...draft,
                      [key]: { ...draft[key], description: e.target.value },
                    })
                  }
                />
                <Input
                  label="Button text"
                  value={draft[key]?.buttonText || ""}
                  onChange={(e) =>
                    updateDraft({
                      ...draft,
                      [key]: { ...draft[key], buttonText: e.target.value },
                    })
                  }
                />
                <Input
                  label="Button URL"
                  value={draft[key]?.buttonUrl || ""}
                  onChange={(e) =>
                    updateDraft({
                      ...draft,
                      [key]: { ...draft[key], buttonUrl: e.target.value },
                    })
                  }
                />
                <Input
                  label="Image URL"
                  value={draft[key]?.image || ""}
                  onChange={(e) =>
                    updatePromoSide(key, { image: e.target.value })
                  }
                  placeholder="https://… or upload below"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={ArrowUpTrayIcon}
                    loading={uploadingPromoSide === key}
                    disabled={isUploadingMedia && uploadingPromoSide !== key}
                    onClick={() => openPromoUpload(key)}
                  >
                    {uploadingPromoSide === key ? "Uploading…" : "Upload image"}
                  </Button>
                  {draft[key]?.image ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isUploadingMedia}
                      onClick={() => updatePromoSide(key, { image: "" })}
                    >
                      Clear image
                    </Button>
                  ) : null}
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WebP, GIF, or AVIF · max {MAX_IMAGE_SIZE_MB}MB
                  </p>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {draft[key]?.image ? (
                    <img
                      src={resolveMediaUrl(draft[key].image)}
                      alt={draft[key]?.title || `${label} preview`}
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
                      <PhotoIcon className="h-8 w-8" />
                      <p className="text-xs">Promo image preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (editorKey === "firstVisitPopup") {
      return (
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span>Popup active</span>
            <input
              type="checkbox"
              checked={draft.active ?? true}
              onChange={(e) =>
                updateDraft({ ...draft, active: e.target.checked })
              }
              className="h-4 w-4"
            />
          </label>
          <Input
            label="Image URL"
            value={draft.image || ""}
            onChange={(e) => updateDraft({ ...draft, image: e.target.value })}
          />
          {draft.image ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img
                src={resolveMediaUrl(draft.image)}
                alt={draft.alt || "Popup preview"}
                className="h-40 w-full object-cover"
              />
            </div>
          ) : null}
          <Input
            label="Image alt text"
            value={draft.alt || ""}
            onChange={(e) => updateDraft({ ...draft, alt: e.target.value })}
          />
          <Input
            label="Button text"
            value={draft.buttonText || ""}
            onChange={(e) =>
              updateDraft({ ...draft, buttonText: e.target.value })
            }
          />
          <Input
            label="Button URL"
            value={draft.buttonUrl || ""}
            onChange={(e) =>
              updateDraft({ ...draft, buttonUrl: e.target.value })
            }
          />
          <p className="text-xs text-slate-500">
            Shown once per browser tab/session. Closing it stores dismissal in
            sessionStorage only.
          </p>
        </div>
      );
    }

    return null;
  };

  if (loading && !hydrated) {
    return <LoadingSpinner className="py-16" label="Loading homepage..." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Home Page Management"
        subtitle="Manage and update the public storefront sections from one place."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sectionItems.map((section) => (
          <div key={section.key} className="card flex h-full flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {sectionMeta[section.key]?.label ?? section.label}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {sectionMeta[section.key]?.summary?.(section) ??
                    "Section overview"}
                </p>
              </div>
              <Badge color={section.active === false ? "gray" : "green"}>
                {section.active === false ? "Inactive" : "Active"}
              </Badge>
            </div>

            <div className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
              {section.key === "marquee" && (
                <p className="truncate">
                  {activeMarqueeMessages(section)[0]?.text || "No messages"}
                </p>
              )}
              {section.key === "hero" && (
                <p>
                  {section.slides?.filter((slide) => slide.active).length ?? 0}{" "}
                  active slides
                </p>
              )}
              {section.key === "perks" && (
                <p>
                  {section.items?.filter((item) => item.active !== false)
                    .length ?? 0}{" "}
                  active perks
                </p>
              )}
              {section.key === "category" && <p>{section.title}</p>}
              {section.key === "promo" && (
                <p>
                  {section.left?.title} · {section.right?.title}
                </p>
              )}
              {section.key === "firstVisitPopup" && (
                <p className="truncate">{section.image || "No image set"}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => openEditor(section.key)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit / Update
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={!!editorKey}
        onClose={closeEditor}
        title={sectionMeta[editorKey]?.label ?? "Section Editor"}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeEditor}
              disabled={saving || isUploadingMedia}
            >
              Cancel
            </Button>
            <Button
              onClick={saveSection}
              loading={saving}
              disabled={isUploadingMedia}
            >
              Save / Update
            </Button>
          </>
        }
      >
        {editorKey === "hero" && (
          <input
            ref={heroFileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleHeroImageUpload}
          />
        )}
        {editorKey === "promo" && (
          <input
            ref={promoFileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handlePromoImageUpload}
          />
        )}
        {renderSectionEditor()}
      </Modal>
    </div>
  );
}
