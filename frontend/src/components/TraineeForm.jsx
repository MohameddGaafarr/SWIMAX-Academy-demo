import { useEffect, useState } from "react";

const LEVELS = [
  "Underwater Skills",
  "Streamline Fundamentales",
  "Float & swim",
  "Stroke Basics",
  "Stroke Development",
  "Star 1&2 Training",
  "Kicks Training",
  "Coordination Training",
  "Star 3 Training",
  "Star 4 Training",
];

const empty = {
  name: "",
  age: "",
  phone: "",
  address: "",
  level: "Underwater Skills",
  notes: "",
  image: "",
};

export default function TraineeForm({
  initialValues = empty,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  submitting = false,
}) {
  const [name, setName] = useState(initialValues.name ?? "");
  const [age, setAge] = useState(
    initialValues.age !== undefined && initialValues.age !== null
      ? String(initialValues.age)
      : ""
  );
  const [level, setLevel] = useState(initialValues.level ?? "Underwater Skills");
  const [notes, setNotes] = useState(initialValues.notes ?? "");
  const [phone, setPhone] = useState(initialValues.phone ?? "");
  const [address, setAddress] = useState(initialValues.address ?? "");
  const [errors, setErrors] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setName(initialValues.name ?? "");
    setAge(
      initialValues.age !== undefined && initialValues.age !== null
        ? String(initialValues.age)
        : ""
    );
    setLevel(initialValues.level ?? "Underwater Skills");
    setNotes(initialValues.notes ?? "");
    setPhone(initialValues.phone ?? "");
    setAddress(initialValues.address ?? "");
    setErrors({});

    if (initialValues.image) {
      setPreview(initialValues.image);
    } else {
      setPreview(null);
    }

    setImageFile(null);
  }, [initialValues]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    const phoneRegex = /^[0-9+\-() ]{7,20}$/;

    if (!name.trim()) nextErrors.name = "Name is required";
    if (!age) nextErrors.age = "Age is required";

    if (!phone.trim()) nextErrors.phone = "Phone is required";
    else if (!phoneRegex.test(phone.trim())) {
      nextErrors.phone = "Phone format is invalid";
    }

    if (!address.trim()) nextErrors.address = "Address is required";
    else if (address.trim().length < 3) {
      nextErrors.address = "Address must be at least 3 characters";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("age", age === "" ? "" : Number(age));
    formData.append("level", level);
    formData.append("phone", phone.trim());
    formData.append("address", address.trim());
    formData.append("notes", notes);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="grid gap-3 md:grid-cols-2">

        {/* IMAGE */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300">
            Photo <span className="text-slate-500">(optional)</span>
          </label>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-slate-800 to-slate-900 text-xl font-semibold text-slate-400 shadow-inner ring-1 ring-cyan-400/10">
              {preview ? (
                <img src={preview} className="h-full w-full object-cover" alt="" />
              ) : (
                name?.charAt(0)?.toUpperCase() || "?"
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-sm file:font-medium file:text-cyan-100 hover:file:bg-cyan-500/30"
            />
          </div>
        </div>

        {/* NAME */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300">Name</label>
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: null }));
            }}
            className="input-field !px-3 !py-2"
          />
        </div>

        {/* AGE */}
        <div>
          <label className="block text-sm font-medium text-slate-300">Age</label>
          <input
            type="number"
            min={0}
            required
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setErrors((prev) => ({ ...prev, age: null }));
            }}
            className="input-field !px-3 !py-2"
          />
          {errors.age ? <p className="mt-1 text-xs text-red-300">{errors.age}</p> : null}
        </div>

        {/* PHONE */}
        <div>
          <label className="block text-sm font-medium text-slate-300">Phone</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors((prev) => ({ ...prev, phone: null }));
            }}
            className="input-field !px-3 !py-2"
          />
          {errors.phone ? <p className="mt-1 text-xs text-red-300">{errors.phone}</p> : null}
        </div>

        {/* 🔥 LEVEL */}
        <div>
          <label className="block text-sm font-medium text-slate-300">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="input-field-select !px-3 !py-2"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* 🔥 ADDRESS جنب Level */}
        <div>
          <label className="block text-sm font-medium text-slate-300">Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setErrors((prev) => ({ ...prev, address: null }));
            }}
            className="input-field !px-3 !py-2"
          />
          {errors.address ? <p className="mt-1 text-xs text-red-300">{errors.address}</p> : null}
        </div>

        {/* NOTES */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300">
            Notes <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field min-h-[6rem] resize-y !px-3 !py-2"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="sticky bottom-[-1px] z-10 -mx-4 mt-4 border-t border-white/10 bg-[rgba(10,22,46,0.92)] px-4 py-3 md:-mx-6 md:px-6">
        <div className="flex flex-col gap-2 pb-14 md:pb-0 md:flex-row md:flex-wrap md:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn-secondary w-full disabled:opacity-50 md:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50 md:w-auto"
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}