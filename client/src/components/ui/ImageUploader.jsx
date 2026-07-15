import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from "lucide-react";
import { adminService } from "../../services";
import toast from "react-hot-toast";

/**
 * ImageUploader
 * – Tries file upload via /api/upload (works with both Cloudinary and local disk)
 * – Falls back gracefully with a URL-paste tab if needed
 * – Shows preview
 */
const ImageUploader = ({ value, onChange, label = "Image", multiple = false }) => {
  const [mode, setMode]         = useState("file"); // "file" | "url"
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput]   = useState("");
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await adminService.uploadImage(file);
      onChange(res.data.url);
      toast.success("Image uploaded ✓");
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      toast.error(msg + ". Try pasting an image URL instead.");
      setMode("url");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    toast.success("Image URL saved ✓");
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-[#0F172A]">{label}</p>}

      {/* Mode toggle */}
      <div className="flex overflow-hidden rounded-xl border border-[#E2E8F0]">
        {[{ id: "file", icon: Upload, txt: "Upload File" }, { id: "url", icon: LinkIcon, txt: "Paste URL" }].map(({ id, icon: Icon, txt }) => (
          <button key={id} type="button" onClick={() => setMode(id)}
            className={`flex flex-1 items-center justify-center gap-2 py-2 text-xs font-semibold transition ${mode === id ? "bg-[#2563EB] text-white" : "bg-white text-[#64748B] hover:bg-[#F8FAFC]"}`}>
            <Icon size={13} />{txt}
          </button>
        ))}
      </div>

      {mode === "file" && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E2E8F0] py-6 text-sm text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]">
            {uploading ? (
              <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" /> Uploading…</span>
            ) : (
              <><Upload size={16} /> Click to upload image</>
            )}
          </button>
          <p className="mt-1 text-center text-xs text-[#94A3B8]">JPG, PNG, WEBP · Max 5 MB</p>
        </div>
      )}

      {mode === "url" && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="input-field flex-1 text-sm" />
          <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Apply</button>
        </form>
      )}

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="h-24 w-24 rounded-xl object-cover shadow-sm" />
          <button type="button" onClick={() => onChange("")}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-white shadow">
            <X size={11} />
          </button>
        </div>
      )}
      {!value && (
        <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
          <ImageIcon size={22} className="text-[#CBD5E1]" />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
