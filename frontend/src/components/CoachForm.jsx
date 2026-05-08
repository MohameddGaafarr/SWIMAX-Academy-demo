import { useEffect, useState } from "react";

const empty = {
  name: "",
  age: "",
  phone: "",
  address: "",
  bio: "",
  image: null,
};

export default function CoachForm({
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
  const [bio, setBio] = useState(initialValues.bio ?? "");
  const [phone, setPhone] = useState(initialValues.phone ?? "");
  const [address, setAddress] = useState(initialValues.address ?? "");

  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setName(initialValues.name ?? "");
    setAge(
      initialValues.age !== undefined && initialValues.age !== null
        ? String(initialValues.age)
        : ""
    );
    setBio(initialValues.bio ?? "");
    setPhone(initialValues.phone ?? "");
    setAddress(initialValues.address ?? "");
    setErrors({});

    if (initialValues.image) {
      setPreview(initialValues.image);
    } else {
      setPreview(null);
    }

    setImage(null);
  }, [initialValues]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
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
    formData.append("phone", phone.trim());
    formData.append("address", address.trim());
    formData.append("bio", bio);

    if (image) {
      formData.append("image", image);
    }

    await onSubmit(formData);
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {/* IMAGE */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300">
              Coach photo <span className="text-slate-500">(optional)</span>
            </label>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-sky-500/25 bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner ring-1 ring-sky-400/10">
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No photo</span>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-sky-500/20 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-200 hover:file:bg-sky-500/30"
              />
            </div>
          </div>

          {/* NAME */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field !px-3 !py-2"
            />
          </div>

          {/* AGE */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Age
            </label>
            <input
              type="number"
              min={0}
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input-field !px-3 !py-2"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Phone
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field !px-3 !py-2"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field !px-3 !py-2"
            />
          </div>

          {/* BIO */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field min-h-[5rem] resize-y !px-3 !py-2"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 pt-2 pb-14 md:pb-0 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary w-full md:w-auto"
          >
            Cancel
          </button>

          <button type="submit" className="btn-primary w-full md:w-auto">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
